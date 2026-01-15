import { useRef, useState, useEffect } from "react";
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
import { Download, Share2, Loader2, Check } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "sonner";
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

// 获取封面图：优先使用专属封面，否则使用默认封面
const getCoverImage = (id: number) => {
  // 预定义的专属封面列表（仅作演示，实际项目中应由后端返回或检查文件是否存在）
  const customCovers: Record<number, string> = {
    1: "/images/covers/1.png", // 中国奇谭
    2: "/images/covers/2.png", // 小蝌蚪找妈妈
    3: "/images/covers/3.jpg", // 大闹天宫
    31: "/images/covers/31.png", // Piper
    32: "/images/covers/32.jpg", // La Luna
    33: "/images/covers/33.jpg", // Partly Cloudy
    37: "/images/covers/37.png", // For the Birds
    4: "/images/covers/4.jpg",   // 哪吒闹海
    5: "/images/covers/5.jpg",   // 三个和尚
  };

  if (customCovers[id]) {
    return customCovers[id];
  }

  // 默认封面兜底
  const defaultCovers = [
    "/images/cover-fantasy.jpg",
    "/images/cover-healing.jpg",
    "/images/cover-adventure.jpg",
  ];
  return defaultCovers[id % defaultCovers.length];
};

export function PosterGenerator({ video, trigger }: PosterGeneratorProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // 弹窗打开时自动生成海报
  useEffect(() => {
    if (isOpen && !generatedImage) {
      // 延迟一点时间确保 DOM 渲染完成
      const timer = setTimeout(() => {
        generateImage();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const generateImage = async () => {
    if (!posterRef.current) return null;

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

      const dataUrl = canvas.toDataURL("image/png");
      setGeneratedImage(dataUrl);
      return dataUrl;
    } catch (error) {
      console.error("生成海报失败:", error);
      toast.error("生成海报失败，请重试");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = generatedImage || await generateImage();
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download = `周末放映室-${video.title}.png`;
    link.href = dataUrl;
    link.click();
    toast.success("海报已保存", {
      description: "如果未自动下载，请长按图片保存",
    });
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
      <DialogContent className="max-w-md w-[90vw] p-0 overflow-hidden bg-transparent border-none shadow-none">
        <VisuallyHidden>
          <DialogTitle>生成海报 - {video.title}</DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col items-center gap-4">
          {/* 海报预览区域 */}
          <div className="relative w-full rounded-xl overflow-hidden shadow-2xl">
            {/* 实际渲染的 DOM，生成图片后隐藏 */}
            <div 
              ref={posterRef}
              className={cn("w-full bg-white", generatedImage ? "absolute top-0 left-0 -z-10 opacity-0" : "")}
              style={{ aspectRatio: "3/5" }}
            >
              {/* 封面图 - 增加高度占比至 55% */}
              <div className="relative h-[55%] w-full">
                {/* 使用 background-image 替代 img 标签，解决 html2canvas 中 object-fit: cover 失效导致的变形问题 */}
                <div 
                  className="w-full h-full"
                  style={{ 
                    backgroundImage: `url(${coverImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                  }}
                />
                {/* 使用 style 强制指定 RGB 颜色，避免 Tailwind 4 的 oklab 格式 */}
                <div 
                  className="absolute inset-0" 
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.2), transparent)" }}
                />
                <div className="absolute bottom-5 left-6 right-6 text-white">
                  <div className="flex gap-2 mb-3">
                    {video.category.slice(0, 2).map((tag) => (
                      <span 
                        key={tag} 
                        className="px-3 h-7 text-sm font-medium rounded-full backdrop-blur-md inline-block text-center"
                        style={{ 
                          backgroundColor: "rgba(255,255,255,0.2)", 
                          borderColor: "rgba(255,255,255,0.1)",
                          borderWidth: "1px",
                          borderStyle: "solid",
                          lineHeight: "26px", // 明确设置行高 = 高度 - 边框 (28px - 2px)
                          verticalAlign: "middle"
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight leading-tight drop-shadow-sm">{video.title}</h2>
                </div>
              </div>

              {/* 内容区域 - 减少高度占比至 45% */}
              <div 
                className="p-6 h-[45%] flex flex-col justify-between"
                style={{ background: "linear-gradient(to bottom, #ffffff, #f8fafc)" }}
              >
                <div className="space-y-5 overflow-hidden">
                  <div>
                    <h3 
                      className="text-xs font-bold mb-2 uppercase tracking-wider opacity-60"
                      style={{ color: "#57534e" }} // Stone-600，更雅致的深灰色
                    >
                      视频介绍
                    </h3>
                    <p 
                      className="text-sm leading-relaxed line-clamp-3 font-medium pb-1"
                      style={{ color: "#44403c", lineHeight: "1.6" }} // Stone-700，增加行高防止截断
                    >
                      {video.summary}
                    </p>
                  </div>
                  
                  <div 
                    className="relative pl-4"
                    style={{ borderLeft: "3px solid #d6d3d1" }} // Stone-300，雅致的浅灰色竖线
                  >
                    <h3 
                      className="text-xs font-bold mb-2 uppercase tracking-wider opacity-60"
                      style={{ color: "#57534e" }}
                    >
                      推荐理由
                    </h3>
                    <p 
                      className="text-base font-serif italic leading-relaxed line-clamp-3 pb-1"
                      style={{ color: "#292524", lineHeight: "1.6" }} // Stone-800，深色强调
                    >
                      "{video.reason}"
                    </p>
                  </div>
                </div>

                {/* 底部信息 */}
                <div 
                  className="flex items-end justify-between pt-5"
                  style={{ borderTop: "1px solid #f1f5f9" }}
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <img 
                        src="/images/logo.jpg" 
                        alt="Logo" 
                        className="w-9 h-9 rounded-full shadow-sm object-cover"
                      />
                      <span 
                        className="font-bold text-lg tracking-tight"
                        style={{ color: "#0f172a" }}
                      >
                        周末放映室
                      </span>
                    </div>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: "#64748b" }}
                    >
                      精选优质儿童动画短片
                    </p>
                  </div>
                  <div 
                    className="bg-white p-2 rounded-xl shadow-sm"
                    style={{ border: "1px solid #f1f5f9" }}
                  >
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

            {/* 生成后的图片展示，支持长按保存 */}
            {generatedImage && (
              <img 
                src={generatedImage} 
                alt="生成的海报" 
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col items-center gap-2 w-full">
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
                  {generatedImage ? "保存图片" : "生成海报"}
                </>
              )}
            </Button>
            {generatedImage && (
              <p className="text-white/80 text-xs text-center">
                如果无法下载，请长按或右键点击图片保存
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
