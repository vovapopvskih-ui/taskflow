import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-muted-foreground/30">404</p>
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        Страница не найдена
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Возможно, страница была перемещена или удалена. Вернитесь на главную.
      </p>
      <div className="mt-6">
        <Link href="/">
          <Button>На главную</Button>
        </Link>
      </div>
    </div>
  );
}
