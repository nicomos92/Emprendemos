import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-50 p-6 text-center">
      <h1 className="text-2xl font-semibold text-neutral-700">
        No encontramos esta página.
      </h1>
      <p className="max-w-sm text-sm text-neutral-500">
        Puede que el enlace esté roto o que la página se haya movido.
      </p>
      <Link href="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
