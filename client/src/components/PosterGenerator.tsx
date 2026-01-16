import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Share2, Loader2, X } from "lucide-react";
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
  // 已存在的封面文件白名单（根据实际文件列表生成）
  // 只有在白名单中的 ID 才会尝试加载专属封面，否则直接使用默认插画
  const existingCovers: Record<number, string> = {
    1: "/images/covers/1.png",
    2: "/images/covers/2.jpg", // 优先使用 jpg
    3: "/images/covers/3.jpg",
    4: "/images/covers/4.jpg",
    5: "/images/covers/5.jpg",
    7: "/images/covers/7.jpg",
    9: "/images/covers/9.jpg",
    11: "/images/covers/11.jpg",
    12: "/images/covers/12.jpg",
    14: "/images/covers/14.jpg",
    17: "/images/covers/17.jpg",
    18: "/images/covers/18.jpg",
    19: "/images/covers/19.jpg",
    28: "/images/covers/28.jpg",
    29: "/images/covers/29.jpg",
    30: "/images/covers/30.jpg",
    31: "/images/covers/31.png",
    32: "/images/covers/32.jpg",
    33: "/images/covers/33.jpg",
    34: "/images/covers/34.jpg",
    35: "/images/covers/35.jpg",
    36: "/images/covers/36.jpg",
    37: "/images/covers/37.jpg", // 优先使用 jpg
    38: "/images/covers/38.jpg",
    39: "/images/covers/39.jpg",
    40: "/images/covers/40.jpg",
    41: "/images/covers/41.jpg",
    42: "/images/covers/42.jpg",
    43: "/images/covers/43.jpg",
    44: "/images/covers/44.jpg",
    46: "/images/covers/46.jpg",
    48: "/images/covers/48.jpg",
    50: "/images/covers/50.jpg",
    51: "/images/covers/51.jpg",
    52: "/images/covers/52.jpg",
    54: "/images/covers/54.jpg",
    56: "/images/covers/56.jpg",
  };

  if (existingCovers[id]) {
    return existingCovers[id];
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

      <DialogContent
        className="p-0 border-none bg-transparent shadow-none overflow-auto flex items-start justify-center"
        style={{
          maxWidth: "95vw",
          maxHeight: "100vh",
          width: "auto",
          height: "auto"
        }}
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>生成海报 - {video.title}</DialogTitle>
        </VisuallyHidden>

        {/* 主容器 - 使用 flex 布局垂直排列 */}
        <div className="flex flex-col items-center gap-4 py-6 px-4 w-full">
          {/* 关闭按钮 */}
          <DialogClose className="self-end p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
            <X className="w-5 h-5" />
            <span className="sr-only">关闭</span>
          </DialogClose>

          {/* 海报容器 - 进一步加高比例 */}
          <div
            className="flex-shrink-0 rounded-xl overflow-hidden shadow-2xl bg-white"
            style={{
              maxHeight: "calc(100vh - 200px)",
              height: "auto",
              aspectRatio: "3 / 6",
              width: "auto",
              maxWidth: "90vw"
            }}
          >
            {/* 实际渲染的 DOM，生成图片后隐藏 */}
            <div
              ref={posterRef}
              className={cn("w-full h-full bg-white", generatedImage && "hidden")}
            >
              {/* 封面图 - 52% 高度 */}
              <div className="relative h-[52%] w-full">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${coverImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                  }}
                />
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
                          lineHeight: "26px",
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

              {/* 内容区域 - 48% 高度，大幅增加空白 */}
              <div
                className="p-6 h-[48%] flex flex-col justify-between"
                style={{ background: "linear-gradient(to bottom, #ffffff, #f8fafc)" }}
              >
                 <div className="space-y-20 overflow-hidden flex-1">
                   <div>
                     <h3
                       className="text-xs font-bold mb-2 uppercase tracking-wider opacity-60"
                       style={{ color: "#57534e" }}
                     >
                       视频介绍
                     </h3>
                     <p
                       className="text-[11px] leading-relaxed line-clamp-3 font-medium"
                       style={{ color: "#44403c", lineHeight: "1.7", paddingBottom: "4px" }}
                     >
                       {video.summary}
                     </p>
                   </div>

                  <div className="relative pl-4">
                    {/* 竖线 - 与推荐理由文字对齐 */}
                    <div
                      className="absolute left-0 w-[3px]"
                      style={{
                        top: "28px",
                        bottom: "4px",
                        backgroundColor: "#d6d3d1"
                      }}
                    ></div>
                    <h3
                      className="text-xs font-bold mb-2 uppercase tracking-wider opacity-60"
                      style={{ color: "#57534e" }}
                    >
                      推荐理由
                    </h3>
                    <p
                      className="text-[13px] font-serif italic leading-relaxed line-clamp-3"
                      style={{ color: "#292524", lineHeight: "1.7", paddingBottom: "4px" }}
                    >
                      "{video.reason}"
                    </p>
                  </div>
                </div>

                 {/* 底部信息 - 整体缩小 */}
                 <div
                   className="flex items-end justify-between pt-8"
                   style={{ borderTop: "1px solid #f1f5f9" }}
                 >
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <img
                         src="/images/logo.jpg"
                         alt="Logo"
                         className="w-7 h-7 rounded-full shadow-sm object-cover flex-shrink-0"
                       />
                       <div className="flex flex-col justify-center">
                         <span
                           className="font-bold text-base tracking-tight leading-none"
                           style={{ color: "#0f172a" }}
                         >
                           周末放映室
                         </span>
                       </div>
                     </div>
                     <p
                       className="text-xs font-medium ml-9"
                       style={{ color: "#64748b" }}
                     >
                       精选优质儿童动画短片
                     </p>
                   </div>
                  <div
                    className="bg-white p-1.5 rounded-xl shadow-sm"
                    style={{ border: "1px solid #f1f5f9" }}
                  >
                    <QRCodeSVG
                      value={shareUrl}
                      size={60}
                      level="M"
                      fgColor="#1e293b"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 生成后的图片展示 */}
            {generatedImage && (
              <img
                src={generatedImage}
                alt="生成的海报"
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              className="shadow-lg hover:shadow-xl transition-all px-8"
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
