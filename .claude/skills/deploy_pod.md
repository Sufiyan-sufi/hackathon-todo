# Skill: deploy_pod

## Description
Deploy Kubernetes pods.

## Instructions
This skill handles deployment of Kubernetes pods, including pod creation, configuration, management, troubleshooting, and best practices for container orchestration.

## Kubernetes Pod Overview

**What is a Pod?**
A Pod is the smallest deployable unit in Kubernetes that can contain one or more containers sharing network and storage resources.

**Key Concepts:**
- **Single Container Pod:** Most common pattern
- **Multi-Container Pod:** Sidecar, ambassador, adapter patterns
- **Pod Lifecycle:** Pending → Running → Succeeded/Failed
- **Pod Restart Policy:** Always, OnFailure, Never
- **Init Containers:** Run before app containers

## Pod Deployment Strategies

### 1. Direct Pod Creation

#### Simple Pod (pod.yaml)
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app-pod
  namespace: default
  labels:
    app: my-app
    environment: production
    version: v1.0.0
  annotations:
    description: "My application pod"
spec:
  # Restart policy
  restartPolicy: Always

  # Service account
  serviceAccountName: my-app-sa

  # Containers
  containers:
    - name: app
      image: myregistry/my-app:1.0.0
      imagePullPolicy: IfNotPresent

      # Container ports
      ports:
        - name: http
          containerPort: 8000
          protocol: TCP

      # Environment variables
      env:
        - name: APP_ENV
          value: "production"
        - name: LOG_LEVEL
          value: "info"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url

      # Environment from ConfigMap/Secret
      envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets

      # Resource limits
      resources:
        requests:
          cpu: 250m
          memory: 256Mi
        limits:
          cpu: 500m
          memory: 512Mi

      # Volume mounts
      volumeMounts:
        - name: config
          mountPath: /etc/config
          readOnly: true
        - name: data
          mountPath: /data
        - name: tmp
          mountPath: /tmp

      # Health checks
      livenessProbe:
        httpGet:
          path: /health
          port: http
        initialDelaySeconds: 30
        periodSeconds: 10
        timeoutSeconds: 5
        failureThreshold: 3

      readinessProbe:
        httpGet:
          path: /ready
          port: http
        initialDelaySeconds: 5
        periodSeconds: 5
        timeoutSeconds: 3
        failureThreshold: 3

      # Startup probe (for slow-starting containers)
      startupProbe:
        httpGet:
          path: /health
          port: http
        initialDelaySeconds: 0
        periodSeconds: 10
        timeoutSeconds: 3
        failureThreshold: 30

      # Security context
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop:
            - ALL

  # Volumes
  volumes:
    - name: config
      configMap:
        name: app-config
    - name: data
      persistentVolumeClaim:
        claimName: app-data-pvc
    - name: tmp
      emptyDir: {}

  # Image pull secrets
  imagePullSecrets:
    - name: registry-credentials

  # Node selection
  nodeSelector:
    disktype: ssd

  # Affinity and anti-affinity
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: kubernetes.io/arch
                operator: In
                values:
                  - amd64
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchExpressions:
                - key: app
                  operator: In
                  values:
                    - my-app
            topologyKey: kubernetes.io/hostname

  # Tolerations
  tolerations:
    - key: "key1"
      operator: "Equal"
      value: "value1"
      effect: "NoSchedule"

  # DNS policy
  dnsPolicy: ClusterFirst

  # Host network
  hostNetwork: false

  # Priority
  priorityClassName: high-priority
```

### 2. Multi-Container Pod (Sidecar Pattern)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-sidecar
  labels:
    app: my-app
spec:
  containers:
    # Main application container
    - name: app
      image: myregistry/my-app:1.0.0
      ports:
        - containerPort: 8000
      volumeMounts:
        - name: shared-logs
          mountPath: /var/log/app

    # Sidecar container (log shipper)
    - name: log-shipper
      image: fluent/fluent-bit:latest
      volumeMounts:
        - name: shared-logs
          mountPath: /var/log/app
          readOnly: true
        - name: fluent-bit-config
          mountPath: /fluent-bit/etc/

  volumes:
    - name: shared-logs
      emptyDir: {}
    - name: fluent-bit-config
      configMap:
        name: fluent-bit-config
```

### 3. Pod with Init Containers

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-init
  labels:
    app: my-app
spec:
  # Init containers run before app containers
  initContainers:
    # Wait for database
    - name: wait-for-db
      image: busybox:latest
      command:
        - sh
        - -c
        - |
          until nc -z postgres-service 5432; do
            echo "Waiting for database..."
            sleep 2
          done

    # Download configuration
    - name: download-config
      image: curlimages/curl:latest
      command:
        - sh
        - -c
        - |
          curl -o /config/app.conf https://config-server/app.conf
      volumeMounts:
        - name: config
          mountPath: /config

  # Main containers
  containers:
    - name: app
      image: myregistry/my-app:1.0.0
      volumeMounts:
        - name: config
          mountPath: /etc/config

  volumes:
    - name: config
      emptyDir: {}
```

## Pod Deployment via Deployment

### Deployment (Recommended for Production)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-deployment
  namespace: default
  labels:
    app: my-app
spec:
  # Number of pod replicas
  replicas: 3

  # Selector must match pod labels
  selector:
    matchLabels:
      app: my-app

  # Pod template
  template:
    metadata:
      labels:
        app: my-app
        version: v1.0.0
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8000"
    spec:
      containers:
        - name: app
          image: myregistry/my-app:1.0.0
          ports:
            - containerPort: 8000
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi

  # Deployment strategy
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0

  # Revision history
  revisionHistoryLimit: 10

  # Progress deadline
  progressDeadlineSeconds: 600
```

## Python Deployment Manager

```python
from kubernetes import client, config
from kubernetes.client.rest import ApiException
from typing import Optional, Dict, List
import yaml
from pathlib import Path

class KubernetesPodDeployer:
    """Deploy and manage Kubernetes pods."""

    def __init__(self, kubeconfig_path: Optional[str] = None):
        """Initialize Kubernetes client."""
        if kubeconfig_path:
            config.load_kube_config(config_file=kubeconfig_path)
        else:
            try:
                config.load_incluster_config()
            except:
                config.load_kube_config()

        self.v1 = client.CoreV1Api()
        self.apps_v1 = client.AppsV1Api()

    def deploy_pod_from_yaml(
        self,
        yaml_path: str,
        namespace: str = "default"
    ) -> client.V1Pod:
        """Deploy pod from YAML file."""

        # Load YAML
        with open(yaml_path, 'r') as f:
            pod_manifest = yaml.safe_load(f)

        # Create pod
        try:
            pod = self.v1.create_namespaced_pod(
                namespace=namespace,
                body=pod_manifest
            )
            print(f"✅ Pod '{pod.metadata.name}' created successfully")
            return pod
        except ApiException as e:
            print(f"❌ Error creating pod: {e}")
            raise

    def deploy_pod(
        self,
        name: str,
        image: str,
        namespace: str = "default",
        labels: Optional[Dict[str, str]] = None,
        env: Optional[List[Dict]] = None,
        ports: Optional[List[int]] = None,
        resources: Optional[Dict] = None
    ) -> client.V1Pod:
        """Deploy pod programmatically."""

        # Container definition
        container = client.V1Container(
            name=name,
            image=image,
            ports=[
                client.V1ContainerPort(container_port=port)
                for port in (ports or [8000])
            ],
            env=[
                client.V1EnvVar(name=e['name'], value=e['value'])
                for e in (env or [])
            ],
            resources=client.V1ResourceRequirements(
                requests=resources.get('requests', {}) if resources else {},
                limits=resources.get('limits', {}) if resources else {}
            )
        )

        # Pod spec
        pod_spec = client.V1PodSpec(
            containers=[container],
            restart_policy="Always"
        )

        # Pod metadata
        pod_metadata = client.V1ObjectMeta(
            name=name,
            namespace=namespace,
            labels=labels or {"app": name}
        )

        # Pod
        pod = client.V1Pod(
            api_version="v1",
            kind="Pod",
            metadata=pod_metadata,
            spec=pod_spec
        )

        # Create pod
        try:
            result = self.v1.create_namespaced_pod(
                namespace=namespace,
                body=pod
            )
            print(f"✅ Pod '{name}' created successfully")
            return result
        except ApiException as e:
            print(f"❌ Error creating pod: {e}")
            raise

    def get_pod(self, name: str, namespace: str = "default") -> client.V1Pod:
        """Get pod details."""
        try:
            return self.v1.read_namespaced_pod(name, namespace)
        except ApiException as e:
            print(f"❌ Error getting pod: {e}")
            raise

    def list_pods(
        self,
        namespace: str = "default",
        label_selector: Optional[str] = None
    ) -> List[client.V1Pod]:
        """List pods in namespace."""
        try:
            result = self.v1.list_namespaced_pod(
                namespace=namespace,
                label_selector=label_selector
            )
            return result.items
        except ApiException as e:
            print(f"❌ Error listing pods: {e}")
            raise

    def delete_pod(
        self,
        name: str,
        namespace: str = "default",
        grace_period: int = 30
    ):
        """Delete pod."""
        try:
            self.v1.delete_namespaced_pod(
                name=name,
                namespace=namespace,
                grace_period_seconds=grace_period
            )
            print(f"✅ Pod '{name}' deleted successfully")
        except ApiException as e:
            print(f"❌ Error deleting pod: {e}")
            raise

    def get_pod_logs(
        self,
        name: str,
        namespace: str = "default",
        container: Optional[str] = None,
        tail_lines: Optional[int] = 100
    ) -> str:
        """Get pod logs."""
        try:
            return self.v1.read_namespaced_pod_log(
                name=name,
                namespace=namespace,
                container=container,
                tail_lines=tail_lines
            )
        except ApiException as e:
            print(f"❌ Error getting logs: {e}")
            raise

    def execute_in_pod(
        self,
        name: str,
        command: List[str],
        namespace: str = "default",
        container: Optional[str] = None
    ) -> str:
        """Execute command in pod."""
        from kubernetes.stream import stream

        try:
            resp = stream(
                self.v1.connect_get_namespaced_pod_exec,
                name,
                namespace,
                container=container,
                command=command,
                stderr=True,
                stdin=False,
                stdout=True,
                tty=False
            )
            return resp
        except ApiException as e:
            print(f"❌ Error executing command: {e}")
            raise

    def port_forward(
        self,
        name: str,
        local_port: int,
        pod_port: int,
        namespace: str = "default"
    ):
        """Port forward to pod (requires separate thread)."""
        # This requires kubernetes.client.PortForward
        # Implementation depends on use case
        pass

    def get_pod_status(
        self,
        name: str,
        namespace: str = "default"
    ) -> Dict:
        """Get detailed pod status."""
        pod = self.get_pod(name, namespace)

        return {
            "name": pod.metadata.name,
            "namespace": pod.metadata.namespace,
            "phase": pod.status.phase,
            "conditions": [
                {
                    "type": c.type,
                    "status": c.status,
                    "reason": c.reason
                }
                for c in (pod.status.conditions or [])
            ],
            "container_statuses": [
                {
                    "name": cs.name,
                    "ready": cs.ready,
                    "restart_count": cs.restart_count,
                    "state": self._get_container_state(cs.state)
                }
                for cs in (pod.status.container_statuses or [])
            ],
            "pod_ip": pod.status.pod_ip,
            "node_name": pod.spec.node_name,
            "start_time": pod.status.start_time
        }

    def _get_container_state(self, state: client.V1ContainerState) -> str:
        """Extract container state."""
        if state.running:
            return "running"
        elif state.waiting:
            return f"waiting: {state.waiting.reason}"
        elif state.terminated:
            return f"terminated: {state.terminated.reason}"
        return "unknown"

    def wait_for_pod_ready(
        self,
        name: str,
        namespace: str = "default",
        timeout: int = 300
    ) -> bool:
        """Wait for pod to be ready."""
        import time

        start_time = time.time()

        while time.time() - start_time < timeout:
            try:
                pod = self.get_pod(name, namespace)

                if pod.status.phase == "Running":
                    # Check if all containers are ready
                    if pod.status.container_statuses:
                        all_ready = all(
                            cs.ready
                            for cs in pod.status.container_statuses
                        )
                        if all_ready:
                            print(f"✅ Pod '{name}' is ready")
                            return True

                time.sleep(5)

            except ApiException:
                time.sleep(5)

        print(f"⏰ Timeout waiting for pod '{name}' to be ready")
        return False
```

## FastAPI Service for Pod Management

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict

app = FastAPI()
deployer = KubernetesPodDeployer()

class PodCreateRequest(BaseModel):
    name: str
    image: str
    namespace: str = "default"
    labels: Optional[Dict[str, str]] = None
    env: Optional[List[Dict[str, str]]] = None
    ports: Optional[List[int]] = None
    resources: Optional[Dict] = None

class PodResponse(BaseModel):
    name: str
    namespace: str
    phase: str
    pod_ip: Optional[str] = None
    node_name: Optional[str] = None

@app.post("/pods", response_model=PodResponse)
async def create_pod(request: PodCreateRequest):
    """Create a new pod."""
    try:
        pod = deployer.deploy_pod(
            name=request.name,
            image=request.image,
            namespace=request.namespace,
            labels=request.labels,
            env=request.env,
            ports=request.ports,
            resources=request.resources
        )

        return PodResponse(
            name=pod.metadata.name,
            namespace=pod.metadata.namespace,
            phase=pod.status.phase,
            pod_ip=pod.status.pod_ip,
            node_name=pod.spec.node_name
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/pods/{namespace}/{name}")
async def get_pod(namespace: str, name: str):
    """Get pod details."""
    try:
        status = deployer.get_pod_status(name, namespace)
        return status
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/pods/{namespace}")
async def list_pods(namespace: str, label: Optional[str] = None):
    """List pods in namespace."""
    try:
        pods = deployer.list_pods(namespace, label_selector=label)
        return [
            {
                "name": pod.metadata.name,
                "phase": pod.status.phase,
                "pod_ip": pod.status.pod_ip
            }
            for pod in pods
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/pods/{namespace}/{name}")
async def delete_pod(namespace: str, name: str):
    """Delete pod."""
    try:
        deployer.delete_pod(name, namespace)
        return {"message": f"Pod {name} deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/pods/{namespace}/{name}/logs")
async def get_pod_logs(
    namespace: str,
    name: str,
    container: Optional[str] = None,
    tail: int = 100
):
    """Get pod logs."""
    try:
        logs = deployer.get_pod_logs(name, namespace, container, tail)
        return {"logs": logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## CLI Commands

```bash
# Deploy pod from YAML
kubectl apply -f pod.yaml

# Deploy pod directly
kubectl run my-app --image=myregistry/my-app:1.0.0 --port=8000

# Get pod details
kubectl get pod my-app-pod -o yaml

# Get pod status
kubectl describe pod my-app-pod

# List pods
kubectl get pods
kubectl get pods -n my-namespace
kubectl get pods -l app=my-app

# Get pod logs
kubectl logs my-app-pod
kubectl logs my-app-pod -f  # Follow logs
kubectl logs my-app-pod --tail=100
kubectl logs my-app-pod -c container-name  # Specific container

# Execute command in pod
kubectl exec my-app-pod -- ls /app
kubectl exec -it my-app-pod -- /bin/bash

# Port forward
kubectl port-forward my-app-pod 8080:8000

# Delete pod
kubectl delete pod my-app-pod
kubectl delete -f pod.yaml

# Get events
kubectl get events --sort-by=.metadata.creationTimestamp

# Watch pod status
kubectl get pods -w
```

## Troubleshooting

### Common Issues

#### 1. ImagePullBackOff
```bash
# Check image pull secrets
kubectl get pod my-app-pod -o jsonpath='{.spec.imagePullSecrets}'

# Describe pod for error details
kubectl describe pod my-app-pod

# Solution: Add image pull secret
kubectl create secret docker-registry regcred \
  --docker-server=myregistry.com \
  --docker-username=user \
  --docker-password=pass \
  --docker-email=email@example.com
```

#### 2. CrashLoopBackOff
```bash
# Check logs
kubectl logs my-app-pod --previous

# Check events
kubectl describe pod my-app-pod

# Common causes:
# - Application error
# - Missing dependencies
# - Wrong command/arguments
# - Resource limits too low
```

#### 3. Pending State
```bash
# Check why pod is pending
kubectl describe pod my-app-pod

# Common causes:
# - Insufficient resources
# - Node selector mismatch
# - PVC not bound
# - Image pull issues
```

## Best Practices

1. **Use Deployments, not bare Pods** for production
2. **Set resource requests and limits** to prevent resource exhaustion
3. **Implement health checks** (liveness, readiness, startup probes)
4. **Use security contexts** (non-root, read-only filesystem)
5. **Apply labels** for organization and selection
6. **Use namespaces** to isolate environments
7. **Implement Pod Disruption Budgets** for availability
8. **Use ConfigMaps and Secrets** for configuration
9. **Set appropriate restart policies**
10. **Monitor pod metrics** and logs

## Testing

```python
import pytest
from unittest.mock import Mock, patch

@pytest.fixture
def deployer():
    with patch('kubernetes.config.load_kube_config'):
        return KubernetesPodDeployer()

def test_deploy_pod(deployer):
    with patch.object(deployer.v1, 'create_namespaced_pod') as mock_create:
        mock_create.return_value = Mock(
            metadata=Mock(name="test-pod"),
            status=Mock(phase="Pending")
        )

        pod = deployer.deploy_pod(
            name="test-pod",
            image="nginx:latest",
            namespace="default"
        )

        assert pod.metadata.name == "test-pod"
        mock_create.assert_called_once()

def test_get_pod_status(deployer):
    with patch.object(deployer.v1, 'read_namespaced_pod') as mock_read:
        mock_read.return_value = Mock(
            metadata=Mock(name="test-pod", namespace="default"),
            status=Mock(phase="Running", pod_ip="10.0.0.1"),
            spec=Mock(node_name="node-1")
        )

        status = deployer.get_pod_status("test-pod")

        assert status["name"] == "test-pod"
        assert status["phase"] == "Running"
```

## Notes

- Pods are ephemeral; use Deployments for persistence
- Each pod gets a unique IP address
- Containers in a pod share network namespace
- Use init containers for setup tasks
- Consider resource quotas at namespace level
- Use Pod Security Policies/Standards for security
- Monitor pod resource usage with metrics-server
- Implement graceful shutdown handling
