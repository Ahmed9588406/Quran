#!/bin/bash

# Test script for Typing Indicator and Mark Seen functionality
# Usage: ./test-typing-seen.sh

echo "================================"
echo "Typing Indicator & Mark Seen Tests"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}Running tests...${NC}"
echo ""

# Run tests
npm test -- \
  app/api/chats/[chatId]/typing/route.test.ts \
  app/api/chats/[chatId]/seen/route.test.ts \
  lib/chat/api.typing-seen.test.ts \
  --coverage

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Test Summary:"
    echo "- Typing Indicator REST API: ✓"
    echo "- Mark Seen REST API: ✓"
    echo "- ChatAPI Methods: ✓"
    echo ""
    echo "Next steps:"
    echo "1. Run manual integration tests (see TYPING_SEEN_INTEGRATION_TEST.md)"
    echo "2. Test with real backend and WebSocket"
    echo "3. Monitor performance metrics"
else
    echo ""
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
