#!/bin/bash

BASE_URL="http://localhost:8000"

echo "Creating user..."
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL/users \
    -H "Content-Type: application/json" \
    -d '{"username": "andrew", "email": "andrew@example.com", "password": "secret123"}')

if echo "$CREATE_RESPONSE" | jq -e '.id' >/dev/null 2>&1; then
    echo "User created successfully"
    echo $CREATE_RESPONSE | jq
else
    echo "User already exists, skipping..."
fi

echo ""
echo "Logging in..."
TOKEN=$(curl -s -X POST $BASE_URL/login \
    -H "Content-Type: application/json" \
    -d '{"username": "andrew", "password": "secret123"}' | jq -r '.access_token')

echo "Token: $TOKEN"

echo ""
echo "Hitting protected route..."
curl -s $BASE_URL/protected \
    -H "Authorization: Bearer $TOKEN" | jq
