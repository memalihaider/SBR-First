#!/bin/bash

# Test script for HR onboarding page functionality
# This script simulates login and tests the onboarding page

echo "Testing HR Onboarding Page Functionality"
echo "========================================"

# Step 1: Generate mock JWT token for HR manager
echo "Step 1: Generating mock JWT token for HR Manager..."

# Mock user data for hr@largify.com
USER_DATA='{"sub":"user-9","email":"hr@largify.com","role":"hr_manager","iat":'$(date +%s)',"exp":'$(($(date +%s) + 86400))'}'

# Base64 encode the payload (simple mock JWT)
TOKEN=$(echo -n "$USER_DATA" | base64 | tr -d '\n')

echo "Generated token: ${TOKEN:0:30}..."

#!/bin/bash

# Test script for HR onboarding page functionality
# This script simulates login and tests the onboarding page

echo "Testing HR Onboarding Page Functionality"
echo "========================================"

# Step 1: Generate mock JWT token for HR manager (matching MockJWTUtils format)
echo "Step 1: Generating mock JWT token for HR Manager..."

# Create payload matching the MockJWTUtils.generateToken format
TIMESTAMP=$(date +%s)
EXPIRY=$((TIMESTAMP + 86400))  # 24 hours from now
PAYLOAD="{\"sub\":\"user-9\",\"email\":\"hr@largify.com\",\"role\":\"hr_manager\",\"iat\":${TIMESTAMP}000,\"exp\":${EXPIRY}000}"

# Use node to properly base64 encode (btoa equivalent)
TOKEN=$(node -e "console.log(Buffer.from('$PAYLOAD').toString('base64'))")

echo "Generated token: ${TOKEN:0:30}..."

# Step 2: Test HR dashboard access with token
echo "Step 2: Testing HR dashboard access..."
DASHBOARD_RESPONSE=$(curl -s -H "Cookie: auth-token=$TOKEN" http://localhost:3000/hr/dashboard)

if echo "$DASHBOARD_RESPONSE" | grep -q "HR Dashboard"; then
  echo "✓ HR Dashboard accessible"
else
  echo "✗ HR Dashboard not accessible"
  echo "Response preview: ${DASHBOARD_RESPONSE:0:200}..."
fi

# Step 3: Test HR onboarding page access
echo "Step 3: Testing HR onboarding page access..."
ONBOARDING_RESPONSE=$(curl -s -H "Cookie: auth-token=$TOKEN" http://localhost:3000/hr/onboarding)

if echo "$ONBOARDING_RESPONSE" | grep -q "Employee Onboarding"; then
  echo "✓ HR Onboarding page accessible"
  echo "✓ Page contains expected content"

  # Check for key UI elements
  if echo "$ONBOARDING_RESPONSE" | grep -q "Start New Onboarding"; then
    echo "✓ 'Start New Onboarding' button found"
  else
    echo "✗ 'Start New Onboarding' button not found"
  fi

  if echo "$ONBOARDING_RESPONSE" | grep -q "View Details"; then
    echo "✓ 'View Details' button found"
  else
    echo "✗ 'View Details' button not found"
  fi

  if echo "$ONBOARDING_RESPONSE" | grep -q "Update Progress"; then
    echo "✓ 'Update Progress' button found"
  else
    echo "✗ 'Update Progress' button not found"
  fi

  if echo "$ONBOARDING_RESPONSE" | grep -q "Edit Template"; then
    echo "✓ 'Edit Template' button found"
  else
    echo "✗ 'Edit Template' button not found"
  fi

  if echo "$ONBOARDING_RESPONSE" | grep -q "Manage Templates"; then
    echo "✓ 'Manage Templates' button found"
  else
    echo "✗ 'Manage Templates' button not found"
  fi

  if echo "$ONBOARDING_RESPONSE" | grep -q "Assign Mentors"; then
    echo "✓ 'Assign Mentors' button found"
  else
    echo "✗ 'Assign Mentors' button not found"
  fi

else
  echo "✗ HR Onboarding page not accessible or missing content"
  echo "Response preview: ${ONBOARDING_RESPONSE:0:300}..."
fi

echo ""
echo "Test completed."
echo "Step 2: Testing HR dashboard access..."
DASHBOARD_RESPONSE=$(curl -s -H "Cookie: auth-token=$TOKEN" http://localhost:3000/hr/dashboard)

if echo "$DASHBOARD_RESPONSE" | grep -q "HR Dashboard"; then
  echo "✓ HR Dashboard accessible"
else
  echo "✗ HR Dashboard not accessible"
  echo "Response preview: ${DASHBOARD_RESPONSE:0:200}..."
fi

# Step 3: Test HR onboarding page access
echo "Step 3: Testing HR onboarding page access..."
ONBOARDING_RESPONSE=$(curl -s -H "Cookie: auth-token=$TOKEN" http://localhost:3000/hr/onboarding)

if echo "$ONBOARDING_RESPONSE" | grep -q "Employee Onboarding"; then
  echo "✓ HR Onboarding page accessible"
  echo "✓ Page contains expected content"

  # Check for key UI elements
  if echo "$ONBOARDING_RESPONSE" | grep -q "Start New Onboarding"; then
    echo "✓ 'Start New Onboarding' button found"
  else
    echo "✗ 'Start New Onboarding' button not found"
  fi

  if echo "$ONBOARDING_RESPONSE" | grep -q "View Details"; then
    echo "✓ 'View Details' button found"
  else
    echo "✗ 'View Details' button not found"
  fi

  if echo "$ONBOARDING_RESPONSE" | grep -q "Update Progress"; then
    echo "✓ 'Update Progress' button found"
  else
    echo "✗ 'Update Progress' button not found"
  fi

  if echo "$ONBOARDING_RESPONSE" | grep -q "Edit Template"; then
    echo "✓ 'Edit Template' button found"
  else
    echo "✗ 'Edit Template' button not found"
  fi

  if echo "$ONBOARDING_RESPONSE" | grep -q "Manage Templates"; then
    echo "✓ 'Manage Templates' button found"
  else
    echo "✗ 'Manage Templates' button not found"
  fi

  if echo "$ONBOARDING_RESPONSE" | grep -q "Assign Mentors"; then
    echo "✓ 'Assign Mentors' button found"
  else
    echo "✗ 'Assign Mentors' button not found"
  fi

else
  echo "✗ HR Onboarding page not accessible or missing content"
  echo "Response preview: ${ONBOARDING_RESPONSE:0:300}..."
fi

echo ""
echo "Test completed."