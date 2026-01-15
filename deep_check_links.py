import json
import requests
from bs4 import BeautifulSoup
import re
import time

def get_video_info(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            return None, None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.find('title').text.strip() if soup.find('title') else "Unknown Title"
        
        # 尝试提取时长（这在静态页面中可能较难，主要依赖标题判断）
        # Bilibili 页面通常包含时长元数据
        duration = "Unknown"
        
        return title, duration
    except Exception as e:
        return None, None

with open('/home/ubuntu/weekend-cinema/client/public/videos.json', 'r', encoding='utf-8') as f:
    videos = json.load(f)

report = []
error_ids = []

print("Starting deep check...")
for video in videos:
    original_title = video['title']
    link = video['link']
    
    actual_title, _ = get_video_info(link)
    
    status = "OK"
    reason = ""
    
    if not actual_title:
        status = "ERROR"
        reason = "Link unreachable"
    elif "解说" in actual_title or "反应" in actual_title or "杂谈" in actual_title:
        status = "ERROR"
        reason = "Likely commentary/reaction video"
    elif "404" in actual_title or "出错" in actual_title or "视频已失效" in actual_title:
        status = "ERROR"
        reason = "Video deleted/invalid"
    
    # 简单的关键词匹配检查
    # 移除括号内的内容进行匹配
    clean_orig_title = re.sub(r'[\(（].*?[\)）]', '', original_title).strip()
    if status == "OK" and clean_orig_title not in actual_title and actual_title not in clean_orig_title:
         # 进一步放宽匹配，只要包含部分关键词
         keywords = clean_orig_title.split(' ')
         match_count = sum(1 for k in keywords if k in actual_title)
         if match_count == 0:
             status = "WARNING"
             reason = "Title mismatch"

    result = {
        "id": video['id'],
        "original_title": original_title,
        "link": link,
        "actual_title": actual_title,
        "status": status,
        "reason": reason
    }
    report.append(result)
    
    if status != "OK":
        error_ids.append(video['id'])
        print(f"[FAIL] ID: {video['id']} | Orig: {original_title} | Actual: {actual_title} | Reason: {reason}")
    else:
        print(f"[PASS] ID: {video['id']} | Orig: {original_title} | Actual: {actual_title}")
        
    time.sleep(1) # 避免请求过快

with open('/home/ubuntu/weekend-cinema/link_check_report.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print(f"\nCheck complete. Found {len(error_ids)} potential issues.")
print(f"Error IDs: {error_ids}")
