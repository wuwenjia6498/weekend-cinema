import { useState, useEffect } from "react";
import { Search, Play, ChevronDown, ChevronUp, Star, Clock, Users, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedVideoId, setExpandedVideoId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/videos.json')
      .then(res => res.json())
      .then(data => {
        setVideos(data);
        setFilteredVideos(data);
      })
      .catch(err => console.error('Failed to load videos:', err));
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
    <div className="min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <header className="relative bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-background.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="container relative z-10 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              周末放映室
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8 leading-relaxed">
              为 3-12 岁儿童精心策划的优质短视频，
              <br />
              让孩子在故事中探索世界，在艺术中启迪智慧。
            </p>
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="text-sm py-1 px-3">严选内容</Badge>
              <Badge variant="secondary" className="text-sm py-1 px-3">艺术审美</Badge>
              <Badge variant="secondary" className="text-sm py-1 px-3">寓教于乐</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container py-4">
          <div className="relative max-w-md mx-auto md:mx-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="搜索视频标题..."
              className="pl-10 bg-muted/50 border-muted-foreground/20 focus:bg-background transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <main className="container py-12">
        {filteredVideos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">没有找到相关视频，请尝试其他关键词。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="group flex flex-col overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-card">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl font-bold text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {video.title}
                    </CardTitle>
                    <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md text-xs font-bold shrink-0">
                      <Star className="h-3 w-3 fill-current" />
                      {video.rating}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {video.category.map((cat, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs font-normal bg-secondary/50 text-secondary-foreground border-transparent">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow pb-2">
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary/60" />
                      <span>{video.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary/60" />
                      <span>{video.ageGroup}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {video.summary}
                  </p>

                  <div className={`bg-muted/30 rounded-lg p-4 text-sm transition-all duration-300 ${
                    expandedVideoId === video.id ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden py-0'
                  }`}>
                    <div className="flex items-start gap-2">
                      <Tag className="h-4 w-4 text-primary mt-1 shrink-0" />
                      <div>
                        <span className="font-semibold text-foreground block mb-1">推荐理由：</span>
                        <span className="text-muted-foreground">{video.reason}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 pb-6 flex flex-col gap-3 border-t border-border/30 bg-muted/10">
                  <div className="flex w-full gap-3">
                    <Button 
                      variant="ghost" 
                      className="flex-1 text-muted-foreground hover:text-primary hover:bg-primary/5"
                      onClick={() => setExpandedVideoId(expandedVideoId === video.id ? null : video.id)}
                    >
                      {expandedVideoId === video.id ? (
                        <>收起详情 <ChevronUp className="ml-2 h-4 w-4" /></>
                      ) : (
                        <>推荐理由 <ChevronDown className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                    <Button className="flex-1 shadow-sm" asChild>
                      <a href={video.link} target="_blank" rel="noopener noreferrer">
                        <Play className="mr-2 h-4 w-4 fill-current" /> 立即观看
                      </a>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border mt-auto py-12">
        <div className="container text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 周末放映室 | 为孩子甄选全球优质内容
          </p>
        </div>
      </footer>
    </div>
  );
}
