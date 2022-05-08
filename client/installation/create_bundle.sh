#!/bin/bash

# Set error handling
set -oe pipefail

source lib.sh

cp ../client .

files="client themis-client.service client_install.sh lib.sh"
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

log_info "Zipping files into installer.zip"
zip -v installer.zip client themis-client.service client_install.sh lib.sh