import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-100 bg-white p-4 shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
