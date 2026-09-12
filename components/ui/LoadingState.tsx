import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Cargando...", className }: LoadingStateProps) {
  return (
    <div
      role="status"
      className={cn("flex flex-col items-center justify-center gap-3 p-8", className)}
    >
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"
        aria-hidden="true"
      />
      <p className="text-sm text-neutral-500">{message}</p>
    </div>
  );
}
