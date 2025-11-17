import { DEFAULT_PERKS } from "@/constants/prizes";
import { cn } from "@/lib/utils";

type AvatarDisplayProps = {
  src?: string;
  frameStyle?: React.CSSProperties;
  bgColor?: string;
  size?: number;
  className?: string;
};

export function AvatarDisplay({
  src = DEFAULT_PERKS.avatar.src,
  frameStyle = DEFAULT_PERKS.frame.style,
  bgColor,
  size = 80,
  className,
}: AvatarDisplayProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 relative overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5",
        className
      )}
      style={{
        width: size,
        height: size,
        ...frameStyle,
        backgroundColor: bgColor,
      }}
    >
      {src && (
        <img src={src} className="w-full h-full object-cover" alt="Avatar" />
      )}
    </div>
  );
}
