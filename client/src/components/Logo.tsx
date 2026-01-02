import { PawPrint } from "lucide-react";
import { Link } from "wouter";

interface LogoProps {
  showTagline?: boolean;
  size?: "sm" | "md";
}

export function Logo({ showTagline = true, size = "md" }: LogoProps) {
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const iconPadding = size === "sm" ? "p-1.5" : "p-2";
  const textSize = size === "sm" ? "text-lg" : "text-xl";
  
  return (
    <Link href="/">
      <div className="flex items-center gap-2 cursor-pointer">
        <div className={`bg-primary text-white ${iconPadding} rounded-lg`}>
          <PawPrint className={iconSize} />
        </div>
        <div className="flex flex-col">
          {showTagline && (
            <span className="text-[10px] text-gray-500 font-medium leading-tight -mb-0.5">
              Little Pup Goodies presents...
            </span>
          )}
          <span className={`font-heading font-bold ${textSize} text-gray-900 tracking-tight leading-tight`}>
            Max's<span className="text-primary">Picks</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
