# AIOps — AI Agent Platform

> **Stack**: Ollama · OpenWebUI · Dify · n8n · MCP Servers  
> **Cluster**: k8s-worker-ai (RTX 5070 + RTX 3060 · CUDA 13.2)  
> **Domínio**: dnn.lat · **GitOps**: ArgoCD → branch main

## Arquitetura

```
Usuário
  ├── ai.dnn.lat    → OpenWebUI  (chat + tools)
  ├── dify.dnn.lat  → Dify       (agentes + RAG)
  └── n8n.dnn.lat   → n8n        (automação)
          │
          ▼
   Ollama (k8s-worker-ai · 2× GPU)
   Modelo: qwen2.5-coder:14b
          │
   ┌──────┴──────────────┐
   │   MCP Servers       │
   ├── mcp-kubernetes     │ lê cluster
   ├── mcp-argocd         │ trigger sync
   └── mcp-git            │ commit manifests
          │
   Git (main branch) → ArgoCD → K8s Cluster
```

## Estrutura

```
AIOps/
├── bootstrap.sh                    ← executar primeiro
├── rbac/
│   ├── namespaces.yaml             ← namespaces + quotas
│   └── ai-agent-rbac.yaml         ← serviceaccount + rbac
├── apps/
│   ├── ai-system/
│   │   ├── ollama/                 ← LLM inference (GPU)
│   │   ├── redis/                  ← cache compartilhado
│   │   └── mcp-servers/            ← K8s + ArgoCD + Git MCP
│   ├── ai-interfaces/
│   │   ├── openwebui/              ← chat interface
│   │   ├── dify/                   ← agent + RAG (Helm values)
│   │   └── ingress.yaml            ← *.dnn.lat
│   └── ai-automation/
│       └── n8n/                    ← workflows de automação
└── argocd/
    └── apps/                       ← AppProject + Applications
```

## Deploy

```bash
# 1. Clonar repo e entrar no diretório
git clone https://github.com/inoovaid/inoova-cloud-apps.git
cd inoova-cloud-apps

# 2. Criar /data/ollama no k8s-worker-ai
ssh k8s-worker-ai "sudo mkdir -p /data/ollama && sudo chmod 777 /data/ollama"

# 3. Executar bootstrap (cria secrets, DBs, ArgoCD apps)
bash AIOps/bootstrap.sh

# 4. Acompanhar
kubectl get applications -n argocd -w
kubectl logs -f -n ai-system deployment/ollama
```

## Modelos disponíveis

| Modelo | VRAM | Uso |
|--------|------|-----|
| `qwen2.5-coder:14b` | ~8GB (1 GPU) | Padrão — coding + K8s |
| `qwen2.5-coder:32b` | ~18GB (2 GPUs) | Máxima qualidade |
| `llama3.1:8b` | ~5GB | Conversação geral |
| `nomic-embed-text` | ~274MB | RAG no Dify |

Para trocar de modelo:
```bash
kubectl exec -n ai-system deployment/ollama -- ollama pull qwen2.5-coder:32b
# e atualizar DEFAULT_MODELS no openwebui/openwebui.yaml
```

## Secrets (não vão para o Git)

Criados via `bootstrap.sh`:
- `openwebui-secrets` (ai-interfaces)
- `n8n-secrets` (ai-automation)
- `dify-secrets` (ai-interfaces)
- `argocd-mcp-token` (ai-system)
- `git-mcp-config` (ai-system)

## URLs

| Serviço | URL |
|---------|-----|
| OpenWebUI | https://ai.dnn.lat |
| Dify | https://dify.dnn.lat |
| n8n | https://n8n.dnn.lat |
| Ollama API | http://ollama.ai-system.svc:11434 (interno) |
