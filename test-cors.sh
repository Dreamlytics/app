#!/bin/bash

# Test CORS Configuration

echo "🧪 Testing CORS Configuration for Mobile API Access"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Wait for server
echo -e "${YELLOW}Waiting for server...${NC}"
sleep 3

# Test 1: Health Check
echo -e "\n${BLUE}Test 1: Mobile Health Endpoint${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HEALTH=$(curl -s http://localhost:3000/api/mobile/health)
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Health endpoint accessible${NC}"
  echo "$HEALTH" | jq '.' 2>/dev/null || echo "$HEALTH"
else
  echo -e "${RED}❌ Health endpoint failed${NC}"
fi

# Test 2: CORS Headers (Same Origin)
echo -e "\n${BLUE}Test 2: CORS Headers (Same Origin)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
CORS_HEADERS=$(curl -s -I http://localhost:3000/api/dreams 2>&1 | grep -i "access-control")
if [ ! -z "$CORS_HEADERS" ]; then
  echo -e "${GREEN}✅ CORS headers present:${NC}"
  echo "$CORS_HEADERS"
else
  echo -e "${YELLOW}⚠️  No CORS headers (expected for same-origin)${NC}"
fi

# Test 3: CORS Headers (Cross-Origin)
echo -e "\n${BLUE}Test 3: CORS Headers (Cross-Origin Request)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
CORS_CROSS=$(curl -s -H "Origin: capacitor://localhost" -I http://localhost:3000/api/dreams 2>&1 | grep -i "access-control")
if [ ! -z "$CORS_CROSS" ]; then
  echo -e "${GREEN}✅ CORS headers for Capacitor origin:${NC}"
  echo "$CORS_CROSS"
else
  echo -e "${RED}❌ No CORS headers for Capacitor origin${NC}"
fi

# Test 4: OPTIONS Preflight
echo -e "\n${BLUE}Test 4: OPTIONS Preflight Request${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
PREFLIGHT=$(curl -s -X OPTIONS -H "Origin: capacitor://localhost" -H "Access-Control-Request-Method: POST" -I http://localhost:3000/api/dreams 2>&1)
STATUS=$(echo "$PREFLIGHT" | head -1)
CORS_PREFLIGHT=$(echo "$PREFLIGHT" | grep -i "access-control")

if echo "$STATUS" | grep -q "204\|200"; then
  echo -e "${GREEN}✅ Preflight successful:${NC}"
  echo "$STATUS"
  echo ""
  echo -e "${GREEN}CORS Preflight Headers:${NC}"
  echo "$CORS_PREFLIGHT"
else
  echo -e "${RED}❌ Preflight failed${NC}"
  echo "$STATUS"
fi

# Test 5: Public API
echo -e "\n${BLUE}Test 5: Public API Access${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
PUBLIC_API=$(curl -s "http://localhost:3000/api/public/dreams?limit=1")
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Public API accessible${NC}"
  echo "$PUBLIC_API" | jq '.dreams[0].title' 2>/dev/null || echo "Response received"
else
  echo -e "${RED}❌ Public API failed${NC}"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✨ CORS Testing Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "  1. Visit: http://localhost:3000/mobile-cors-test"
echo "  2. Test in mobile app (iOS/Android)"
echo "  3. Check browser DevTools Network tab"
echo "  4. Verify CORS headers in mobile requests"
echo ""
echo "📚 Documentation: CORS_SETUP.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
