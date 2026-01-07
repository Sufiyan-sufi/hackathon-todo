# Skill: generate_helm_chart

## Description
Create Helm charts.

## Instructions
This skill generates production-ready Helm charts for Kubernetes applications, including templates, values, configurations, and best practices for package management and deployment.

## Helm Overview

**What is Helm?**
Helm is a package manager for Kubernetes that simplifies application deployment and management through reusable charts.

**Key Concepts:**
- **Chart:** Package of Kubernetes resources
- **Release:** Instance of a chart running in a cluster
- **Repository:** Collection of charts
- **Values:** Configuration parameters
- **Templates:** Kubernetes manifests with Go templating

## Chart Structure

```
my-app/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default configuration values
├── values-dev.yaml         # Development environment values
├── values-prod.yaml        # Production environment values
├── charts/                 # Chart dependencies
├── templates/              # Kubernetes manifest templates
│   ├── deployment.yaml     # Deployment template
│   ├── service.yaml        # Service template
│   ├── ingress.yaml        # Ingress template
│   ├── configmap.yaml      # ConfigMap template
│   ├── secret.yaml         # Secret template
│   ├── hpa.yaml           # HorizontalPodAutoscaler
│   ├── pdb.yaml           # PodDisruptionBudget
│   ├── serviceaccount.yaml # ServiceAccount
│   ├── _helpers.tpl        # Template helpers
│   └── NOTES.txt          # Post-install notes
├── .helmignore            # Files to ignore
└── README.md              # Chart documentation
```

## Chart Metadata (Chart.yaml)

```yaml
apiVersion: v2
name: my-app
description: A Helm chart for My Application
type: application
version: 1.0.0
appVersion: "1.0.0"

# Maintainers
maintainers:
  - name: Your Name
    email: you@example.com
    url: https://example.com

# Keywords for searching
keywords:
  - todo
  - api
  - fastapi

# Chart dependencies
dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: "17.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled

# Home page
home: https://github.com/yourorg/my-app
sources:
  - https://github.com/yourorg/my-app

# Icon URL
icon: https://example.com/icon.png
```

## Default Values (values.yaml)

```yaml
# Default values for my-app
# This is a YAML-formatted file.
# Declare variables to be passed into your templates.

# Number of replicas
replicaCount: 2

# Container image
image:
  repository: myregistry/my-app
  pullPolicy: IfNotPresent
  tag: "1.0.0"

# Image pull secrets
imagePullSecrets: []

# Override name
nameOverride: ""
fullnameOverride: ""

# Service Account
serviceAccount:
  create: true
  annotations: {}
  name: ""

# Pod annotations
podAnnotations: {}

# Pod security context
podSecurityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000

# Container security context
securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL

# Service configuration
service:
  type: ClusterIP
  port: 80
  targetPort: 8000
  annotations: {}

# Ingress configuration
ingress:
  enabled: false
  className: "nginx"
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  hosts:
    - host: my-app.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: my-app-tls
      hosts:
        - my-app.example.com

# Resource requests and limits
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

# Autoscaling
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80

# Node selector
nodeSelector: {}

# Tolerations
tolerations: []

# Affinity
affinity: {}

# Liveness probe
livenessProbe:
  httpGet:
    path: /health
    port: http
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

# Readiness probe
readinessProbe:
  httpGet:
    path: /ready
    port: http
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3

# Environment variables
env:
  - name: APP_ENV
    value: "production"
  - name: LOG_LEVEL
    value: "info"

# Environment from secrets/configmaps
envFrom: []

# ConfigMap data
configMap:
  data:
    app.conf: |
      [app]
      debug = false
      max_connections = 100

# Secret data (base64 encoded)
secrets: {}
  # API_KEY: "base64encodedvalue"

# PostgreSQL configuration
postgresql:
  enabled: true
  auth:
    username: myapp
    password: changeme
    database: myapp
  primary:
    persistence:
      enabled: true
      size: 10Gi

# Redis configuration
redis:
  enabled: true
  auth:
    enabled: true
    password: changeme
  master:
    persistence:
      enabled: true
      size: 8Gi

# Pod Disruption Budget
podDisruptionBudget:
  enabled: true
  minAvailable: 1

# Network Policy
networkPolicy:
  enabled: false
  ingress: []
  egress: []
```

## Template Helpers (_helpers.tpl)

```yaml
{{/*
Expand the name of the chart.
*/}}
{{- define "my-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "my-app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "my-app.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "my-app.labels" -}}
helm.sh/chart: {{ include "my-app.chart" . }}
{{ include "my-app.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "my-app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "my-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "my-app.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "my-app.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}
```

## Deployment Template (templates/deployment.yaml)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "my-app.fullname" . }}
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "my-app.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
        checksum/secret: {{ include (print $.Template.BasePath "/secret.yaml") . | sha256sum }}
        {{- with .Values.podAnnotations }}
        {{- toYaml . | nindent 8 }}
        {{- end }}
      labels:
        {{- include "my-app.selectorLabels" . | nindent 8 }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "my-app.serviceAccountName" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
        - name: {{ .Chart.Name }}
          securityContext:
            {{- toYaml .Values.securityContext | nindent 12 }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.service.targetPort }}
              protocol: TCP
          livenessProbe:
            {{- toYaml .Values.livenessProbe | nindent 12 }}
          readinessProbe:
            {{- toYaml .Values.readinessProbe | nindent 12 }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          env:
            {{- toYaml .Values.env | nindent 12 }}
          {{- with .Values.envFrom }}
          envFrom:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          volumeMounts:
            - name: config
              mountPath: /etc/config
              readOnly: true
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: config
          configMap:
            name: {{ include "my-app.fullname" . }}
        - name: tmp
          emptyDir: {}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
```

## Service Template (templates/service.yaml)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "my-app.fullname" . }}
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
  {{- with .Values.service.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: http
      protocol: TCP
      name: http
  selector:
    {{- include "my-app.selectorLabels" . | nindent 4 }}
```

## Ingress Template (templates/ingress.yaml)

```yaml
{{- if .Values.ingress.enabled -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "my-app.fullname" . }}
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
  {{- with .Values.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if .Values.ingress.className }}
  ingressClassName: {{ .Values.ingress.className }}
  {{- end }}
  {{- if .Values.ingress.tls }}
  tls:
    {{- range .Values.ingress.tls }}
    - hosts:
        {{- range .hosts }}
        - {{ . | quote }}
        {{- end }}
      secretName: {{ .secretName }}
    {{- end }}
  {{- end }}
  rules:
    {{- range .Values.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            pathType: {{ .pathType }}
            backend:
              service:
                name: {{ include "my-app.fullname" $ }}
                port:
                  number: {{ $.Values.service.port }}
          {{- end }}
    {{- end }}
{{- end }}
```

## HPA Template (templates/hpa.yaml)

```yaml
{{- if .Values.autoscaling.enabled }}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "my-app.fullname" . }}
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "my-app.fullname" . }}
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  metrics:
    {{- if .Values.autoscaling.targetCPUUtilizationPercentage }}
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}
    {{- end }}
    {{- if .Values.autoscaling.targetMemoryUtilizationPercentage }}
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetMemoryUtilizationPercentage }}
    {{- end }}
{{- end }}
```

## ConfigMap Template (templates/configmap.yaml)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "my-app.fullname" . }}
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
data:
  {{- toYaml .Values.configMap.data | nindent 2 }}
```

## Secret Template (templates/secret.yaml)

```yaml
{{- if .Values.secrets }}
apiVersion: v1
kind: Secret
metadata:
  name: {{ include "my-app.fullname" . }}
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
type: Opaque
data:
  {{- toYaml .Values.secrets | nindent 2 }}
{{- end }}
```

## ServiceAccount Template (templates/serviceaccount.yaml)

```yaml
{{- if .Values.serviceAccount.create -}}
apiVersion: v1
kind: ServiceAccount
metadata:
  name: {{ include "my-app.serviceAccountName" . }}
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
  {{- with .Values.serviceAccount.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
{{- end }}
```

## PodDisruptionBudget Template (templates/pdb.yaml)

```yaml
{{- if .Values.podDisruptionBudget.enabled }}
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: {{ include "my-app.fullname" . }}
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
spec:
  minAvailable: {{ .Values.podDisruptionBudget.minAvailable }}
  selector:
    matchLabels:
      {{- include "my-app.selectorLabels" . | nindent 6 }}
{{- end }}
```

## Environment-Specific Values

### Development (values-dev.yaml)
```yaml
replicaCount: 1

image:
  pullPolicy: Always
  tag: "dev"

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi

autoscaling:
  enabled: false

ingress:
  enabled: true
  hosts:
    - host: my-app-dev.example.com
      paths:
        - path: /
          pathType: Prefix

env:
  - name: APP_ENV
    value: "development"
  - name: LOG_LEVEL
    value: "debug"

postgresql:
  primary:
    persistence:
      size: 1Gi

redis:
  master:
    persistence:
      size: 1Gi
```

### Production (values-prod.yaml)
```yaml
replicaCount: 3

image:
  pullPolicy: IfNotPresent
  tag: "1.0.0"

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20

ingress:
  enabled: true
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rate-limit: "100"
  hosts:
    - host: my-app.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: my-app-tls
      hosts:
        - my-app.example.com

podDisruptionBudget:
  enabled: true
  minAvailable: 2

postgresql:
  primary:
    persistence:
      size: 50Gi
    resources:
      requests:
        cpu: 500m
        memory: 1Gi

redis:
  master:
    persistence:
      size: 20Gi
    resources:
      requests:
        cpu: 250m
        memory: 512Mi
```

## Chart Generation Script

```python
from pathlib import Path
from typing import Dict, Optional
import yaml

class HelmChartGenerator:
    """Generate Helm chart structure."""

    def __init__(self, chart_name: str, output_dir: str = "."):
        self.chart_name = chart_name
        self.output_dir = Path(output_dir) / chart_name

    def generate(self, config: Optional[Dict] = None):
        """Generate complete chart structure."""

        # Create directories
        self._create_structure()

        # Generate files
        self._generate_chart_yaml(config)
        self._generate_values_yaml(config)
        self._generate_templates()
        self._generate_helpers()
        self._generate_notes()
        self._generate_readme()
        self._generate_helmignore()

        print(f"✅ Helm chart '{self.chart_name}' generated at {self.output_dir}")

    def _create_structure(self):
        """Create directory structure."""
        dirs = [
            self.output_dir,
            self.output_dir / "templates",
            self.output_dir / "charts",
        ]
        for d in dirs:
            d.mkdir(parents=True, exist_ok=True)

    def _generate_chart_yaml(self, config: Optional[Dict]):
        """Generate Chart.yaml."""
        chart_yaml = {
            "apiVersion": "v2",
            "name": self.chart_name,
            "description": f"A Helm chart for {self.chart_name}",
            "type": "application",
            "version": "0.1.0",
            "appVersion": "1.0.0",
        }

        if config and "dependencies" in config:
            chart_yaml["dependencies"] = config["dependencies"]

        path = self.output_dir / "Chart.yaml"
        with open(path, "w") as f:
            yaml.dump(chart_yaml, f, default_flow_style=False)

    def _generate_values_yaml(self, config: Optional[Dict]):
        """Generate values.yaml."""
        # Use the comprehensive values.yaml template from above
        # This would be the full default values
        pass

    def _generate_templates(self):
        """Generate template files."""
        templates = [
            "deployment.yaml",
            "service.yaml",
            "ingress.yaml",
            "configmap.yaml",
            "secret.yaml",
            "hpa.yaml",
            "pdb.yaml",
            "serviceaccount.yaml",
        ]

        for template in templates:
            # Write template content
            pass

    def _generate_helpers(self):
        """Generate _helpers.tpl."""
        pass

    def _generate_notes(self):
        """Generate NOTES.txt."""
        notes = f"""
1. Get the application URL by running:
{{{{- if .Values.ingress.enabled }}}}
  http{{{{- if .Values.ingress.tls }}}}s{{{{- end }}}}://{{{{ index .Values.ingress.hosts 0 "host" }}}}
{{{{- else if contains "NodePort" .Values.service.type }}}}
  export NODE_PORT=$(kubectl get --namespace {{{{ .Release.Namespace }}}} -o jsonpath="{{{{.spec.ports[0].nodePort}}}}" services {{{{ include "{self.chart_name}.fullname" . }}}})
  export NODE_IP=$(kubectl get nodes --namespace {{{{ .Release.Namespace }}}} -o jsonpath="{{{{.items[0].status.addresses[0].address}}}}")
  echo http://$NODE_IP:$NODE_PORT
{{{{- else if contains "ClusterIP" .Values.service.type }}}}
  export POD_NAME=$(kubectl get pods --namespace {{{{ .Release.Namespace }}}} -l "app.kubernetes.io/name={{{{ include "{self.chart_name}.name" . }}}},app.kubernetes.io/instance={{{{ .Release.Name }}}}" -o jsonpath="{{{{.items[0].metadata.name}}}}")
  echo "Visit http://127.0.0.1:8080 to use your application"
  kubectl --namespace {{{{ .Release.Namespace }}}} port-forward $POD_NAME 8080:80
{{{{- end }}}}
"""

        path = self.output_dir / "templates" / "NOTES.txt"
        with open(path, "w") as f:
            f.write(notes.strip())

    def _generate_readme(self):
        """Generate README.md."""
        readme = f"""# {self.chart_name}

## Installation

```bash
helm install my-release ./{self.chart_name}
```

## Configuration

See `values.yaml` for configuration options.

## Upgrading

```bash
helm upgrade my-release ./{self.chart_name}
```

## Uninstalling

```bash
helm uninstall my-release
```
"""

        path = self.output_dir / "README.md"
        with open(path, "w") as f:
            f.write(readme)

    def _generate_helmignore(self):
        """Generate .helmignore."""
        helmignore = """
# Patterns to ignore when building packages.
*.swp
*.bak
*.tmp
*.orig
*~
.DS_Store
.git/
.gitignore
.bzr/
.bzrignore
.hg/
.hgignore
.svn/
*.tgz
.idea/
*.tmproj
.vscode/
"""

        path = self.output_dir / ".helmignore"
        with open(path, "w") as f:
            f.write(helmignore.strip())
```

## Usage Commands

```bash
# Create new chart
helm create my-app

# Validate chart
helm lint my-app/

# Template (dry-run)
helm template my-app ./my-app

# Install chart
helm install my-release ./my-app

# Install with custom values
helm install my-release ./my-app -f values-prod.yaml

# Upgrade release
helm upgrade my-release ./my-app

# Rollback release
helm rollback my-release 1

# Uninstall release
helm uninstall my-release

# Package chart
helm package my-app/

# List releases
helm list

# Get release values
helm get values my-release

# Test release
helm test my-release
```

## Best Practices

1. **Use _helpers.tpl** for reusable template logic
2. **Version your charts** semantically
3. **Document all values** in values.yaml comments
4. **Use checksums** for ConfigMaps/Secrets to trigger rollouts
5. **Implement health checks** (liveness/readiness probes)
6. **Set resource limits** to prevent resource exhaustion
7. **Use PodDisruptionBudgets** for high availability
8. **Enable autoscaling** for production
9. **Use secrets management** (Sealed Secrets, External Secrets)
10. **Test charts** with different value combinations

## Notes

- Always run `helm lint` before packaging
- Use `helm template` to debug templates
- Version charts independently from app versions
- Store charts in a chart repository
- Use Helm hooks for complex deployment scenarios
- Consider using Helmfile for managing multiple releases
