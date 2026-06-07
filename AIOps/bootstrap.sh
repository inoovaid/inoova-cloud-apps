#!/bin/bash
# =============================================================
# bootstrap.sh — AI Platform (Ollama + OpenWebUI + Dify + n8n)
# inoovaid/inoova-cloud-apps · domínio: dnn.lat
# =============================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[OK]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERR]${NC}  $*"; exit 1; }

# ── Verificação de prerequisitos ──────────────────────────────
info "Verificando prerequisitos..."
command -v kubectl  >/dev/null || error "kubectl não encontrado"
command -v git      >/dev/null || error "git não encontrado"
command -v openssl  >/dev/null || error "openssl não encontrado"

kubectl cluster-info --request-timeout=5s >/dev/null 2>&1 || error "Cluster não acessível"
kubectl get ns argocd >/dev/null 2>&1               || error "Namespace argocd não encontrado — ArgoCD instalado?"

success "Prerequisitos OK"

# ── Storage no k8s-worker-ai ──────────────────────────────────
info "Criando diretório de modelos no k8s-worker-ai..."
ssh -f k8s-worker-ai "sudo mkdir -p /data/ollama && sudo chmod 777 /data/ollama" \
  && success "/data/ollama criado" \
  || warn "Não foi possível criar via SSH — criar manualmente: sudo mkdir -p /data/ollama && sudo chmod 777 /data/ollama"

# ── PostgreSQL: criar databases ───────────────────────────────
# ── PostgreSQL: criar databases ───────────────────────────────
info "Verificando PostgreSQL CNPG..."

# CORREÇÃO: Alterado de postgres-ha-superuser para postgres-superuser conforme seu cluster
PGPASSWORD=$(kubectl get secret postgres-superuser -n default \
  -o jsonpath='{.data.password}' 2>/dev/null | base64 -d) \
  || error "Secret 'postgres-superuser' não encontrado em default. Verifique: kubectl get secrets -n default | grep postgres"

success "PostgreSQL credenciais obtidas"

# CORREÇÃO: Adicionado 'techcrm' na lista caso ele também precise ser verificado/criado
for db in openwebui n8n dify techcrm; do
  # Executa o comando psql usando o usuário padrão 'postgres' dentro do pod do CNPG
  kubectl exec -n default postgres-ha-1 -- \
    env PGPASSWORD="$PGPASSWORD" psql -U postgres -c "CREATE DATABASE ${db};" 2>/dev/null \
    && success "Database '${db}' criado" \
    || warn "Database '${db}' já existe ou erro na criação (ok)"
done

# ── Secrets (NÃO vão para o Git) ──────────────────────────────
info "Criando namespaces antes dos secrets..."

# CORREÇÃO: Garante dinamicamente todos os namespaces utilizados nas suas secrets
for ns in ai-interfaces ai-automation ai-system argocd default; do
  kubectl create namespace ${ns} --dry-run=client -o yaml | kubectl apply -f - \
    && success "Namespace '${ns}' garantido"
done

info "Criando secret do OpenWebUI..."
kubectl create secret generic openwebui-secrets \
  --namespace ai-interfaces \
  --from-literal=secret-key="$(openssl rand -hex 32)" \
  --from-literal=database-url="postgresql://appuser:${PGPASSWORD}@postgres-ha-rw.default.svc.cluster.local:5432/openwebui" \
  --save-config --dry-run=client -o yaml | kubectl apply -f -
success "openwebui-secrets criado"

info "Criando secret do n8n..."
kubectl create secret generic n8n-secrets \
  --namespace ai-automation \
  --from-literal=db-password="${PGPASSWORD}" \
  --from-literal=encryption-key="$(openssl rand -hex 32)" \
  --from-literal=jwt-secret="$(openssl rand -hex 32)" \
  --save-config --dry-run=client -o yaml | kubectl apply -f -
success "n8n-secrets criado"

info "Criando secret do Dify..."
echo ""
echo -n "  MinIO user (ex: minioadmin): "; read MINIO_USER
echo -n "  MinIO password: "; read -s MINIO_PASS; echo ""
kubectl create secret generic dify-secrets \
  --namespace ai-interfaces \
  --from-literal=secret-key="$(openssl rand -hex 32)" \
  --from-literal=db-password="${PGPASSWORD}" \
  --from-literal=minio-access-key="${MINIO_USER}" \
  --from-literal=minio-secret-key="${MINIO_PASS}" \
  --save-config --dry-run=client -o yaml | kubectl apply -f -
success "dify-secrets criado"

info "Criando secret ArgoCD MCP..."
kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: mcp-agent
  namespace: argocd
EOF
ARGOCD_TOKEN=$(kubectl create token mcp-agent -n argocd --duration=8760h)
kubectl create secret generic argocd-mcp-token \
  --namespace ai-system \
  --from-literal=token="${ARGOCD_TOKEN}" \
  --save-config --dry-run=client -o yaml | kubectl apply -f -
success "argocd-mcp-token criado"

info "Criando secret Git MCP..."
echo ""
echo -n "  GitHub token (read/write no repo): "; read -s GIT_TOKEN; echo ""
kubectl create secret generic git-mcp-config \
  --namespace ai-system \
  --from-literal=repo-url="https://github.com/inoovaid/inoova-cloud-apps.git" \
  --from-literal=token="${GIT_TOKEN}" \
  --from-literal=user-email="ai-agent@inoova.com" \
  --from-literal=user-name="Inoova AI Agent" \
  --save-config --dry-run=client -o yaml | kubectl apply -f -
success "git-mcp-config criado"


# ── MinIO bucket para Dify ────────────────────────────────────
info "Criando bucket 'dify' no MinIO..."
kubectl exec -n observability deployment/minio -- \
  mc alias set local http://localhost:9000 "${MINIO_USER}" "${MINIO_PASS}" 2>/dev/null || true
kubectl exec -n observability deployment/minio -- \
  mc mb local/dify 2>/dev/null \
  && success "Bucket 'dify' criado" \
  || warn "Bucket 'dify' já existe (ok)"

# ── RBAC ──────────────────────────────────────────────────────
info "Aplicando RBAC..."
kubectl apply -f AIOps/rbac/ai-agent-rbac.yaml
success "RBAC aplicado"

# ── ArgoCD AppProject + Applications ─────────────────────────
info "Aplicando ArgoCD AppProject e Applications..."
kubectl apply -f AIOps/argocd/apps/appproject-ai.yaml
kubectl apply -f AIOps/argocd/apps/
success "ArgoCD Applications criados"

# ── Dify via Helm ─────────────────────────────────────────────
info "Instalando Dify via Helm..."

# CORREÇÃO: Adiciona e atualiza sequencialmente sem ocultar erros cruciais
helm repo add dify https://langgenius.github.io/dify-helm
helm repo update dify

helm upgrade --install dify dify/dify \
  --namespace ai-interfaces \
  --create-namespace \
  -f AIOps/apps/ai-interfaces/dify/values.yaml \
  --wait --timeout=5m \
  && success "Dify instalado" \
  || warn "Dify falhou — verificar: kubectl get pods -n ai-interfaces"

# ── Resumo ────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Bootstrap concluído!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""
echo "  ArgoCD sincronizará os apps automaticamente."
echo "  Acompanhe:"
echo "    kubectl get applications -n argocd -w"
echo "    kubectl get pods -n ai-system -w"
echo ""
echo "  Ollama pull do modelo (aguardar ~5-15 min no 1º boot):"
echo "    kubectl logs -f -n ai-system deployment/ollama"
echo ""
echo "  URLs (após DNS apontar para seu LoadBalancer):"
echo "    https://ai.dnn.lat    — OpenWebUI"
echo "    https://dify.dnn.lat  — Dify"
echo "    https://n8n.dnn.lat   — n8n"
echo ""
echo "  IP do LoadBalancer:"
kubectl get svc -n ingress-nginx ingress-nginx-controller \
  -o jsonpath='    {.status.loadBalancer.ingress[0].ip}{"\n"}' 2>/dev/null || \
  echo "    kubectl get svc -n ingress-nginx ingress-nginx-controller"
