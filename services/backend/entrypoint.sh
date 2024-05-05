#!/bin/bash

while ! pg_isready -h "db" -p 5432 > /dev/null 2>&1; do
    echo "Waiting for PostgreSQL"
    sleep 1
done
echo "PostgreSQL is up"

# Execute the provided command
exec "$@"