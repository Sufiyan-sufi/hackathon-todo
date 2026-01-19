#!/bin/bash
echo "Checking prerequisites..."
commands=(
  "git --version"
  "python3 --version"
  "uv --version"
  "node --version"
  "specifyplus --version || echo 'Spec-Kit Plus not found'"
  "psql --version"
  "docker --version"
  "minikube version"
  "kubectl version --client"
  "helm version"
  "kubectl ai --help || echo 'kubectl-ai not installed'"
  "dapr --version || echo 'Dapr not installed'"
)
for cmd in "${commands[@]}"; do
  echo ">>> $cmd"
  eval $cmd
  echo ""
done
