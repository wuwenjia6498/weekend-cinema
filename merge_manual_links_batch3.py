import json
import os

# 读取原始 videos.json
with open('/home/ubuntu/weekend-cinema/client/public/videos.json', 'r', encoding='utf-8') as f:
    videos = json.load(f)

# 收集所有批次的人工修复文件
fixed_links = {}
batch_files = [f for f in os.listdir('/home/ubuntu/weekend-cinema') if f.startswith('manual_fixed_links_batch') and f.endswith('.json')]

for batch_file in batch_files:
    with open(os.path.join('/home/ubuntu/weekend-cinema', batch_file), 'r', encoding='utf-8') as f:
        batch_data = json.load(f)
        fixed_links.update(batch_data)

# 更新视频链接
updated_count = 0
for video in videos:
    video_id = str(video['id'])
    if video_id in fixed_links:
        video['link'] = fixed_links[video_id]
        updated_count += 1

# 保存更新后的 videos.json
with open('/home/ubuntu/weekend-cinema/client/public/videos.json', 'w', encoding='utf-8') as f:
    json.dump(videos, f, ensure_ascii=False, indent=2)

print(f"Successfully updated {updated_count} video links.")
