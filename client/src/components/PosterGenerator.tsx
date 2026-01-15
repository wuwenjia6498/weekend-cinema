import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Share2, Loader2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

interface Video {
  id: number;
  title: string;
  category: string[];
  reason: string;
  summary: string;
  link: string;
}

interface PosterGeneratorProps {
  video: Video;
  trigger?: React.ReactNode;
}

// 随机分配封面图
const getCoverImage = (id: number) => {
  const covers = [
    "/images/cover-fantasy.jpg",
    "/images/cover-healing.jpg",
    "/images/cover-adventure.jpg",
  ];
  return covers[id % covers.length];
};

export function PosterGenerator({ video, trigger }: PosterGeneratorProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = async () => {
    if (!posterRef.current) return;

    try {
      setIsGenerating(true);
      
      // 等待图片加载完成
      const images = posterRef.current.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        scale: 2, // 提高清晰度
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `周末放映室-${video.title}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("生成海报失败:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const coverImage = getCoverImage(video.id);
  const shareUrl = video.link;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            生成海报
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-transparent border-none shadow-none">
        <VisuallyHidden>
          <DialogTitle>生成海报 - {video.title}</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col items-center gap-4">
          {/* 海报预览区域 */}
          <div 
            ref={posterRef}
            className="w-full bg-white rounded-xl overflow-hidden shadow-2xl"
            style={{ aspectRatio: "3/5" }}
          >
            {/* 封面图 - 增加高度占比至 55% */}
            <div className="relative h-[55%] w-full">
              <img 
                src={coverImage} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-6 right-6 text-white">
                <div className="flex gap-2 mb-3">
                  {video.category.slice(0, 2).map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 text-sm font-medium bg-white/20 backdrop-blur-md rounded-full border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-3xl font-bold tracking-tight leading-tight drop-shadow-sm">{video.title}</h2>
              </div>
            </div>

            {/* 内容区域 - 减少高度占比至 45% */}
            <div className="p-6 h-[45%] flex flex-col justify-between bg-gradient-to-b from-white to-slate-50">
              <div className="space-y-5 overflow-hidden">
                <div>
                  <h3 className="text-xs font-bold text-primary mb-1.5 uppercase tracking-wider opacity-80">视频介绍</h3>
                  <p className="text-slate-700 text-sm leading-relaxed line-clamp-3 font-medium">
                    {video.summary}
                  </p>
                </div>
                
                <div className="relative pl-4 border-l-[3px] border-primary/30">
                  <h3 className="text-xs font-bold text-primary mb-1.5 uppercase tracking-wider opacity-80">推荐理由</h3>
                  <p className="text-slate-800 text-base font-serif italic leading-relaxed line-clamp-3">
                    "{video.reason}"
                  </p>
                </div>
              </div>

              {/* 底部信息 */}
              <div className="flex items-end justify-between pt-5 border-t border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <img 
                      src="/images/logo.jpg" 
                      alt="Logo" 
                      className="w-9 h-9 rounded-full shadow-sm object-cover"
                    />
                    <span className="font-bold text-slate-900 text-lg tracking-tight">周末放映室</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">精选优质儿童动画短片</p>
                </div>
                <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                  <QRCodeSVG 
                    value={shareUrl}
                    size={72}
                    level="M"
                    fgColor="#1e293b"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <Button 
            onClick={handleDownload} 
            disabled={isGenerating}
            className="w-full max-w-xs shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                正在生成...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                保存海报
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
