import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { type Task } from "@/lib/validations/task";

export const metadata: Metadata = {
  title: "Канбан — TaskFlow",
  description: "Доска задач с перетаскиванием карточек.",
};

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-xl font-semibold text-foreground">Канбан-доска</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Перетаскивайте карточки между колонками, чтобы менять статус
      </p>

      <div className="mt-6">
        <KanbanBoard tasks={(tasks ?? []) as Task[]} />
      </div>
    </div>
  );
}
