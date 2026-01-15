import json
import requests
import re
import os
import time
from urllib.parse import urlparse

def get_bilibili_cover(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com/'
    }
    
    try:
        # 提取 BV 号
        bv_match = re.search(r'BV[a-zA-Z0-9]+', url)
        if not bv_match:
            print(f"无法从链接提取 BV 号: {url}")
            return None
            
        bv_id = bv_match.group(0)
        api_url = f"https://api.bilibili.com/x/web-interface/view?bvid={bv_id}"
        
        response = requests.get(api_url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data['code'] == 0:
                return data['data']['pic']
            else:
                print(f"API 返回错误: {data['message']}")
        else:
            print(f"请求失败: {response.status_code}")
            
    except Exception as e:
        print(f"获取封面出错 {url}: {str(e)}")
        
    return None

def download_image(url, save_path):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            with open(save_path, 'wb') as f:
                f.write(response.content)
            return True
    except Exception as e:
        print(f"下载图片失败 {url}: {str(e)}")
    return False

def main():
    json_path = '/home/ubuntu/weekend-cinema/client/public/videos.json'
    covers_dir = '/home/ubuntu/weekend-cinema/client/public/images/covers'
    
    # 确保目录存在
    os.makedirs(covers_dir, exist_ok=True)
    
    with open(json_path, 'r', encoding='utf-8') as f:
        videos = json.load(f)
    
    updated_count = 0
    
    for video in videos:
        print(f"正在处理: {video['title']} (ID: {video['id']})")
        
        # 如果已有本地封面且不是默认的，跳过（或者强制更新，这里选择如果已有就不覆盖，除非是之前手动映射的）
        # 但为了保证全量更新，我们检查文件是否存在
        cover_filename = f"{video['id']}.jpg"
        local_cover_path = os.path.join(covers_dir, cover_filename)
        
        # 获取 Bilibili 封面
        if 'bilibili.com' in video['link']:
            cover_url = get_bilibili_cover(video['link'])
            if cover_url:
                print(f"找到封面: {cover_url}")
                if download_image(cover_url, local_cover_path):
                    print(f"已下载封面至: {local_cover_path}")
                    updated_count += 1
                    # 稍微延时避免请求过快
                    time.sleep(1)
                else:
                    print("下载失败")
            else:
                print("未找到封面")
        else:
            print("非 Bilibili 链接，跳过")
            
    print(f"处理完成，共更新 {updated_count} 个封面")

if __name__ == "__main__":
    main()
