import { useState, useEffect } from "react";
import { Search, Play, Clock, Users, Star, ExternalLink, ChevronDown, ChevronUp, BookOpen, Leaf, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState("all");

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
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by tab category
    if (activeTab !== "all") {
      const categoryMap: Record<string, string> = {
        "story": "暖心故事",
        "nature": "科普自然",
        "culture": "传统文化"
      };
      const targetCategory = categoryMap[activeTab];
      if (targetCategory) {
        result = result.filter(v => v.category.includes(targetCategory));
      }
    }
    
    setFilteredVideos(result);
  }, [searchTerm, activeTab, videos]);

  const VideoGrid = ({ items }: { items: Video[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((video) => (
        <Card key={video.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col">
          <CardHeader className="pb-2 relative">
            <div className="flex justify-between items-start mb-2">
              <CardTitle className="text-xl font-bold text-primary group-hover:text-primary/80 transition-colors">
                {video.title}
              </CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-700 hover:bg-orange-200">
                <Star className="w-3 h-3 fill-current" />
                {video.rating}
              </Badge>
            </div>
            <div className="flex gap-2 text-sm text-muted-foreground mb-2">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {video.ageGroup}
              </Badge>
              <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground border-secondary">
                <Clock className="w-3 h-3 mr-1" />
                {video.duration}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-foreground/80 leading-relaxed mb-4 line-clamp-3">
              {video.summary}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {video.category.map((cat, idx) => (
                <span key={idx} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                  {cat}
                </span>
              ))}
            </div>

            {expandedVideoId === video.id && (
              <div className="mt-4 p-4 bg-primary/5 rounded-lg animate-in fade-in slide-in-from-top-2">
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  家长推荐理由
                </h4>
                <p className="text-sm text-foreground/80 italic">
                  "{video.reason}"
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 border-t border-border/50 flex justify-between items-center bg-muted/30">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setExpandedVideoId(expandedVideoId === video.id ? null : video.id)}
              className="text-muted-foreground hover:text-primary"
            >
              {expandedVideoId === video.id ? (
                <>收起详情 <ChevronUp className="ml-1 w-4 h-4" /></>
              ) : (
                <>推荐理由 <ChevronDown className="ml-1 w-4 h-4" /></>
              )}
            </Button>
            <Button size="sm" className="gap-2 shadow-sm" asChild>
              <a href={video.link} target="_blank" rel="noopener noreferrer">
                <Play className="w-4 h-4 fill-current" />
                观看视频
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-border">
        <div className="container py-4">
          <h1 className="text-3xl font-display font-bold text-primary">周末放映室</h1>
          <p className="text-sm text-muted-foreground mt-1">精选优质儿童短视频</p>
        </div>
      </header>

      <section className="py-12 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container">
          <h2 className="text-4xl font-display font-bold text-primary mb-4">发现精彩的学习世界</h2>
          <p className="text-lg text-foreground/80">为 3-12 岁儿童精心策划的高质量短视频</p>
        </div>
      </section>

      <section className="bg-white border-b border-border py-6 sticky top-16 z-40">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="搜索视频..."
                className="pl-10 h-12 text-lg rounded-full border-2 border-primary/20 focus:border-primary transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 h-12 p-1 bg-muted/50 rounded-full">
                <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">全部</TabsTrigger>
                <TabsTrigger value="story" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                  <BookOpen className="w-4 h-4" /> 暖心故事
                </TabsTrigger>
                <TabsTrigger value="nature" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                  <Leaf className="w-4 h-4" /> 科普自然
                </TabsTrigger>
                <TabsTrigger value="culture" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                  <Palette className="w-4 h-4" /> 传统文化
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </section>

      <main className="container py-8">
        <div className="mb-6 text-muted-foreground flex justify-between items-center">
          <span>找到 {filteredVideos.length} 个视频</span>
          {activeTab !== "all" && (
            <Badge variant="outline" className="bg-primary/5">
              {activeTab === "story" && "暖心故事"}
              {activeTab === "nature" && "科普自然"}
              {activeTab === "culture" && "传统文化"}
            </Badge>
          )}
        </div>

        <VideoGrid items={filteredVideos} />

        {filteredVideos.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">没有找到相关视频</p>
            <Button variant="link" onClick={() => {setSearchTerm(''); setActiveTab('all');}} className="mt-2">
              清除筛选
            </Button>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-border mt-12 py-8">
        <div className="container text-center text-muted-foreground">
          <p>© 2024 周末放映室. 为孩子们精心挑选的优质内容。</p>
        </div>
      </footer>
    </div>
  );
}
