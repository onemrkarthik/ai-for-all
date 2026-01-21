#!/bin/bash
#
# install-hooks.sh - Installs git hooks for this repository
#
# This script copies custom git hooks from scripts/git-hooks/ to .git/hooks/
# Run this after cloning the repository or use `npm run setup`

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
HOOKS_SOURCE="$SCRIPT_DIR/git-hooks"
HOOKS_TARGET="$REPO_ROOT/.git/hooks"

# Check if we're in a git repository
if [ ! -d "$REPO_ROOT/.git" ]; then
    echo "⚠️  Not a git repository, skipping hook installation"
    exit 0
fi

# Check if hooks source directory exists
if [ ! -d "$HOOKS_SOURCE" ]; then
    echo "⚠️  No git-hooks directory found at $HOOKS_SOURCE"
    exit 0
fi

echo "📦 Installing git hooks..."

# Install each hook
for hook in "$HOOKS_SOURCE"/*; do
    if [ -f "$hook" ]; then
        hook_name=$(basename "$hook")
        target="$HOOKS_TARGET/$hook_name"
        
        # Copy the hook
        cp "$hook" "$target"
        chmod +x "$target"
        
        echo "   ✓ Installed $hook_name"
    fi
done

echo "✅ Git hooks installed successfully"
echo ""
echo "Installed hooks will prevent:"
echo "   - Pushing to Houzz GitHub namespaces (pre-push)"
echo "   - Pushing to IVY GitHub namespaces (pre-push)"
echo ""
