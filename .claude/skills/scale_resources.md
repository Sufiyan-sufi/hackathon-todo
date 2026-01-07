# Skill: scale_resources

## Description
Scale K8s resources (Deployments, StatefulSets, ReplicaSets) both manually and automatically.

## Instructions
This skill handles the scaling of Kubernetes resources to manage load, including manual scaling, horizontal pod autoscaling (HPA), and vertical pod autoscaling (VPA).

## Scaling Overview

**Types of Scaling:**
- **Manual Scaling:** Directly setting the number of replicas.
- **Horizontal Auto-scaling (HPA):** Adding/removing pods based on metrics (CPU, RAM).
- **Vertical Auto-scaling (VPA):** Increasing/decreasing container resource requests/limits.
- **Cluster Auto-scaling:** Adding/removing nodes to the cluster.

## Manual Scaling

### Using CLI
```bash
# Scale a deployment to 5 replicas
kubectl scale deployment my-app --replicas=5

# Scale a statefulset
kubectl scale statefulset my-db --replicas=3

# Scale across multiple deployments
kubectl scale deployment --all --replicas=2

# Scale based on current state
kubectl scale deployment my-app --current-replicas=2 --replicas=5
```

### Python Implementation
```python
from kubernetes import client, config

class K8sScaler:
    def __init__(self):
        config.load_kube_config()
        self.apps_v1 = client.AppsV1Api()
        self.autoscaling_v2 = client.AutoscalingV2Api()

    def scale_deployment(self, name: str, replicas: int, namespace: str = "default"):
        """Update the replica count for a deployment."""
        body = {"spec": {"replicas": replicas}}
        try:
            self.apps_v1.patch_namespaced_deployment_scale(name, namespace, body)
            print(f"✅ Scaled {name} to {replicas} replicas")
        except Exception as e:
            print(f"❌ Scaling failed: {e}")

    def get_current_replicas(self, name: str, namespace: str = "default"):
        """Get current replica status."""
        scale = self.apps_v1.read_namespaced_deployment_scale(name, namespace)
        return scale.status.replicas
```

## Horizontal Pod Autoscaling (HPA)

### HPA Definition (hpa.yaml)
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageValue: 500Mi
```

### CLI for HPA
```bash
# Create HPA for deployment
kubectl autoscale deployment my-app --min=2 --max=10 --cpu-percent=70

# Get HPA status
kubectl get hpa

# Describe HPA for details on scaling events
kubectl describe hpa my-app-hpa
```

## Vertical Pod Autoscaling (VPA)

VPA is useful when you don't know the exact resource requirements of your pods.

### VPA Definition (vpa.yaml)
```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: my-app-vpa
spec:
  targetRef:
    apiVersion: "apps/v1"
    kind: Deployment
    name: my-app
  updatePolicy:
    updateMode: "Auto" # Options: Off, Initial, Recreate, Auto
```

## Best Practices for Scaling

1. **Set Resource Requests/Limits:** HPA cannot function properly without defined CPU/Memory requests.
2. **Cool-down Periods:** Use `behavior` settings in HPA to prevent "flapping" (rapidly scaling up and down).
3. **PDB (Pod Disruption Budgets):** Ensure minimum availability during downscaling or node maintenance.
4. **Gradual Scaling:** Use `maxSurge` and `maxUnavailable` in deployment strategies.
5. **Anti-Affinity:** When scaling up, use pod anti-affinity to ensure replicas are spread across different nodes/zones.

## Resource Scaling Behavior (HPA v2)
You can control the speed of scaling:
```yaml
behavior:
  scaleDown:
    stabilizationWindowSeconds: 300
    policies:
    - type: Percent
      value: 100
      periodSeconds: 15
  scaleUp:
    stabilizationWindowSeconds: 0
    policies:
    - type: Percent
      value: 100
      periodSeconds: 15
```

## Troubleshooting Scaling Issues

- **Pending Pods:** Cluster is at capacity. Check `kubectl describe pod` for events.
- **HPA Not Scaling:** Check if the Metrics Server is installed (`kubectl get pods -n kube-system | grep metrics-server`).
- **Resource Constraints:** Ensure nodes have enough labels/taints/tolerations to accept new replicas.
- **Application Startup:** If pods crash on scale-up, check if your application can handle the initial initialization load or if database connections are exhausted.
