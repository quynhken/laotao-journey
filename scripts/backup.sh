#!/bin/bash
# Backup settings + visitors từ Supabase về file JSON

API="https://cxpjsnklwnsmykphuslw.supabase.co/functions/v1/make-server-ae2dcaa6"
ADMIN_TOKEN="123312"
BACKUP_DIR="$(dirname "$0")/../backup"
DATE=$(date +"%Y-%m-%d_%H-%M")

echo "📦 Backing up data..."

# Settings
curl -s "$API/settings" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d.get('settings',{}), ensure_ascii=False, indent=2))" \
  > "$BACKUP_DIR/settings.json"

# Visitors
curl -s "$API/visitors?adminToken=$ADMIN_TOKEN" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d.get('visitors',[]), ensure_ascii=False, indent=2))" \
  > "$BACKUP_DIR/visitors.json"

# Snapshot theo ngày
curl -s "$API/settings" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d.get('settings',{}), ensure_ascii=False, indent=2))" \
  > "$BACKUP_DIR/snapshots/settings_$DATE.json" 2>/dev/null || \
  (mkdir -p "$BACKUP_DIR/snapshots" && \
   curl -s "$API/settings" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d.get('settings',{}), ensure_ascii=False, indent=2))" \
   > "$BACKUP_DIR/snapshots/settings_$DATE.json")

echo "✅ Saved to backup/settings.json + backup/visitors.json"
echo "📸 Snapshot: backup/snapshots/settings_$DATE.json"

# Summary
python3 -c "
import json
with open('$BACKUP_DIR/settings.json') as f:
    s = json.load(f)
print(f'  provinces: {len(s.get(\"provinces\",[]))}')
print(f'  subLocations: {len(s.get(\"subLocations\",[]))}')
print(f'  videos: {len(s.get(\"videos\",[]))}')
print(f'  onboardingPhotos: {len(s.get(\"onboardingPhotos\",[]))}')
"
