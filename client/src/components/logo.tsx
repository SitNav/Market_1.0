import { cn } from "@/lib/utils";
import logoImage from "@assets/1751735451054_1752558528370.jpg";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <img 
        src={logoImage} 
        alt="TerraNav Services" 
        className={cn("object-contain", sizeClasses[size])}
      />
      <span className="font-bold text-xl text-primary">TerraNav</span>
    </div>
  );
}
