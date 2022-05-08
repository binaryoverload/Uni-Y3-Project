#!/bin/bash

# Set error handling
set -oe pipefail

if [[ -t 1 ]]; then
    # colors for logging in interactive mode
    [[ $COLOR_ERROR ]]    || COLOR_ERROR="\033[0;31m" # Red
    [[ $COLOR_FATAL ]]    || COLOR_FATAL="\033[0;31m" # Red
    [[ $COLOR_WARN ]]     || COLOR_WARN="\033[0;33m" # Yellow
    [[ $COLOR_INFO ]]     || COLOR_INFO="\033[0;32m" # Blue
    [[ $COLOR_OFF ]]      || COLOR_OFF="\033[0m"
else
    # no colors to be used if non-interactive
    COLOR_ERROR= COLOR_FATAL= COLOR_WARN= COLOR_INFO=
fi
readonly COLOR_ERROR COLOR_FATAL COLOR_WARN COLOR_INFO COLOR_OFF

_print_log() {
  level=$1; shift
  color_name="COLOR_${level^^}"
  color=${!color_name}

  level_formatted="${color}${level}${COLOR_OFF}"

  printf '%(%Y-%m-%d %H:%M:%S)T %-7b ' -1 "$level_formatted"
  printf '%s\n' "$@"
}

log_fatal()   { _print_log FATAL   "$@"; exit 1; }
log_error()   { _print_log ERROR   "$@"; }
log_warn()    { _print_log WARN    "$@"; }
log_info()    { _print_log INFO    "$@"; }

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
cp "themis-client" "/usr/local/bin/themis-client"

# Create and copy config files
log_info "Creating ${config_dir}/policy_storage.json"
touch "${config_dir}/policy_storage.json"

log_info "Copying client_settings.json to ${config_dir}"
cp "client_settings.json" "${config_dir}/client_settings.json"

# Copy and link service file
log_info "Copying service file to /etc/systemd/system/themis-client.service"
cp "themis-client.service" "/etc/systemd/system/themis-client.service"
chmod 644 "/etc/systemd/system/themis-client.service"

log_info "Reloading systemd daemon"
systemctl daemon-reload

log_info "Enabling service 'themis-client' to start at boot"
systemctl enable "themis-client"
