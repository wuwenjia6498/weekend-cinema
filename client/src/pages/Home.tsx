import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, PlayCircle, Search, Star, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface Video {
  id: number;
  title: string;
  link: string;
  duration: string;
  age: string;
  category: string;
  subcategory: string;
  description: string;
  recommendation: string;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetch("/videos.json")
      .then((res) => res.json())
      .then((data) => {
        setVideos(data);
        setFilteredVideos(data);
      })
      .catch((err) => console.error("Failed to load videos:", err));
  }, []);

  useEffect(() => {
    let result = videos;

    // Filter by tab (category)
    if (activeTab !== "all") {
      result = result.filter((v) => v.category === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      result = result.filter((v) =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredVideos(result);
  }, [searchTerm, activeTab, videos]);

  const categories = [
    { id: "all", label: "全部" },
    { id: "国内动画短片", label: "国内动画短片" },
    { id: "国外动画短片", label: "国外动画短片" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1E8] font-sans text-[#4A4A4A]">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-[#6B5B95] to-[#8E7CC3] text-white py-12 shadow-lg">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            周末放映室
          </h1>
          <p className="text-xl md:text-2xl opacity-90 font-light">
            精选优质儿童短视频
          </p>
          <div className="mt-8 max-w-2xl bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-semibold mb-2">发现精彩的学习世界</h2>
            <p className="text-lg opacity-90">
              为 3-12 岁儿童精心策划的高质量短视频
            </p>
          </div>
        </div>
      </header>

      {/* Search & Filter Section */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E0E0E0] shadow-sm py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="搜索视频..."
              className="pl-10 bg-[#F9F9F9] border-[#E0E0E0] focus:ring-[#6B5B95] focus:border-[#6B5B95] rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="bg-[#F0E6D2] p-1 rounded-full">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="rounded-full px-6 py-2 data-[state=active]:bg-[#6B5B95] data-[state=active]:text-white transition-all duration-300"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Video Grid */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 text-gray-500">
          找到 {filteredVideos.length} 个视频
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <Card 
              key={video.id} 
              className="group hover:shadow-xl transition-all duration-300 border-none bg-white overflow-hidden rounded-xl flex flex-col h-full"
            >
              <CardHeader className="pb-2 bg-[#FAFAFA]">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-xl font-bold text-[#2C3E50] group-hover:text-[#6B5B95] transition-colors line-clamp-1">
                    {video.title}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-[#FFB366] text-white hover:bg-[#FF9933] shrink-0">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    推荐
                  </Badge>
                </div>
                <div className="flex gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center bg-[#F0F0F0] px-2 py-1 rounded-md">
                    <Users className="w-3 h-3 mr-1" />
                    {video.age}
                  </span>
                  <span className="flex items-center bg-[#F0F0F0] px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3 mr-1" />
                    {video.duration}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 flex-grow space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-[#6B5B95] mb-1">核心内容</h4>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {video.description}
                  </p>
                </div>
                
                <div className="bg-[#FDF6E3] p-3 rounded-lg border border-[#F0E6D2]">
                  <h4 className="text-sm font-semibold text-[#8A6D3B] mb-1">家长推荐理由</h4>
                  <p className="text-sm text-[#8A6D3B] italic">
                    {video.recommendation}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className="text-[#6B5B95] border-[#6B5B95]/30 bg-[#6B5B95]/5">
                    {video.category}
                  </Badge>
                  <Badge variant="outline" className="text-[#555] border-[#555]/30 bg-[#555]/5">
                    {video.subcategory}
                  </Badge>
                </div>
              </CardContent>

              <CardFooter className="pt-2 pb-6">
                <Button 
                  className="w-full bg-[#6B5B95] hover:bg-[#5A4A82] text-white shadow-md hover:shadow-lg transition-all"
                  onClick={() => window.open(video.link, '_blank')}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  观看视频
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold text-gray-400">没有找到相关视频</h3>
            <p className="text-gray-400 mt-2">尝试更换搜索词或切换分类看看吧</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#2C3E50] text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="opacity-70">© 2024 周末放映室 - 用心为孩子挑选每一个故事</p>
        </div>
      </footer>
    </div>
  );
}
