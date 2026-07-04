#!/usr/bin/env bash

# Helper to terminate all port-forwarding and proxy tunnels running on Mac host

echo "=== Terminating all Kubectl Port-Forward processes ==="
pkill -f "kubectl port-forward"
if [ $? -eq 0 ]; then
    echo "Successfully killed port-forwards."
else
    echo "No active port-forwards found."
fi

echo "=== Terminating all Kubectl Proxy processes ==="
pkill -f "kubectl proxy"
if [ $? -eq 0 ]; then
    echo "Successfully killed proxy servers."
else
    echo "No active proxy servers found."
fi
