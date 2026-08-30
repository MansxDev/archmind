#!/usr/bin/env bash
# ArchMind — Install to user local directories
# Usage: ./install.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BINARY="$PROJECT_DIR/src-tauri/target/release/archmind"
DESKTOP="$SCRIPT_DIR/arch/archmind.desktop"
ICON_DIR="$PROJECT_DIR/src-tauri/icons"

PREFIX="${HOME}/.local"
BIN_DIR="$PREFIX/bin"
APP_DIR="$PREFIX/share/applications"
ICON_DIR_DEST="$PREFIX/share/icons/hicolor"

# Check binary exists
if [ ! -f "$BINARY" ]; then
  echo "ERROR: Binary not found at $BINARY"
  echo "Run 'cargo build --release' in src-tauri/ first."
  exit 1
fi

echo "Installing ArchMind..."

# 1. Binary → ~/.local/bin/
mkdir -p "$BIN_DIR"
cp "$BINARY" "$BIN_DIR/archmind"
chmod +x "$BIN_DIR/archmind"
echo "  ✓ Binary → $BIN_DIR/archmind"

# 2. Desktop entry → ~/.local/share/applications/
mkdir -p "$APP_DIR"
cp "$DESKTOP" "$APP_DIR/archmind.desktop"
echo "  ✓ Desktop → $APP_DIR/archmind.desktop"

# 3. Icons → ~/.local/share/icons/hicolor/
for size in 32x32 128x128 256x256; do
  src="$ICON_DIR/${size}.png"
  if [ -f "$src" ]; then
    mkdir -p "$ICON_DIR_DEST/$size/apps"
    cp "$src" "$ICON_DIR_DEST/$size/apps/archmind.png"
    echo "  ✓ Icon ${size} → $ICON_DIR_DEST/$size/apps/archmind.png"
  fi
done

# 4. Update desktop database
update-desktop-database "$APP_DIR" 2>/dev/null || true

# 5. Update icon cache
gtk-update-icon-cache -f -t "$ICON_DIR_DEST" 2>/dev/null || true

# 6. Check if ~/.local/bin is in PATH
if ! echo "$PATH" | grep -q "$BIN_DIR"; then
  echo ""
  echo "⚠  $BIN_DIR is not in your PATH."
  echo "   Add this to ~/.zshrc or ~/.bashrc:"
  echo ""
  echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
  echo ""
fi

echo ""
echo "Done! You can now:"
echo "  • Run:    archmind"
echo "  • Rofi:   rofi -show drun  →  search 'ArchMind'"
echo "  • Hotkey: bind archmind to a key in your WM config"
