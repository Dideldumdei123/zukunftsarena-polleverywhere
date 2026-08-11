#!/bin/bash
# Installiert das Add-in in PowerPoint fuer Mac (Sideloading).
# Muss auf JEDEM Rechner laufen, von dem aus praesentiert wird - ein
# sideloadetes Add-in reist nicht in der .pptx mit.
set -euo pipefail

WEF="$HOME/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef"
SRC="$(cd "$(dirname "$0")" && pwd)/manifest.xml"

if pgrep -xq "Microsoft PowerPoint"; then
  echo "Bitte PowerPoint zuerst beenden."
  exit 1
fi

mkdir -p "$WEF"
cp "$SRC" "$WEF/"
echo "Manifest kopiert nach:"
echo "  $WEF/manifest.xml"
echo
echo "Jetzt PowerPoint starten und einfuegen ueber:"
echo "  Start (Home) > Add-Ins > Meine Add-Ins > Zukunftsarena Live"
