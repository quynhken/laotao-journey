#!/bin/bash
# Restore settings từ backup file

API="https://cxpjsnklwnsmykphuslw.supabase.co/functions/v1/make-server-ae2dcaa6"
ADMIN_TOKEN="123312"
BACKUP_DIR="$(dirname "$0")/../backup"
FILE="${1:-$BACKUP_DIR/settings.json}"

if [ ! -f "$FILE" ]; then
  echo "❌ File không tồn tại: $FILE"
  echo "Usage: ./restore.sh [path/to/settings.json]"
  exit 1
fi

echo "🔄 Restoring from: $FILE"

RESULT=$(python3 -c "
import json, sys
with open('$FILE') as f:
    s = json.load(f)
print(f'  provinces: {len(s.get(\"provinces\",[]))}')
print(f'  subLocations: {len(s.get(\"subLocations\",[]))}')
print(f'  videos: {len(s.get(\"videos\",[]))}')
payload = json.dumps({'settings': s})
print('PAYLOAD_LEN:' + str(len(payload)))
" 2>&1)

echo "$RESULT" | grep -v PAYLOAD_LEN

PAYLOAD=$(python3 -c "
import json
with open('$FILE') as f:
    s = json.load(f)
print(json.dumps({'settings': s}))
")

STATUS=$(curl -s -o /tmp/restore_resp.txt -w "%{http_code}" \
  -X PUT "$API/settings?adminToken=$ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

if [ "$STATUS" = "200" ]; then
  echo "✅ Restore thành công!"
else
  echo "❌ Lỗi HTTP $STATUS"
  cat /tmp/restore_resp.txt
fi
