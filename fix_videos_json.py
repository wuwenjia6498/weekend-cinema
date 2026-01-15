
import json
import re

file_path = '/home/ubuntu/weekend-cinema/client/public/videos.json'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix syntax error: ""link" -> "link"
    content = content.replace('""link"', '"link"')

    # Parse JSON
    data = json.loads(content)

    # Re-index IDs
    for index, item in enumerate(data):
        item['id'] = index + 1

    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Successfully fixed videos.json")

except Exception as e:
    print(f"Error: {e}")
