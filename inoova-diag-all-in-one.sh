#!/bin/bash

# =============================================
# INOOVA CLOUD - DIAGNÓSTICO COMPLETO (ALL-IN-ONE)
# Autor: Mistral Large (para José)
# Descrição: Extrai TUDO do cluster Kubernetes em um único arquivo.
# Uso: ./inoova-diag-all-in-one.sh > inoova-diag-all.log 2>&1
# =============================================

# Variáveis
NODE_PROBLEMATICO="k8s-worker-ai"
NODE_IP="10.10.30.14"
OUTPUT_FILE="inoova-diag-all.log"
DIR_TMP="/tmp/inoova-diag-$$"
mkdir -p "$DIR_TMP"

# Função para separador
separador() {
  echo -e "\n\n========================================\n=== $1\n========================================\n"
}

# =============================================
# 1. INFORMAÇÕES GERAIS DO CLUSTER
# =============================================
separador "INFORMAÇÕES GERAIS DO CLUSTER"
kubectl version
kubectl cluster-info
kubectl get nodes -o wide
kubectl top nodes
kubectl get namespaces -o wide

# =============================================
# 2. DIAGNÓSTICO DO NODE PROBLEMÁTICO (k8s-worker-ai)
# =============================================
separador "DIAGNÓSTICO DO NODE $NODE_PROBLEMATICO"
kubectl describe node "$NODE_PROBLEMATICO"
kubectl get pods -A --field-selector spec.nodeName="$NODE_PROBLEMATICO" -o wide

# SSH no node problemático (logs locais)
separador "LOGS LOCAIS DO NODE $NODE_PROBLEMATICO (SSH)"
ssh devops@"$NODE_IP" << 'EOF' 2>&1
  echo "=== HOSTNAME ==="
  hostname
  echo -e "\n=== UPTIME ==="
  uptime
  echo -e "\n=== MEMORY ==="
  free -h
  echo -e "\n=== DISK ==="
  df -h
  echo -e "\n=== KUBELET STATUS ==="
  systemctl status kubelet --no-pager
  echo -e "\n=== KUBELET LOGS (últimos 1000) ==="
  journalctl -u kubelet -n 1000 --no-pager
  echo -e "\n=== CONTAINERD STATUS ==="
  systemctl status containerd --no-pager
  echo -e "\n=== CONTAINERD LOGS (últimos 1000) ==="
  journalctl -u containerd -n 1000 --no-pager
  echo -e "\n=== NVIDIA-SMI ==="
  nvidia-smi
  echo -e "\n=== NVIDIA-SMI -q ==="
  nvidia-smi -q
  echo -e "\n=== DMESG (erros NVIDIA/GPU) ==="
  dmesg -T | grep -i -E "nvidia|nvrm|gpu|xid|error|fail"
  echo -e "\n=== DMESG (XID errors) ==="
  dmesg | grep -i xid
EOF

# =============================================
# 3. LOGS DE TODOS OS PODS (ATUAIS E ANTERIORES)
# =============================================
separador "LOGS DE TODOS OS PODS (ATUAIS)"
kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.namespace}{" "}{.metadata.name}{"\n"}{end}' | while read NS POD; do
  echo -e "\n=== LOGS DO POD $NS/$POD ==="
  kubectl logs -n "$NS" "$POD" --all-containers=true --tail=200 2>/dev/null || echo "ERRO: Não foi possível obter logs de $NS/$POD"
done

separador "LOGS ANTERIORES DE PODS (--previous)"
kubectl get pods -A -o jsonpath='{range .items[*]}{.metadata.namespace}{" "}{.metadata.name}{"\n"}{end}' | while read NS POD; do
  echo -e "\n=== LOGS ANTERIORES DO POD $NS/$POD ==="
  kubectl logs -n "$NS" "$POD" --all-containers=true --previous --tail=200 2>/dev/null || echo "ERRO: Não foi possível obter logs anteriores de $NS/$POD"
done

# =============================================
# 4. ESTADO DE TODOS OS RECURSOS
# =============================================
separador "ESTADO DE TODOS OS RECURSOS"
kubectl get all -A -o wide
kubectl get deployments,statefulsets,daemonsets,services,ingress,pvc,pv,networkpolicies -A -o wide
kubectl get endpoints,endpointslices -A -o wide

# =============================================
# 5. EVENTOS DO CLUSTER
# =============================================
separador "EVENTOS DO CLUSTER (FILTRADOS POR ERROS)"
kubectl get events -A --sort-by='.metadata.creationTimestamp' | grep -i -E "failed|error|warning|unhealthy|backoff|oom|killing|evicted|failedmount|failedscheduling|notready|timeout"

# =============================================
# 6. DIAGNÓSTICO DO CILIUM/HUBBLE
# =============================================
separador "DIAGNÓSTICO DO CILIUM"
cilium status
kubectl get pods -n kube-system -l k8s-app=cilium -o wide
kubectl logs -n kube-system -l k8s-app=cilium --tail=100

separador "DIAGNÓSTICO DO HUBBLE (FLUXOS DROPPED)"
hubble observe --verdict DROPPED --last 100 -o compact 2>/dev/null || echo "ERRO: Hubble não está disponível"

# =============================================
# 7. DIAGNÓSTICO DO ARGOCD
# =============================================
separador "DIAGNÓSTICO DO ARGOCD"
argocd app list --grpc-web -o wide 2>/dev/null || echo "ERRO: ArgoCD CLI não está disponível"
kubectl get pods -n argocd -o wide
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server --tail=100

# =============================================
# 8. DIAGNÓSTICO DO METALLB E INGRESS
# =============================================
separador "DIAGNÓSTICO DO METALLB"
kubectl get pods -n metallb-system -o wide
kubectl logs -n metallb-system -l app=metallb --tail=100

separador "DIAGNÓSTICO DO INGRESS (NGINX)"
kubectl get pods -n ingress-nginx -o wide
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --tail=100

# =============================================
# 9. DIAGNÓSTICO DO STORAGE (PVC/PV)
# =============================================
separador "DIAGNÓSTICO DO STORAGE"
kubectl get pvc -A -o wide
kubectl get pv -o wide
kubectl get events -A | grep -i -E "volume|mount|pvc|pv|storage|local-path|failedmount"

# =============================================
# 10. DIAGNÓSTICO DA GPU (NVIDIA)
# =============================================
separador "DIAGNÓSTICO DA GPU (NVIDIA)"
kubectl get pods -n kube-system -l name=nvidia-device-plugin-ds -o wide
kubectl logs -n kube-system -l name=nvidia-device-plugin-ds --tail=100

# =============================================
# 11. DUMP COMPLETO DO CLUSTER (SEM SECRETS)
# =============================================
separador "DUMP COMPLETO DO CLUSTER (SEM SECRETS)"
kubectl cluster-info dump --all-namespaces --output-directory="$DIR_TMP/cluster-dump" 2>/dev/null
echo "Dump salvo em $DIR_TMP/cluster-dump (compactar manualmente se necessário)"

# =============================================
# 12. RESUMO DOS ERROS MAIS CRÍTICOS
# =============================================
separador "RESUMO DOS ERROS MAIS CRÍTICOS"
grep -rniE "error|failed|exception|panic|fatal|timeout|refused|denied|unauthorized|forbidden|oom|killed|backoff|crash|notready|unhealthy" "$DIR_TMP" 2>/dev/null || echo "Nenhum erro crítico encontrado nos logs temporários."

# =============================================
# 13. LIMPEZA
# =============================================
separador "FIM DO DIAGNÓSTICO"
echo "Diagnóstico concluído. Arquivo de saída: $OUTPUT_FILE"
echo "Dump do cluster salvo em: $DIR_TMP/cluster-dump"
rm -rf "$DIR_TMP"
