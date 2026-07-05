import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Управляйте задачами{" "}
          <span className="text-primary">просто и эффективно</span>
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
          TaskFlow — персональный менеджер задач с регистрацией, уведомлениями,
          Kanban-досками и экспортом. Всё, что нужно для продуктивности.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link href="/register">
            <Button size="lg">Начать бесплатно</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Войти
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass rounded-2xl p-5 transition-transform hover:scale-[1.03]"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-card-foreground">
                {f.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    title: "Задачи",
    desc: "CRUD, поиск, фильтры, сортировка, пагинация.",
    icon: CheckSquareIcon,
  },
  {
    title: "Kanban-доска",
    desc: "Три колонки с перетаскиванием карточек.",
    icon: ColumnsIcon,
  },
  {
    title: "Комментарии",
    desc: "Обсуждения и прикрепление файлов к задачам.",
    icon: MessageIcon,
  },
  {
    title: "Экспорт / Импорт",
    desc: "PDF, CSV — выгрузка и массовая загрузка задач.",
    icon: DownloadIcon,
  },
  {
    title: "Уведомления",
    desc: "Toast-сообщения и email о приближении дедлайна.",
    icon: BellIcon,
  },
  {
    title: "Тёмная тема",
    desc: "Переключатель дня и ночи с сохранением выбора.",
    icon: MoonIcon,
  },
];

/* Icons — простые SVG inline */
function CheckSquareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  );
}

function ColumnsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
