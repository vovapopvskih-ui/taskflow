"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  exportTasksCsvAction,
  importTasksCsvAction,
  type ExportState,
} from "@/app/(protected)/tasks/export-actions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Download, Upload, FileSpreadsheet } from "lucide-react";

export function TaskExportImport() {
  const [importState, importAction, importPending] = useActionState<
    ExportState,
    FormData
  >(importTasksCsvAction, {});
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обработка результата импорта
  useEffect(() => {
    if (importState?.success) {
      toast.success(importState.success);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Перезагружаем страницу чтобы обновить список
      window.location.reload();
    }
    if (importState?.error) {
      toast.error(importState.error);
    }
  }, [importState]);

  // Экспорт CSV — скачивание файла на клиенте
  async function handleExportCsv() {
    setExporting(true);
    try {
      const result = await exportTasksCsvAction();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.csv) {
        // Создаём файл и скачиваем
        const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `taskflow-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("CSV-файл скачан");
      }
    } catch {
      toast.error("Ошибка экспорта");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Экспорт CSV */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCsv}
        disabled={exporting}
      >
        {exporting ? (
          <Spinner size="sm" className="mr-2 text-current" />
        ) : (
          <FileSpreadsheet className="mr-2 h-4 w-4" />
        )}
        Экспорт CSV
      </Button>

      {/* Импорт CSV */}
      <form action={importAction}>
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            // Авто-сабмит при выборе файла
            if (e.target.files?.[0]) {
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={importPending}
        >
          {importPending ? (
            <Spinner size="sm" className="mr-2 text-current" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Импорт CSV
        </Button>
      </form>
    </div>
  );
}
