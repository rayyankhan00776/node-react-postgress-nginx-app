#!/usr/bin/env bash

# Prometheus and Grafana Operations Helper

NAMESPACE="monitoring"

show_usage() {
    echo "Usage: $0 [start|stop|forward]"
    echo "  start   : Scale up monitoring stack (Prometheus, Grafana, Node-Exporter)"
    echo "  stop    : Scale down monitoring stack to 0 replicas to save Mac memory/CPU"
    echo "  forward : Start background port-forwards for Grafana (3000) and Prometheus (9090)"
    exit 1
}

if [ -z "$1" ]; then
    show_usage
fi

case "$1" in
    start)
        echo "=== Activating Prometheus Node Exporter DaemonSets ==="
        kubectl patch daemonset/prometheus-stack-prometheus-node-exporter -n $NAMESPACE -p '{"spec":{"template":{"spec":{"nodeSelector":null}}}}'

        echo "=== Scaling Up Deployments ==="
        kubectl scale deployment/prometheus-stack-grafana -n $NAMESPACE --replicas=1
        kubectl scale deployment/prometheus-stack-kube-prom-operator -n $NAMESPACE --replicas=1
        kubectl scale deployment/prometheus-stack-kube-state-metrics -n $NAMESPACE --replicas=1

        echo "=== Scaling Up StatefulSets ==="
        kubectl scale statefulset/prometheus-prometheus-stack-kube-prom-prometheus -n $NAMESPACE --replicas=1
        kubectl scale statefulset/alertmanager-prometheus-stack-kube-prom-alertmanager -n $NAMESPACE --replicas=1
        
        echo "Monitoring stack scaling initiated. Use 'kubectl get pods -n $NAMESPACE' to watch progress."
        ;;
        
    stop)
        echo "=== Suspending Prometheus Node Exporter DaemonSets ==="
        kubectl patch daemonset/prometheus-stack-prometheus-node-exporter -n $NAMESPACE -p '{"spec":{"template":{"spec":{"nodeSelector":{"non-existing-label":"true"}}}}}'

        echo "=== Scaling Down Deployments to 0 ==="
        kubectl scale deployment/prometheus-stack-grafana -n $NAMESPACE --replicas=0
        kubectl scale deployment/prometheus-stack-kube-prom-operator -n $NAMESPACE --replicas=0
        kubectl scale deployment/prometheus-stack-kube-state-metrics -n $NAMESPACE --replicas=0

        echo "=== Scaling Down StatefulSets to 0 ==="
        kubectl scale statefulset/prometheus-prometheus-stack-kube-prom-prometheus -n $NAMESPACE --replicas=0
        kubectl scale statefulset/alertmanager-prometheus-stack-kube-prom-alertmanager -n $NAMESPACE --replicas=0
        
        echo "=== Stopping Active Port Forwards ==="
        pkill -f "kubectl port-forward.*service/prometheus-stack-grafana" &>/dev/null
        pkill -f "kubectl port-forward.*service/prometheus-stack-kube-prom-prometheus" &>/dev/null
        
        echo "Monitoring stack suspended."
        ;;
        
    forward)
        echo "=== Checking if Pods are Ready ==="
        echo "Waiting for Grafana deployment to roll out..."
        kubectl rollout status deployment/prometheus-stack-grafana -n $NAMESPACE --timeout=90s
        
        echo "Waiting for Prometheus statefulset to roll out..."
        kubectl rollout status statefulset/prometheus-prometheus-stack-kube-prom-prometheus -n $NAMESPACE --timeout=90s

        echo "=== Starting Port Forward for Grafana (Port 3000) ==="
        pkill -f "kubectl port-forward.*service/prometheus-stack-grafana" &>/dev/null
        kubectl port-forward service/prometheus-stack-grafana -n $NAMESPACE 3000:80 &
        
        echo "=== Starting Port Forward for Prometheus (Port 9090) ==="
        pkill -f "kubectl port-forward.*service/prometheus-stack-kube-prom-prometheus" &>/dev/null
        kubectl port-forward service/prometheus-stack-kube-prom-prometheus -n $NAMESPACE 9090:9090 &
        
        echo "=== Getting Grafana Admin Login Password ==="
        sleep 2
        PASSWORD=$(kubectl get secret --namespace $NAMESPACE -l app.kubernetes.io/component=admin-secret -o jsonpath="{.items[0].data.admin-password}" | base64 --decode ; echo)
        echo "----------------------------------------"
        echo "Grafana Password: $PASSWORD"
        echo "Username: admin"
        echo "----------------------------------------"
        echo "Grafana Dashboard: http://localhost:3000"
        echo "Prometheus Query UI: http://localhost:9090"
        ;;
        
    *)
        show_usage
        ;;
esac
