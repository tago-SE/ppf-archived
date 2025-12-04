#!/bin/bash
set -e

echo "Migrating DB..."
yarn run payload migrate & PID=$!
# Wait for migration to finish
wait $PID

echo "Seeding DB..."
yarn run seed & PID=$!
# Wait for seed to finish
wait $PID

echo "Running integration tests..."
yarn run test:integration & PID=$!

wait $PID
