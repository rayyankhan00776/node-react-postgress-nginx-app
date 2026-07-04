#!/usr/bin/env bash

# Kubernetes Dashboard Operations Helper

NAMESPACE="kubernetes-dashboard"

show_usage() {
    echo "Usage: $0 [start|stop|token]"
    echo "  start : Scale up dashboard & start kubectl proxy in the background"
    echo "  stop  : Scale down dashboard to 0 replicas & stop kubectl proxy"
    echo "  token : Generate a login token"
    exit 1
}

if [ -z "$1" ]; then
    show_usage
fi

case "$1" in
    start)
        echo "=== Scaling Up Kubernetes Dashboard ==="
        kubectl scale deployment/kubernetes-dashboard -n $NAMESPACE --replicas=1
        kubectl scale deployment/dashboard-metrics-scraper -n $NAMESPACE --replicas=1
        
        echo "=== Ensuring Admin ClusterRoleBinding exists ==="
        kubectl get clusterrolebinding kubernetes-dashboard-admin &>/dev/null
        if [ $? -ne 0 ]; then
            kubectl create clusterrolebinding kubernetes-dashboard-admin \
              --clusterrole=cluster-admin \
              --serviceaccount=kubernetes-dashboard:kubernetes-dashboard
        fi

        echo "=== Starting Kubectl Proxy ==="
        # Kill existing proxy first to avoid port conflicts
        pkill -f "kubectl proxy" &>/dev/null
        kubectl proxy &
        
        echo "=== Generating Dashboard Login Token ==="
        sleep 2
        TOKEN=$(kubectl -n $NAMESPACE create token kubernetes-dashboard)
        echo "----------------------------------------"
        echo "Login Token:"
        echo "$TOKEN"
        echo "----------------------------------------"
        echo "Dashboard is available at:"
        echo "http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/"
        ;;
        
    stop)
        echo "=== Stopping Kubectl Proxy ==="
        pkill -f "kubectl proxy" &>/dev/null
        
        echo "=== Scaling Down Kubernetes Dashboard to 0 ==="
        kubectl scale deployment/kubernetes-dashboard -n $NAMESPACE --replicas=0
        kubectl scale deployment/dashboard-metrics-scraper -n $NAMESPACE --replicas=0
        echo "Dashboard suspended."
        ;;
        
    token)
        echo "=== Generating Dashboard Login Token ==="
        kubectl -n $NAMESPACE create token kubernetes-dashboard
        ;;
        
    *)
        show_usage
        ;;
esac
