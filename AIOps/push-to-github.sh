#!/bin/bash
# =============================================================
# push-to-github.sh
# Clona inoovaid/inoova-cloud-apps e faz push dos arquivos AIOps
# Executar em: k8s-control
# =============================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[OK]${NC}  $*"; }

echo -n "GitHub username: "; read GH_USER
echo -n "GitHub token (repo scope): "; read -s GH_TOKEN; echo ""

REPO_URL="https://${GH_USER}:${GH_TOKEN}@github.com/inoovaid/inoova-cloud-apps.git"
WORK_DIR="/tmp/inoova-push-$$"

info "Clonando repositório..."
git clone "$REPO_URL" "$WORK_DIR"
cd "$WORK_DIR"

git config user.email "inoovaid@inoovaid.com.br"
git config user.name "inoovaid"

info "Copiando arquivos AIOps..."
# Copiar do diretório atual (onde está este script) ou de /home/claude/AIOps
SRC_DIR="$(dirname "$(realpath "$0")")/AIOps"
[ -d "$SRC_DIR" ] || SRC_DIR="/home/claude/AIOps"

cp -r "$SRC_DIR" .

info "Commit e push para main..."
git add AIOps/
git status --short

git commit -m "feat(aiops): AI Platform — Ollama, OpenWebUI, Dify, n8n, MCP Servers

- Ollama com RTX 5070 + RTX 3060 (qwen2.5-coder:14b)
- OpenWebUI → ai.dnn.lat
- Dify (Helm) → dify.dnn.lat
- n8n → n8n.dnn.lat
- MCP: kubernetes, argocd, git
- ArgoCD AppProject + 4 Applications
- Bootstrap script com criação de secrets"

git push origin main

success "Push concluído!"
info "Próximo passo — no k8s-control:"
echo "  cd /tmp/inoova-push-$$/inoova-cloud-apps"  
echo "  bash AIOps/bootstrap.sh"

# Limpar
cd /
rm -rf "$WORK_DIR"
