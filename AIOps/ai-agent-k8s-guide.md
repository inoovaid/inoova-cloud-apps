# 🤖 AI Agent Server — Guia de Implementação Kubernetes

> **Cluster**: k8s-control + k8s-worker1/2/3 (Ryzen 7 5700u · 32GB) + **k8s-worker-ai** (Ryzen 9 7900 · 64GB · RTX 5070 12GB + RTX 3060 12GB · CUDA 13.2 ✅)  
> **GitOps**: ArgoCD existente · Branch de AI: `ai-changes`

---

## Stack

| Camada | Componente | Namespace | Recurso |
|--------|-----------|-----------|---------|
| LLM Inference | vLLM + Qwen2.5-Coder-14B-AWQ | `ai-system` | k8s-worker-ai · 2× GPU |
| Interface Chat | OpenWebUI | `ai-interfaces` | qualquer worker |
| Agentes + RAG | Dify | `ai-interfaces` | qualquer worker |
| Automação | n8n | `ai-automation` | qualquer worker |
| Cache / Broker | Redis | `ai-system` | qualquer worker |
| MCP K8s | mcp-kubernetes | `ai-system` | ServiceAccount ai-agent |
| MCP ArgoCD | mcp-argocd | `ai-system` | Token ArgoCD |
| MCP Git | mcp-git | `ai-system` | Git token |

---

## Fase 0 — Verificação do Ambiente

```bash
# Confirmar GPUs e CUDA (já validado conforme logs)
kubectl get nodes -l kubernetes.io/hostname=k8s-worker-ai
kubectl describe node k8s-worker-ai | grep -E "nvidia|gpu" -i

# Confirmar ArgoCD e storage
kubectl get pods -n argocd
kubectl get storageclass   # deve ter local-path ou similar

# Verificar serviço RW do PostgreSQL (CNPG)
kubectl get svc -n default | grep postgres
# Esperado: postgres-ha-rw, postgres-ha-ro, postgres-ha-r

# Pegar credenciais do PostgreSQL superuser
kubectl get secret -n default | grep postgres | grep superuser
# Normalmente: postgres-ha-superuser
PGPASSWORD=$(kubectl get secret postgres-ha-superuser -n default \
  -o jsonpath='{.data.password}' | base64 -d)
echo "PG Password: $PGPASSWORD"
```

---

## Fase 1 — Estrutura do Repositório GitOps

```bash
# Adaptar ao seu repositório GitOps existente
# Criar estrutura de pastas dentro do repo
mkdir -p gitops/{apps/{ai-system/{vllm,mcp-servers,redis},ai-interfaces/{openwebui,dify},ai-automation/n8n},argocd/apps,rbac}

# Estrutura final:
# gitops/
# ├── rbac/                       ← Namespaces, RBAC, Quotas
# ├── apps/
# │   ├── ai-system/
# │   │   ├── vllm/               ← LLM Inference Engine
# │   │   ├── redis/              ← Cache compartilhado
# │   │   └── mcp-servers/        ← K8s, ArgoCD, Git MCP
# │   ├── ai-interfaces/
# │   │   ├── openwebui/          ← Chat Interface
# │   │   └── dify/               ← Agent + RAG Platform
# │   └── ai-automation/
# │       └── n8n/                ← Automation Workflows
# └── argocd/
#     └── apps/                   ← ArgoCD Application manifests

# Criar branch para changes do AI
git checkout -b ai-changes
git push origin ai-changes
```

---

## Fase 2 — Namespaces e ResourceQuotas

**`gitops/rbac/namespaces.yaml`**
```yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: ai-system
  labels:
    app.kubernetes.io/part-of: ai-platform
---
apiVersion: v1
kind: Namespace
metadata:
  name: ai-interfaces
  labels:
    app.kubernetes.io/part-of: ai-platform
---
apiVersion: v1
kind: Namespace
metadata:
  name: ai-automation
  labels:
    app.kubernetes.io/part-of: ai-platform
---
# Quota ai-system: alto (vLLM precisa de quase tudo do k8s-worker-ai)
apiVersion: v1
kind: ResourceQuota
metadata:
  name: ai-system-quota
  namespace: ai-system
spec:
  hard:
    requests.cpu: "18"
    requests.memory: "55Gi"
    limits.cpu: "20"
    limits.memory: "60Gi"
    requests.nvidia.com/gpu: "2"
    limits.nvidia.com/gpu: "2"
    persistentvolumeclaims: "10"
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: ai-interfaces-quota
  namespace: ai-interfaces
spec:
  hard:
    requests.cpu: "4"
    requests.memory: "12Gi"
    limits.cpu: "8"
    limits.memory: "16Gi"
    persistentvolumeclaims: "10"
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: ai-automation-quota
  namespace: ai-automation
spec:
  hard:
    requests.cpu: "2"
    requests.memory: "4Gi"
    limits.cpu: "4"
    limits.memory: "8Gi"
    persistentvolumeclaims: "5"
---
# LimitRange: evitar pods sem limites definidos
apiVersion: v1
kind: LimitRange
metadata:
  name: ai-system-limits
  namespace: ai-system
spec:
  limits:
  - type: Container
    default:
      cpu: "500m"
      memory: "512Mi"
    defaultRequest:
      cpu: "100m"
      memory: "128Mi"
---
apiVersion: v1
kind: LimitRange
metadata:
  name: ai-interfaces-limits
  namespace: ai-interfaces
spec:
  limits:
  - type: Container
    default:
      cpu: "1"
      memory: "1Gi"
    defaultRequest:
      cpu: "250m"
      memory: "256Mi"
```

---

## Fase 3 — RBAC do Agente AI

**`gitops/rbac/ai-agent-rbac.yaml`**
```yaml
---
# ServiceAccount usado pelo MCP K8s e outros agentes
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ai-agent
  namespace: ai-system
---
# ClusterRole: SOMENTE leitura do cluster (writes via ArgoCD/GitOps)
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: ai-agent-reader
rules:
- apiGroups: [""]
  resources:
  - pods
  - pods/log
  - services
  - endpoints
  - namespaces
  - nodes
  - persistentvolumes
  - persistentvolumeclaims
  - configmaps
  - events
  - resourcequotas
  - limitranges
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets", "statefulsets", "daemonsets"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["batch"]
  resources: ["jobs", "cronjobs"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["networking.k8s.io"]
  resources: ["ingresses", "networkpolicies"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["metrics.k8s.io"]
  resources: ["pods", "nodes"]
  verbs: ["get", "list"]
- apiGroups: ["storage.k8s.io"]
  resources: ["storageclasses", "volumeattachments"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: ai-agent-reader-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: ai-agent-reader
subjects:
- kind: ServiceAccount
  name: ai-agent
  namespace: ai-system
---
# Role no namespace argocd: trigger de sync
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: argocd-sync-trigger
  namespace: argocd
rules:
- apiGroups: ["argoproj.io"]
  resources: ["applications"]
  verbs: ["get", "list", "patch", "update"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: ai-agent-argocd-binding
  namespace: argocd
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: argocd-sync-trigger
subjects:
- kind: ServiceAccount
  name: ai-agent
  namespace: ai-system
---
# Long-lived token para o MCP usar fora do pod (opcional)
apiVersion: v1
kind: Secret
metadata:
  name: ai-agent-token
  namespace: ai-system
  annotations:
    kubernetes.io/service-account.name: ai-agent
type: kubernetes.io/service-account-token
```

---

## Fase 4 — Redis (Compartilhado)

Usado por n8n (queue) e Dify (cache/sessions).

**`gitops/apps/ai-system/redis/redis.yaml`**
```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: ai-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        command: ["redis-server", "--save", "60", "1", "--loglevel", "warning"]
        resources:
          requests:
            cpu: "100m"
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "1Gi"
        ports:
        - containerPort: 6379
        volumeMounts:
        - name: redis-data
          mountPath: /data
      volumes:
      - name: redis-data
        persistentVolumeClaim:
          claimName: redis-pvc
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-pvc
  namespace: ai-system
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: local-path
  resources:
    requests:
      storage: 5Gi
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: ai-system
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
```

---

## Fase 5 — vLLM (Inference Engine)

> **Modelo**: `Qwen/Qwen2.5-Coder-14B-Instruct-AWQ` — ~8GB VRAM, velocidade excelente  
> **Alternativa mais poderosa**: `Qwen/Qwen2.5-Coder-32B-Instruct-AWQ` — ~16GB VRAM (usa os 2 GPUs inteiros)

### 5.1 Preparar storage no nó AI

```bash
# Criar diretório para cache de modelos no k8s-worker-ai
ssh k8s-worker-ai "sudo mkdir -p /data/models && sudo chmod 777 /data/models"
```

### 5.2 Manifests

**`gitops/apps/ai-system/vllm/storage.yaml`**
```yaml
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: vllm-models-pv
spec:
  capacity:
    storage: 200Gi
  accessModes: [ReadWriteOnce]
  persistentVolumeReclaimPolicy: Retain
  storageClassName: local-models
  hostPath:
    path: /data/models
    type: DirectoryOrCreate
  nodeAffinity:
    required:
      nodeSelectorTerms:
      - matchExpressions:
        - key: kubernetes.io/hostname
          operator: In
          values: [k8s-worker-ai]
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: local-models
provisioner: kubernetes.io/no-provisioner
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Retain
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: vllm-models-pvc
  namespace: ai-system
spec:
  storageClassName: local-models
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 200Gi
  volumeName: vllm-models-pv
```

**`gitops/apps/ai-system/vllm/deployment.yaml`**
```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vllm
  namespace: ai-system
  labels:
    app: vllm
spec:
  replicas: 1
  selector:
    matchLabels:
      app: vllm
  template:
    metadata:
      labels:
        app: vllm
    spec:
      nodeSelector:
        kubernetes.io/hostname: k8s-worker-ai
      # Se o nó tiver taint de GPU
      tolerations:
      - key: nvidia.com/gpu
        operator: Exists
        effect: NoSchedule
      containers:
      - name: vllm
        image: vllm/vllm-openai:v0.6.6
        args:
        - "--model=Qwen/Qwen2.5-Coder-14B-Instruct-AWQ"
        - "--tensor-parallel-size=2"        # usa RTX 5070 + RTX 3060
        - "--max-model-len=32768"
        - "--gpu-memory-utilization=0.88"
        - "--served-model-name=qwen2.5-coder"
        - "--host=0.0.0.0"
        - "--port=8000"
        - "--trust-remote-code"
        - "--enable-chunked-prefill"
        - "--max-num-seqs=16"
        env:
        - name: HF_HOME
          value: /cache/huggingface
        - name: NCCL_P2P_DISABLE
          value: "0"
        # Opcional: HuggingFace token para modelos privados
        # - name: HUGGING_FACE_HUB_TOKEN
        #   valueFrom:
        #     secretKeyRef:
        #       name: hf-token
        #       key: token
        resources:
          requests:
            nvidia.com/gpu: "2"
            memory: "32Gi"
            cpu: "8"
          limits:
            nvidia.com/gpu: "2"
            memory: "55Gi"
            cpu: "18"
        ports:
        - name: http
          containerPort: 8000
        startupProbe:
          httpGet:
            path: /health
            port: 8000
          failureThreshold: 90     # até 15 min para download do modelo (1ª vez)
          periodSeconds: 10
          initialDelaySeconds: 30
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          periodSeconds: 30
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          periodSeconds: 10
          failureThreshold: 3
        volumeMounts:
        - name: model-cache
          mountPath: /cache
        - name: shm
          mountPath: /dev/shm
      volumes:
      - name: model-cache
        persistentVolumeClaim:
          claimName: vllm-models-pvc
      - name: shm
        emptyDir:
          medium: Memory
          sizeLimit: 16Gi          # shared memory para multi-GPU NCCL
---
apiVersion: v1
kind: Service
metadata:
  name: vllm
  namespace: ai-system
  labels:
    app: vllm
spec:
  selector:
    app: vllm
  ports:
  - name: http
    port: 8000
    targetPort: 8000
```

### 5.3 Monitorar inicialização

```bash
# Aguardar o pod subir (download do modelo na 1ª vez: ~10-15 min)
kubectl logs -f -n ai-system deployment/vllm

# Quando aparecer: "Application startup complete." — está pronto!

# Testar inferência
kubectl exec -n ai-system deployment/vllm -- \
  curl -s http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5-coder",
    "messages": [{"role": "user", "content": "Write a kubectl command to list pods sorted by age"}],
    "max_tokens": 150
  }' | python3 -m json.tool

# Ver modelos disponíveis
kubectl exec -n ai-system deployment/vllm -- \
  curl -s http://localhost:8000/v1/models | python3 -m json.tool

# GPU utilization em tempo real
kubectl exec -n ai-system deployment/vllm -- nvidia-smi dmon -s u
```

---

## Fase 6 — OpenWebUI

**`gitops/apps/ai-interfaces/openwebui/openwebui.yaml`**
```yaml
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: openwebui-pvc
  namespace: ai-interfaces
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: local-path
  resources:
    requests:
      storage: 10Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: openwebui
  namespace: ai-interfaces
  labels:
    app: openwebui
spec:
  replicas: 1
  selector:
    matchLabels:
      app: openwebui
  template:
    metadata:
      labels:
        app: openwebui
    spec:
      containers:
      - name: openwebui
        image: ghcr.io/open-webui/open-webui:main
        env:
        - name: OPENAI_API_BASE_URL
          value: "http://vllm.ai-system.svc.cluster.local:8000/v1"
        - name: OPENAI_API_KEY
          value: "sk-not-required"
        - name: WEBUI_AUTH
          value: "true"
        - name: DEFAULT_MODELS
          value: "qwen2.5-coder"
        - name: ENABLE_RAG_WEB_SEARCH
          value: "true"
        - name: WEBUI_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: openwebui-secrets
              key: secret-key
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: openwebui-secrets
              key: database-url
        # MCP tools: conectar servidores MCP
        - name: TOOLS_ENABLED
          value: "true"
        resources:
          requests:
            cpu: "500m"
            memory: "1Gi"
          limits:
            cpu: "2"
            memory: "4Gi"
        ports:
        - containerPort: 8080
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 30
        volumeMounts:
        - name: webui-data
          mountPath: /app/backend/data
      volumes:
      - name: webui-data
        persistentVolumeClaim:
          claimName: openwebui-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: openwebui
  namespace: ai-interfaces
spec:
  selector:
    app: openwebui
  ports:
  - port: 80
    targetPort: 8080
```

### Criar secrets do OpenWebUI

```bash
# Obter senha do PostgreSQL
PGPASSWORD=$(kubectl get secret postgres-ha-superuser -n default \
  -o jsonpath='{.data.password}' | base64 -d)

# Criar database
kubectl exec -n default postgres-ha-1 -- \
  psql -U postgres -c "CREATE DATABASE openwebui OWNER postgres;" 2>/dev/null || echo "DB já existe"

# Criar secret (NÃO commitar no Git — usar Sealed Secrets depois)
kubectl create secret generic openwebui-secrets \
  --namespace ai-interfaces \
  --from-literal=secret-key="$(openssl rand -hex 32)" \
  --from-literal=database-url="postgresql://postgres:${PGPASSWORD}@postgres-ha-rw.default.svc.cluster.local:5432/openwebui" \
  --save-config --dry-run=client -o yaml | kubectl apply -f -
```

---

## Fase 7 — n8n (Automation Engine)

**`gitops/apps/ai-automation/n8n/n8n.yaml`**
```yaml
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: n8n-pvc
  namespace: ai-automation
spec:
  accessModes: [ReadWriteOnce]
  storageClassName: local-path
  resources:
    requests:
      storage: 10Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: n8n
  namespace: ai-automation
  labels:
    app: n8n
spec:
  replicas: 1
  selector:
    matchLabels:
      app: n8n
  template:
    metadata:
      labels:
        app: n8n
    spec:
      securityContext:
        runAsUser: 1000
        fsGroup: 1000
      containers:
      - name: n8n
        image: n8nio/n8n:latest
        env:
        - name: DB_TYPE
          value: postgresdb
        - name: DB_POSTGRESDB_HOST
          value: postgres-ha-rw.default.svc.cluster.local
        - name: DB_POSTGRESDB_PORT
          value: "5432"
        - name: DB_POSTGRESDB_DATABASE
          value: n8n
        - name: DB_POSTGRESDB_USER
          value: postgres
        - name: DB_POSTGRESDB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: n8n-secrets
              key: db-password
        - name: N8N_ENCRYPTION_KEY
          valueFrom:
            secretKeyRef:
              name: n8n-secrets
              key: encryption-key
        - name: N8N_USER_MANAGEMENT_JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: n8n-secrets
              key: jwt-secret
        - name: WEBHOOK_URL
          value: "https://n8n.SEU_DOMINIO"   # substituir
        - name: GENERIC_TIMEZONE
          value: "America/Sao_Paulo"
        - name: N8N_LOG_LEVEL
          value: "info"
        - name: EXECUTIONS_DATA_PRUNE
          value: "true"
        - name: EXECUTIONS_DATA_MAX_AGE
          value: "168"   # 7 dias
        # Queue mode com Redis (recomendado para produção)
        - name: QUEUE_BULL_REDIS_HOST
          value: redis.ai-system.svc.cluster.local
        - name: EXECUTIONS_MODE
          value: queue
        resources:
          requests:
            cpu: "250m"
            memory: "512Mi"
          limits:
            cpu: "2"
            memory: "4Gi"
        ports:
        - containerPort: 5678
        livenessProbe:
          httpGet:
            path: /healthz
            port: 5678
          initialDelaySeconds: 30
          periodSeconds: 30
        volumeMounts:
        - name: n8n-data
          mountPath: /home/node/.n8n
      volumes:
      - name: n8n-data
        persistentVolumeClaim:
          claimName: n8n-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: n8n
  namespace: ai-automation
spec:
  selector:
    app: n8n
  ports:
  - port: 80
    targetPort: 5678
```

### Criar secrets do n8n

```bash
PGPASSWORD=$(kubectl get secret postgres-ha-superuser -n default \
  -o jsonpath='{.data.password}' | base64 -d)

# Criar database n8n
kubectl exec -n default postgres-ha-1 -- \
  psql -U postgres -c "CREATE DATABASE n8n OWNER postgres;" 2>/dev/null || echo "DB já existe"

kubectl create secret generic n8n-secrets \
  --namespace ai-automation \
  --from-literal=db-password="${PGPASSWORD}" \
  --from-literal=encryption-key="$(openssl rand -hex 32)" \
  --from-literal=jwt-secret="$(openssl rand -hex 32)" \
  --save-config --dry-run=client -o yaml | kubectl apply -f -
```

---

## Fase 8 — Dify (Agent Platform + RAG)

Dify tem múltiplos serviços. O jeito mais rápido é via **Helm chart oficial**.

### 8.1 Instalar via Helm

```bash
# Adicionar repo Dify
helm repo add dify https://charts.dify.ai
helm repo update

# Criar databases
PGPASSWORD=$(kubectl get secret postgres-ha-superuser -n default \
  -o jsonpath='{.data.password}' | base64 -d)

kubectl exec -n default postgres-ha-1 -- \
  psql -U postgres <<EOF
CREATE DATABASE dify OWNER postgres;
CREATE DATABASE dify_sandbox OWNER postgres;
EOF

# Criar namespace e secrets
kubectl create namespace dify 2>/dev/null || true

MINIO_ACCESS=$(kubectl get secret -n observability minio -o jsonpath='{.data.rootUser}' | base64 -d 2>/dev/null || echo "minioadmin")
MINIO_SECRET=$(kubectl get secret -n observability minio -o jsonpath='{.data.rootPassword}' | base64 -d 2>/dev/null || echo "minioadmin")
```

**`gitops/apps/ai-interfaces/dify/values.yaml`** (para Helm)
```yaml
# Dify Helm Values
global:
  edition: SELF_HOSTED

api:
  replicaCount: 1
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 2
      memory: 4Gi
  envs:
  - name: SECRET_KEY
    value: "GERAR_COM_openssl_rand_hex_32"
  - name: DB_USERNAME
    value: postgres
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: dify-db-secret
        key: password
  - name: DB_HOST
    value: postgres-ha-rw.default.svc.cluster.local
  - name: DB_PORT
    value: "5432"
  - name: DB_DATABASE
    value: dify
  - name: REDIS_HOST
    value: redis.ai-system.svc.cluster.local
  - name: REDIS_PORT
    value: "6379"
  - name: STORAGE_TYPE
    value: s3
  - name: S3_ENDPOINT
    value: http://minio.observability.svc.cluster.local:9000
  - name: S3_BUCKET_NAME
    value: dify
  - name: S3_ACCESS_KEY
    value: "SEU_MINIO_USER"
  - name: S3_SECRET_KEY
    value: "SEU_MINIO_PASSWORD"
  - name: S3_USE_AWS_MANAGED_IAM
    value: "false"

worker:
  replicaCount: 1
  resources:
    requests:
      cpu: 250m
      memory: 512Mi
    limits:
      cpu: 1
      memory: 2Gi

web:
  replicaCount: 1
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 512Mi

# Desabilitar componentes já existentes no cluster
postgresql:
  enabled: false   # usando CNPG existente

redis:
  enabled: false   # usando Redis do ai-system

minio:
  enabled: false   # usando MinIO do observability

# Sandbox
sandbox:
  enabled: true
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 512Mi
```

```bash
# Deploy Dify
helm upgrade --install dify dify/dify \
  --namespace ai-interfaces \
  --create-namespace \
  -f gitops/apps/ai-interfaces/dify/values.yaml \
  --set api.envs[0].value="$(openssl rand -hex 32)"
```

### 8.2 Configurar LLM no Dify (pós-deploy)

1. Acesse `https://dify.SEU_DOMINIO`
2. **Settings → Model Providers → OpenAI-API-compatible**
3. API Base URL: `http://vllm.ai-system.svc.cluster.local:8000/v1`
4. API Key: `sk-not-required`
5. Model Name: `qwen2.5-coder`

---

## Fase 9 — MCP Servers

### 9.1 Kubernetes MCP

**`gitops/apps/ai-system/mcp-servers/mcp-kubernetes.yaml`**
```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-kubernetes
  namespace: ai-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mcp-kubernetes
  template:
    metadata:
      labels:
        app: mcp-kubernetes
    spec:
      serviceAccountName: ai-agent     # RBAC read-only já criado
      containers:
      - name: mcp-kubernetes
        image: ghcr.io/strowk/mcp-k8s-go:latest
        env:
        - name: MCP_TRANSPORT
          value: "sse"
        - name: MCP_PORT
          value: "3000"
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "256Mi"
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: mcp-kubernetes
  namespace: ai-system
spec:
  selector:
    app: mcp-kubernetes
  ports:
  - port: 3000
    targetPort: 3000
```

### 9.2 ArgoCD MCP

```bash
# Criar token de service account no ArgoCD
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: ServiceAccount
metadata:
  name: mcp-agent
  namespace: argocd
EOF

# Obter token
kubectl create token mcp-agent -n argocd --duration=8760h > /tmp/argocd-mcp-token.txt
kubectl create secret generic argocd-mcp-token \
  --namespace ai-system \
  --from-literal=token="$(cat /tmp/argocd-mcp-token.txt)" \
  --save-config --dry-run=client -o yaml | kubectl apply -f -
rm /tmp/argocd-mcp-token.txt
```

**`gitops/apps/ai-system/mcp-servers/mcp-argocd.yaml`**
```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-argocd
  namespace: ai-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mcp-argocd
  template:
    metadata:
      labels:
        app: mcp-argocd
    spec:
      containers:
      - name: mcp-argocd
        image: ghcr.io/akuity/mcp-argocd:latest
        env:
        - name: ARGOCD_BASE_URL
          value: "https://argocd-server.argocd.svc.cluster.local"
        - name: ARGOCD_TOKEN
          valueFrom:
            secretKeyRef:
              name: argocd-mcp-token
              key: token
        - name: ARGOCD_INSECURE
          value: "true"
        - name: PORT
          value: "3001"
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "256Mi"
        ports:
        - containerPort: 3001
---
apiVersion: v1
kind: Service
metadata:
  name: mcp-argocd
  namespace: ai-system
spec:
  selector:
    app: mcp-argocd
  ports:
  - port: 3001
    targetPort: 3001
```

### 9.3 Git MCP

```bash
# Criar Git token secret
# Gerar token no seu GitLab/GitHub/Gitea com permissão de read/write no repo
kubectl create secret generic git-mcp-config \
  --namespace ai-system \
  --from-literal=repo-url="https://SEU_GIT_HOST/SEU_ORG/SEU_REPO.git" \
  --from-literal=token="SEU_GIT_TOKEN" \
  --from-literal=user-email="ai-agent@seudominio.com" \
  --from-literal=user-name="AI Agent" \
  --save-config --dry-run=client -o yaml | kubectl apply -f -
```

**`gitops/apps/ai-system/mcp-servers/mcp-git.yaml`**
```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-git
  namespace: ai-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mcp-git
  template:
    metadata:
      labels:
        app: mcp-git
    spec:
      containers:
      - name: mcp-git
        image: mcp/git:latest
        env:
        - name: GIT_REPO_URL
          valueFrom:
            secretKeyRef:
              name: git-mcp-config
              key: repo-url
        - name: GIT_TOKEN
          valueFrom:
            secretKeyRef:
              name: git-mcp-config
              key: token
        - name: GIT_USER_EMAIL
          valueFrom:
            secretKeyRef:
              name: git-mcp-config
              key: user-email
        - name: GIT_USER_NAME
          valueFrom:
            secretKeyRef:
              name: git-mcp-config
              key: user-name
        - name: GIT_BRANCH
          value: "ai-changes"
        - name: MCP_PORT
          value: "3002"
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "256Mi"
        ports:
        - containerPort: 3002
---
apiVersion: v1
kind: Service
metadata:
  name: mcp-git
  namespace: ai-system
spec:
  selector:
    app: mcp-git
  ports:
  - port: 3002
    targetPort: 3002
```

---

## Fase 10 — Ingress

**`gitops/apps/ai-interfaces/ingress.yaml`**
```yaml
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ai-ingress
  namespace: ai-interfaces
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/proxy-body-size: "100m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "60"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - ai.SEU_DOMINIO
    - dify.SEU_DOMINIO
    secretName: ai-tls
  rules:
  - host: ai.SEU_DOMINIO
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: openwebui
            port:
              number: 80
  - host: dify.SEU_DOMINIO
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: dify-web
            port:
              number: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: n8n-ingress
  namespace: ai-automation
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    # n8n precisa de WebSocket
    nginx.ingress.kubernetes.io/proxy-http-version: "1.1"
    nginx.ingress.kubernetes.io/configuration-snippet: |
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - n8n.SEU_DOMINIO
    secretName: n8n-tls
  rules:
  - host: n8n.SEU_DOMINIO
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: n8n
            port:
              number: 80
```

---

## Fase 11 — ArgoCD Applications

**`gitops/argocd/apps/appproject-ai.yaml`**
```yaml
---
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: ai-platform
  namespace: argocd
  finalizers:
  - resources-finalizer.argocd.io
spec:
  description: "AI Agent Platform — vLLM · OpenWebUI · Dify · n8n · MCP"
  sourceRepos:
  - "https://SEU_GIT_HOST/SEU_ORG/SEU_REPO.git"
  destinations:
  - namespace: ai-system
    server: https://kubernetes.default.svc
  - namespace: ai-interfaces
    server: https://kubernetes.default.svc
  - namespace: ai-automation
    server: https://kubernetes.default.svc
  clusterResourceWhitelist:
  - group: ""
    kind: Namespace
  - group: rbac.authorization.k8s.io
    kind: ClusterRole
  - group: rbac.authorization.k8s.io
    kind: ClusterRoleBinding
  - group: ""
    kind: PersistentVolume
  - group: storage.k8s.io
    kind: StorageClass
  namespaceResourceWhitelist:
  - group: "*"
    kind: "*"
  roles:
  - name: ai-agent-role
    description: Permite sync via MCP
    policies:
    - p, proj:ai-platform:ai-agent-role, applications, sync, ai-platform/*, allow
    - p, proj:ai-platform:ai-agent-role, applications, get, ai-platform/*, allow
```

**`gitops/argocd/apps/app-ai-rbac.yaml`**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ai-rbac
  namespace: argocd
  finalizers:
  - resources-finalizer.argocd.io
spec:
  project: ai-platform
  source:
    repoURL: https://SEU_GIT_HOST/SEU_ORG/SEU_REPO.git
    targetRevision: main
    path: gitops/rbac
  destination:
    server: https://kubernetes.default.svc
    namespace: ai-system
  syncPolicy:
    automated:
      prune: false       # segurança: não deletar RBAC automaticamente
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
    - ServerSideApply=true
```

**`gitops/argocd/apps/app-ai-system.yaml`**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ai-system
  namespace: argocd
  finalizers:
  - resources-finalizer.argocd.io
spec:
  project: ai-platform
  source:
    repoURL: https://SEU_GIT_HOST/SEU_ORG/SEU_REPO.git
    targetRevision: main
    path: gitops/apps/ai-system
  destination:
    server: https://kubernetes.default.svc
    namespace: ai-system
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
    - ServerSideApply=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

**`gitops/argocd/apps/app-ai-interfaces.yaml`**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ai-interfaces
  namespace: argocd
  finalizers:
  - resources-finalizer.argocd.io
spec:
  project: ai-platform
  source:
    repoURL: https://SEU_GIT_HOST/SEU_ORG/SEU_REPO.git
    targetRevision: main
    path: gitops/apps/ai-interfaces
  destination:
    server: https://kubernetes.default.svc
    namespace: ai-interfaces
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
    - ServerSideApply=true
```

**`gitops/argocd/apps/app-ai-automation.yaml`**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ai-automation
  namespace: argocd
  finalizers:
  - resources-finalizer.argocd.io
spec:
  project: ai-platform
  source:
    repoURL: https://SEU_GIT_HOST/SEU_ORG/SEU_REPO.git
    targetRevision: main
    path: gitops/apps/ai-automation
  destination:
    server: https://kubernetes.default.svc
    namespace: ai-automation
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
    - ServerSideApply=true
```

---

## Fase 12 — Bootstrap: Ordem de Execução

```bash
#!/bin/bash
# bootstrap-ai-platform.sh

set -e
echo "=== 1. Aplicar Namespaces e Quotas ==="
kubectl apply -f gitops/rbac/namespaces.yaml

echo "=== 2. Aplicar RBAC ==="
kubectl apply -f gitops/rbac/ai-agent-rbac.yaml

echo "=== 3. Criar databases PostgreSQL ==="
PGPASSWORD=$(kubectl get secret postgres-ha-superuser -n default \
  -o jsonpath='{.data.password}' | base64 -d)

for db in openwebui n8n dify; do
  kubectl exec -n default postgres-ha-1 -- \
    psql -U postgres -c "CREATE DATABASE $db OWNER postgres;" 2>/dev/null \
    && echo "✅ Database $db criado" \
    || echo "ℹ️  Database $db já existe"
done

echo "=== 4. Criar secrets (adaptar senhas!) ==="
kubectl create secret generic openwebui-secrets \
  --namespace ai-interfaces \
  --from-literal=secret-key="$(openssl rand -hex 32)" \
  --from-literal=database-url="postgresql://postgres:${PGPASSWORD}@postgres-ha-rw.default.svc.cluster.local:5432/openwebui" \
  --save-config --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic n8n-secrets \
  --namespace ai-automation \
  --from-literal=db-password="${PGPASSWORD}" \
  --from-literal=encryption-key="$(openssl rand -hex 32)" \
  --from-literal=jwt-secret="$(openssl rand -hex 32)" \
  --save-config --dry-run=client -o yaml | kubectl apply -f -

echo "=== 5. Criar storage para modelos vLLM no k8s-worker-ai ==="
ssh k8s-worker-ai "sudo mkdir -p /data/models && sudo chmod 777 /data/models" || \
  kubectl debug -it node/k8s-worker-ai --image=busybox -- \
    sh -c "mkdir -p /host/data/models && chmod 777 /host/data/models" 2>/dev/null || \
  echo "⚠️  Criar /data/models manualmente no k8s-worker-ai"

echo "=== 6. Commit e Push para GitOps ==="
cd gitops
git add .
git commit -m "feat(ai-platform): initial deployment — vLLM, OpenWebUI, n8n, MCP"
git push origin main

echo "=== 7. Criar AppProject e Applications no ArgoCD ==="
kubectl apply -f argocd/apps/appproject-ai.yaml
kubectl apply -f argocd/apps/

echo "=== 8. Acompanhar sincronização ==="
kubectl get applications -n argocd -w &
sleep 30
kubectl get pods -n ai-system
kubectl get pods -n ai-interfaces
kubectl get pods -n ai-automation

echo "=== ✅ Bootstrap concluído! ==="
echo ""
echo "Próximos passos:"
echo "  • Aguardar vLLM baixar o modelo (~10-15 min): kubectl logs -f -n ai-system deployment/vllm"
echo "  • Configurar Dify LLM provider: https://dify.SEU_DOMINIO"
echo "  • Configurar MCP servers no OpenWebUI: https://ai.SEU_DOMINIO/admin/tools"
```

```bash
chmod +x bootstrap-ai-platform.sh
./bootstrap-ai-platform.sh
```

---

## Fase 13 — Validação Completa

```bash
# === STATUS GERAL ===
kubectl get pods -n ai-system
kubectl get pods -n ai-interfaces
kubectl get pods -n ai-automation

# === vLLM ===
# Health check
kubectl exec -n ai-system deployment/vllm -- curl -s http://localhost:8000/health
# Listar modelos
kubectl exec -n ai-system deployment/vllm -- curl -s http://localhost:8000/v1/models | python3 -m json.tool
# GPU usage
kubectl exec -n ai-system deployment/vllm -- nvidia-smi
# Inferência de teste
kubectl exec -n ai-system deployment/vllm -- curl -s \
  http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5-coder",
    "messages": [{"role":"user","content":"List all k8s namespaces command"}],
    "max_tokens": 100
  }' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['choices'][0]['message']['content'])"

# === OpenWebUI ===
kubectl port-forward -n ai-interfaces svc/openwebui 8080:80 &
echo "OpenWebUI: http://localhost:8080"

# === n8n ===
kubectl port-forward -n ai-automation svc/n8n 5678:80 &
echo "n8n: http://localhost:5678"

# === MCP Servers ===
kubectl exec -n ai-system deployment/mcp-kubernetes -- \
  curl -s http://localhost:3000/health 2>/dev/null || echo "checking..."

# === ArgoCD Applications ===
kubectl get applications -n argocd -l app.kubernetes.io/part-of=ai-platform

# === Recursos usados ===
kubectl top nodes
kubectl top pods -n ai-system
kubectl top pods -n ai-interfaces
```

---

## Configuração GitOps do Agente: Workflow Completo

```
Usuário                OpenWebUI/Dify
   │                        │
   │──── prompt ────────────▶│
   │                        │
   │                   ┌────▼──────────────────────────────┐
   │                   │  vLLM (Qwen2.5-Coder)             │
   │                   │  gera YAML / decide ação           │
   │                   └────┬──────────────────────────────┘
   │                        │ tool calling
   │                   ┌────▼──────────┐    ┌───────────────┐
   │                   │ mcp-kubernetes │    │   mcp-argocd  │
   │                   │ lê cluster     │    │ trigger sync  │
   │                   └───────────────┘    └───────────────┘
   │                        │
   │                   ┌────▼───────────┐
   │                   │   mcp-git      │
   │                   │ commit YAML    │
   │                   │ branch:        │
   │                   │ ai-changes     │
   │                   └────┬───────────┘
   │                        │ push
   │                   ┌────▼───────────┐
   │                   │   Git Repo     │
   │                   │  PR / merge    │
   │                   └────┬───────────┘
   │                        │ watch
   │                   ┌────▼───────────┐
   │                   │    ArgoCD      │
   │                   │  auto-sync     │
   │                   └────┬───────────┘
   │                        │
   │                   ┌────▼───────────┐
   │                   │  K8s Cluster   │
   │◀────── status ────┤  nova mudança  │
   │                   └────────────────┘
```

---

## Segurança

| Item | Ação Recomendada |
|------|------------------|
| **Secrets** | Migrar para Sealed Secrets ou External Secrets Operator |
| **K8s MCP** | Manter read-only — escritas **sempre** via ArgoCD |
| **Branch ai-changes** | Proteção de branch + PR obrigatório antes de merge em main |
| **ArgoCD token** | Criar service account dedicado com permissões mínimas |
| **vLLM API** | Adicionar autenticação via nginx ingress auth ou API key |
| **OPA Gatekeeper** | Adicionar policies para namespaces que o AI pode criar |
| **Cilium NetworkPolicy** | Isolar ai-system, ai-interfaces, ai-automation |

---

## Troubleshooting Rápido

```bash
# vLLM não inicia (GPU)
kubectl describe pod -n ai-system -l app=vllm | tail -30
kubectl logs -n ai-system deployment/vllm --previous 2>/dev/null | tail -50
# Se NCCL erro: adicionar env NCCL_P2P_DISABLE=1 no deployment

# Quota excedida
kubectl describe resourcequota -n ai-system
kubectl describe resourcequota -n ai-interfaces

# Pod pendente (sem GPU disponível)
kubectl describe pod <pod> -n ai-system | grep -A 5 "Events:"
kubectl get events -n ai-system --sort-by='.lastTimestamp' | tail -20

# ArgoCD não sincroniza
kubectl logs -n argocd deployment/argocd-application-controller | tail -50
kubectl get applications -n argocd
# Forçar sync
argocd app sync ai-system --force --grpc-web

# PVC não monta
kubectl get pv,pvc -n ai-system
kubectl describe pvc vllm-models-pvc -n ai-system

# OpenWebUI não conecta no vLLM
kubectl exec -n ai-interfaces deployment/openwebui -- \
  curl -s http://vllm.ai-system.svc.cluster.local:8000/health

# n8n crash (DB connection)
kubectl logs -n ai-automation deployment/n8n | grep -i "error\|fail" | tail -20
kubectl exec -n default postgres-ha-1 -- psql -U postgres -c "\l" | grep n8n
```

---

## Modelo Alternativo (32B — Máximo Desempenho)

Para usar o modelo de 32B com 24GB VRAM total (2× 12GB):

```bash
# No deployment vllm, alterar o argumento --model:
# --model=Qwen/Qwen2.5-Coder-32B-Instruct-AWQ
# Mantém: --tensor-parallel-size=2
# Ajustar: --max-model-len=16384 (reduzir para caber na VRAM)
# Ajustar: --gpu-memory-utilization=0.95

kubectl set env deployment/vllm -n ai-system \
  "$(kubectl get deployment vllm -n ai-system -o yaml | grep -A1 'args:')"
# Ou editar diretamente:
kubectl edit deployment vllm -n ai-system
```
