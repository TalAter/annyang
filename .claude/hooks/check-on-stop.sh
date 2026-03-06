#!/bin/bash
INPUT=$(cat)

# Prevent infinite loops — if we already triggered a continuation, skip
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0
fi

cd "$(dirname "$0")/../.." || exit 0

ERRORS=""

# 1. Prettier (autoformat, don't block on this)
pnpm format > /dev/null 2>&1

# 2. ESLint
ESLINT_OUTPUT=$(pnpm lint 2>&1)
if [ $? -ne 0 ]; then
  ERRORS="${ERRORS}ESLint failed:\n${ESLINT_OUTPUT}\n\n"
fi

# 3. TypeScript type checking
TYPECHECK_OUTPUT=$(pnpm typecheck 2>&1)
if [ $? -ne 0 ]; then
  ERRORS="${ERRORS}TypeScript failed:\n${TYPECHECK_OUTPUT}\n\n"
fi

# 4. Tests
TEST_OUTPUT=$(pnpm test 2>&1)
if [ $? -ne 0 ]; then
  ERRORS="${ERRORS}Tests failed:\n${TEST_OUTPUT}\n\n"
fi

if [ -n "$ERRORS" ]; then
  echo -e "$ERRORS" >&2
  exit 2
fi

exit 0
