#!/bin/bash

# Set error handling
set -oe pipefail

source lib.sh

# Installation script must be run as root
if [ "$EUID" -ne 0 ]; then
  log_fatal "Please run as root"
fi

files="client_settings.json themis-client.service"
exitFlag=0
for file in $files; do
    if [ ! -f "$file" ]; then
        log_error "\"$file\" file does not exist. It is required for this script to run."
        exitFlag=1
    fi
done

if (( $exitFlag != 0 )); then
  exit 1
fi

config_dir="/etc/themis-client"

# Create config directory with permissions
mkdir -p "$config_dir"
chmod 755 "$config_dir"

# Copy executable
log_info "Copying client exe to local bin directory"
cp "client" "/usr/local/bin/themis-client"

# Create and copy config files
log_info "Creating ${config_dir}/policy_storage.json"
touch "${config_dir}/policy_storage.json"

log_info "Copying client_settings.json to ${config_dir}"
cp "client_settings.json" "${config_dir}/settings.json"

# Copy and link service file
log_info "Copying service file to /etc/systemd/system/themis-client.service"
cp "themis-client.service" "/etc/systemd/system/themis-client.service"
chmod 644 "/etc/systemd/system/themis-client.service"

log_info "Reloading systemd daemon"
systemctl daemon-reload

log_info "Enabling service 'themis-client' to start at boot"
systemctl enable "themis-client"
