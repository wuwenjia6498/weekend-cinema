import { useState, useEffect } from "react";
import { Search, Play, Clock, Users, Star, Globe, MapPin, Film, Award, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("all");
  const [subTab, setSubTab] = useState("all");

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
        "domestic": "国内动画",
        "foreign": "国外动画"
      };
      const targetCategory = categoryMap[activeTab];
      if (targetCategory) {
        result = result.filter(v => v.category.includes(targetCategory));
      }

      // Filter by sub-category
      if (subTab !== "all") {
        const subCategoryMap: Record<string, string> = {
          // Domestic sub-categories
          "classic": "经典中国学派",
          "modern": "现代创新系列",
          "indie": "独立艺术短片",
          // Foreign sub-categories
          "studio": "商业工作室经典",
          "oscar": "奥斯卡/国际获奖",
          "master": "大师艺术短片"
        };
        const targetSubCategory = subCategoryMap[subTab];
        if (targetSubCategory) {
          result = result.filter(v => v.category.includes(targetSubCategory));
        }
      }
    }
    
    setFilteredVideos(result);
  }, [searchTerm, activeTab, subTab, videos]);

  // Reset subTab when activeTab changes
  useEffect(() => {
    setSubTab("all");
  }, [activeTab]);

  const VideoGrid = ({ items }: { items: Video[] }) => {
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const handleCopy = (video: Video) => {
      const text = `🎬 推荐观看：《${video.title}》\n\n📝 内容介绍：\n${video.summary}\n\n🌟 推荐理由：\n${video.reason}\n\n📺 观看链接：${video.link}\n\n👉 来自「周末放映室」的精选推荐`;
      
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(video.id);
        toast.success("推荐语已复制到剪贴板");
        setTimeout(() => setCopiedId(null), 2000);
      }).catch(() => {
        toast.error("复制失败，请重试");
      });
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((video) => (
          <Card key={video.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col h-full">
            <CardHeader className="pb-3 relative bg-gradient-to-b from-primary/5 to-transparent">
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-xl font-bold text-primary group-hover:text-primary/80 transition-colors line-clamp-1" title={video.title}>
                  {video.title}
                </CardTitle>
                <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-700 hover:bg-orange-200 shrink-0">
                  <Star className="w-3 h-3 fill-current" />
                  {video.rating}
                </Badge>
              </div>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="bg-white/50 text-primary border-primary/20">
                  {video.ageGroup}
                </Badge>
                <Badge variant="outline" className="bg-white/50 text-secondary-foreground border-secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  {video.duration}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 pt-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-1">内容介绍</h4>
                <p className="text-foreground/90 text-sm leading-relaxed line-clamp-2" title={video.summary}>
                  {video.summary}
                </p>
              </div>
              
              <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100/50">
                <h4 className="text-sm font-semibold text-orange-700 mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  推荐理由
                </h4>
                <p className="text-sm text-foreground/80 whitespace-pre-line leading-relaxed">
                  {video.reason}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {video.category.map((cat, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 rounded-full bg-muted/80 text-muted-foreground border border-border/50">
                    {cat}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/50 bg-muted/30 grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full gap-2 bg-white hover:bg-gray-50"
                onClick={() => handleCopy(video)}
              >
                {copiedId === video.id ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制推荐
                  </>
                )}
              </Button>
              <Button className="w-full gap-2 shadow-sm hover:shadow-md transition-all" asChild>
                <a href={video.link} target="_blank" rel="noopener noreferrer">
                  <Play className="w-4 h-4 fill-current" />
                  立即观看
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-border/50">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
              W
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-primary tracking-tight">周末放映室</h1>
              <p className="text-xs text-muted-foreground font-medium">精选优质儿童动画短片</p>
            </div>
          </div>
        </div>
      </header>

      <section className="py-12 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-display font-bold text-primary mb-4 tracking-tight">
              发现精彩的动画世界
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              为 3-12 岁儿童精心挑选的 60 部优质动画短片，
              <br className="hidden sm:block" />
              涵盖中国经典与世界名作，让孩子在快乐中收获成长。
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-[73px] z-40 bg-[#FDFBF7]/95 backdrop-blur-sm border-b border-border/50 py-4 shadow-sm">
        <div className="container space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="搜索视频..."
                className="pl-9 h-10 bg-white border-muted-foreground/20 focus:border-primary/50 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-muted/50 rounded-lg">
                <TabsTrigger value="all" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm">全部</TabsTrigger>
                <TabsTrigger value="foreign" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1.5 text-sm">
                  <Globe className="w-3.5 h-3.5" /> 国外动画
                </TabsTrigger>
                <TabsTrigger value="domestic" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1.5 text-sm">
                  <MapPin className="w-3.5 h-3.5" /> 国内动画
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Sub-tabs for Domestic category */}
          {activeTab === "domestic" && (
            <div className="flex justify-center md:justify-end animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="inline-flex bg-white p-1 rounded-lg border border-border/50 shadow-sm">
                <Button
                  variant={subTab === "all" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSubTab("all")}
                  className="h-8 text-xs px-3"
                >
                  全部
                </Button>
                <Button
                  variant={subTab === "classic" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSubTab("classic")}
                  className="h-8 text-xs px-3 gap-1.5"
                >
                  <Film className="w-3 h-3" /> 经典中国学派
                </Button>
                <Button
                  variant={subTab === "modern" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSubTab("modern")}
                  className="h-8 text-xs px-3 gap-1.5"
                >
                  <Sparkles className="w-3 h-3" /> 现代创新系列
                </Button>
                <Button
                  variant={subTab === "indie" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSubTab("indie")}
                  className="h-8 text-xs px-3 gap-1.5"
                >
                  <Award className="w-3 h-3" /> 独立艺术短片
                </Button>
              </div>
            </div>
          )}

          {/* Sub-tabs for Foreign category */}
          {activeTab === "foreign" && (
            <div className="flex justify-center md:justify-end animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="inline-flex bg-white p-1 rounded-lg border border-border/50 shadow-sm">
                <Button
                  variant={subTab === "all" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSubTab("all")}
                  className="h-8 text-xs px-3"
                >
                  全部
                </Button>
                <Button
                  variant={subTab === "oscar" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSubTab("oscar")}
                  className="h-8 text-xs px-3 gap-1.5"
                >
                  <Award className="w-3 h-3" /> 奥斯卡/国际获奖
                </Button>
                <Button
                  variant={subTab === "studio" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSubTab("studio")}
                  className="h-8 text-xs px-3 gap-1.5"
                >
                  <Film className="w-3 h-3" /> 商业工作室经典
                </Button>
                <Button
                  variant={subTab === "master" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSubTab("master")}
                  className="h-8 text-xs px-3 gap-1.5"
                >
                  <Sparkles className="w-3 h-3" /> 大师艺术短片
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <main className="container py-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{filteredVideos.length}</span>
          <span>个精选视频</span>
        </div>

        <VideoGrid items={filteredVideos} />

        {filteredVideos.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-lg text-muted-foreground font-medium">没有找到相关视频</p>
            <Button variant="link" onClick={() => {setSearchTerm(''); setActiveTab('all');}} className="mt-2 text-primary">
              清除筛选条件
            </Button>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-border mt-12 py-12">
        <div className="container text-center">
          <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-bold text-xl mx-auto mb-4">
            W
          </div>
          <p className="text-muted-foreground text-sm">
            © 2024 周末放映室
            <span className="mx-2">·</span>
            为孩子们精心挑选的优质内容
          </p>
        </div>
      </footer>
    </div>
  );
}
