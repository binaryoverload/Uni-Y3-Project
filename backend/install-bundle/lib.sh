#!/bin/bash

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