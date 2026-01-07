# Skill: observe_cluster

## Description
Monitor Kubernetes cluster health, performance, and resource utilization.

## Instructions
This skill provides strategies and commands for monitoring a Kubernetes cluster, covering health checks, resource consumption, logging, and performance metrics.

## Cluster Health Monitoring

### 1. Nodes and Infrastructure
```bash
# Check node status and age
kubectl get nodes

# Get detailed information about node health and resources
kubectl describe nodes

# Check cluster-level events (errors, warnings)
kubectl get events --sort-by='.lastTimestamp'

# Check control plane component health
kubectl get componentstatuses
```

### 2. Basic Resource Monitoring
```bash
# View resource usage (CPU/Memory) for nodes
kubectl top nodes

# View resource usage for all pods across all namespaces
kubectl top pods --all-namespaces

# Sort pods by resource usage (requires metrics-server)
kubectl top pod --all-namespaces --sort-by=cpu
```

## Pod and Application Observability

### 1. Log Aggregation
```bash
# Follow live logs for a pod
kubectl logs -f <pod_name>

# Get logs from a specific container in a multi-container pod
kubectl logs <pod_name> -c <container_name>

# View logs from a previous (crashed) instance
kubectl logs <pod_name> --previous

# Label-based log streaming (using stern or similar tool)
kubectl logs -l app=my-app --all-containers
```

### 2. Debugging and Inspection
```bash
# Check pod events and status transitions
kubectl describe pod <pod_name>

# Check configuration applied to a running pod
kubectl get pod <pod_name> -o yaml

# Port-forward to access internal dashboards (e.g., Prometheus/Grafana)
kubectl port-forward svc/prometheus-server 9090:80
```

## Python Observability Manager

```python
from kubernetes import client, config
import time

class ClusterObserver:
    def __init__(self):
        config.load_kube_config()
        self.v1 = client.CoreV1Api()
        self.custom_api = client.CustomObjectsApi()

    def get_cluster_health_summary(self):
        """Returns a summary of node and pod health."""
        nodes = self.v1.list_node().items
        unhealthy_nodes = [n.metadata.name for n in nodes if not any(c.type == 'Ready' and c.status == 'True' for c in n.status.conditions)]

        pods = self.v1.list_pod_for_all_namespaces().items
        failing_pods = [p.metadata.name for p in pods if p.status.phase not in ['Running', 'Succeeded']]

        return {
            "node_count": len(nodes),
            "unhealthy_nodes": unhealthy_nodes,
            "failing_pods_count": len(failing_pods),
            "failing_pods": failing_pods[:5]  # Limit output
        }

    def get_metrics(self, namespace="default"):
        """Fetch metrics from the metrics.k8s.io API (requires metrics-server)."""
        try:
            return self.custom_api.list_namespaced_custom_object(
                group="metrics.k8s.io",
                version="v1beta1",
                namespace=namespace,
                plural="pods"
            )
        except Exception as e:
            return f"Metrics Server not reachable: {e}"
```

## Advanced Observability Stack (Recommended)

To move beyond CLI commands, implement:
1. **Prometheus & Grafana:** For time-series metrics and dashboards.
2. **Loki or ELK:** For log aggregation and indexing.
3. **OpenTelemetry:** For distributed tracing.
4. **Kube-state-metrics:** For metadata-based alerts.

## Critical Health Checks (The "Golden Signals")
- **Latency:** Are API requests or internal services slowing down?
- **Traffic:** Is the pod receiving the expected number of requests?
- **Errors:** Are there `ImagePullBackOff`, `CrashLoopBackOff`, or OOM (Out Of Memory) events?
- **Saturation:** Are CPU or Memory usage nearing 100%?

## Alerts to Watch
- `NodeNotReady`
- `KubePodCrashLooping`
- `KubeMemoryOvercommit`
- `KubeJobFailed`
