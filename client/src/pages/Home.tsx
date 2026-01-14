import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Star } from "lucide-react";

interface Video {
  id: number;
  title: string;
  link: string;
  duration: string;
  ageGroup: string;
  category: string[];
  summary: string;
  reason: string;
  rating: number;
  platform: string;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedVideoId, setExpandedVideoId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/videos.json")
      .then(res => res.json())
      .then(data => {
        setVideos(data);
        setFilteredVideos(data);
      })
      .catch(err => console.error("Failed to load videos:", err));
  }, []);

  useEffect(() => {
    let result = videos;
    if (searchTerm) {
      result = result.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredVideos(result);
  }, [searchTerm, videos]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-border">
        <div className="container py-4">
          <h1 className="text-3xl font-bold text-primary">周末放映室</h1>
          <p className="text-sm text-muted-foreground mt-1">精选优质儿童短视频</p>
        </div>
      </header>

      <section className="py-12 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container">
          <h2 className="text-4xl font-bold text-primary mb-4">发现精彩的学习世界</h2>
          <p className="text-lg text-foreground/80">为 3-12 岁儿童精心策划的高质量短视频</p>
        </div>
      </section>

      <section className="bg-white border-b border-border py-6 sticky top-16 z-40">
        <div className="container">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="搜索视频..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <p className="text-sm text-muted-foreground mb-6">
            找到 {filteredVideos.length} 个视频
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="video-card cursor-pointer"
                onClick={() => setExpandedVideoId(expandedVideoId === video.id ? null : video.id)}
              >
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 border-b border-border">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-primary flex-1">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-1 bg-secondary/20 px-2 py-1 rounded-full">
                      <Star size={14} className="text-secondary fill-secondary" />
                      <span className="text-xs font-semibold">{video.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {video.ageGroup}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {video.duration}
                    </Badge>
                  </div>

                  <p className="text-sm text-foreground">
                    {video.summary}
                  </p>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {video.category.map(cat => (
                      <span key={cat} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                  <a
                    href={video.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>

                {expandedVideoId === video.id && (
                  <div className="border-t border-border p-4 bg-muted/30">
                    <h4 className="font-semibold text-foreground mb-2">家长推荐理由</h4>
                    <p className="text-sm text-foreground mb-4">
                      {video.reason}
                    </p>
                    <Button
                      asChild
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <a href={video.link} target="_blank" rel="noopener noreferrer">
                        在 {video.platform} 上观看
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container">
          <p className="text-center text-sm">© 2025 周末放映室 | 为儿童创造美好的学习体验</p>
        </div>
      </footer>
    </div>
  );
}
