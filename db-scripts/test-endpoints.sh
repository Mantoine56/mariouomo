#!/bin/bash
# Script to test backend endpoints after database schema changes

# Set variables
API_URL="http://localhost:3001"
TOKEN=""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_result() {
  if [ "$2" -eq 0 ]; then
    echo -e "${GREEN}✓ $1${NC}"
  else
    echo -e "${RED}✗ $1${NC}"
    echo -e "${YELLOW}Response: $3${NC}"
  fi
}

# Function to make API requests
make_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local auth_header=""
  
  if [ ! -z "$TOKEN" ]; then
    auth_header="-H \"Authorization: Bearer $TOKEN\""
  fi
  
  if [ "$method" == "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL$endpoint" -H "Content-Type: application/json" $auth_header)
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" -H "Content-Type: application/json" $auth_header -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  echo "$http_code|$body"
}

echo "===== Testing Backend Endpoints After Schema Changes ====="
echo "API URL: $API_URL"
echo ""

# Test 1: Health check
echo "Testing health check endpoint..."
result=$(make_request "GET" "/health")
http_code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$http_code" -eq 200 ]; then
  print_result "Health check endpoint" 0 "$body"
else
  print_result "Health check endpoint" 1 "$body"
fi

# Test 2: Authentication status
echo -e "\nTesting authentication status endpoint..."
result=$(make_request "GET" "/auth/status")
http_code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 401 ]; then
  print_result "Authentication status endpoint" 0 "$body"
else
  print_result "Authentication status endpoint" 1 "$body"
fi

# Test 3: Profile endpoints
echo -e "\nTesting profile endpoints..."
result=$(make_request "GET" "/users/profiles")
http_code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 401 ]; then
  print_result "Get profiles endpoint" 0 "$body"
else
  print_result "Get profiles endpoint" 1 "$body"
fi

# Test 4: Inventory endpoints
echo -e "\nTesting inventory endpoints..."
result=$(make_request "GET" "/inventory/items")
http_code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 401 ]; then
  print_result "Get inventory items endpoint" 0 "$body"
else
  print_result "Get inventory items endpoint" 1 "$body"
fi

# Test 5: Dashboard endpoints
echo -e "\nTesting dashboard endpoints..."
result=$(make_request "GET" "/dashboard")
http_code=$(echo "$result" | cut -d'|' -f1)
body=$(echo "$result" | cut -d'|' -f2)

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 401 ]; then
  print_result "Get dashboard endpoint" 0 "$body"
else
  print_result "Get dashboard endpoint" 1 "$body"
fi

echo -e "\n===== Testing Complete ====="
echo "Run this script after applying database schema changes to verify backend functionality."
