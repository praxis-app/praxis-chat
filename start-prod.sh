#!/bin/bash

set -e

if [ "$DB_MIGRATIONS" = "true" ]; then
    cd /app && npm run typeorm:run
else
    echo "DB_MIGRATIONS is not set. Skipping migrations."
fi

node /app/dist/src/main.js