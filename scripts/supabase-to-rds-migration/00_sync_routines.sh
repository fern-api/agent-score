#!/usr/bin/env bash
# Idempotently copy all user-defined functions/procedures and TRIGGERS for the
# app schema(s) from Supabase -> RDS.
#
# The one-time 00_schema_sync.sh already brings routines + triggers across, but
# logical replication does NOT carry them, so any function or trigger ADDED or
# CHANGED on Supabase after that initial sync would otherwise never reach RDS.
# Run this any time to re-sync (it is safe to re-run — functions become CREATE
# OR REPLACE and each trigger is DROP IF EXISTS + CREATE). 04_cutover.sh also
# invokes it automatically just before the validation gate so the routines on
# RDS match the source at the moment of cutover.
#
# Requires the target tables to already exist on RDS — run 00_schema_sync.sh
# first. Targets RDS_TARGET_DB inside the existing instance (see config.sh).
source "$(dirname "$0")/lib.sh"

sync_functions_triggers
