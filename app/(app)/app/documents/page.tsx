"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { UploadDropzone } from "@/components/shared/upload-dropzone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getDocumentUrlAction,
  removeDocumentAction,
  uploadDocumentAction,
} from "@/app/actions/documents";
import { useWeddingStore } from "@/lib/demo/store";

const TYPE_LABEL: Record<string, string> = {
  contract: "Contrato",
  receipt: "Recibo",
  invoice: "Nota",
  photo: "Foto",
  pdf: "PDF",
  other: "Outro",
};

export default function DocumentsPage() {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const refresh = useWeddingStore((s) => s.refresh);
  const [uploading, setUploading] = useState(false);
  const used = workspace.documents.reduce((a, d) => a + d.sizeBytes, 0);
  const quota = 1024 * 1024 * 1024;

  async function onFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadDocumentAction(formData);
      if (!res.ok) {
        const messages: Record<string, string> = {
          INVALID_SIZE: "Arquivo deve ter até 10 MB.",
          INVALID_TYPE: "Use PDF, JPG, PNG ou WEBP.",
          UPLOAD_FAILED: "Falha no upload. Confira o bucket no Supabase.",
          DB_FAILED: "Arquivo enviado, mas não gravou no banco.",
        };
        toast.error(messages[res.error] ?? "Não foi possível enviar");
        return;
      }
      await refresh();
      toast.success("Documento enviado");
    } catch {
      toast.error("Não foi possível enviar");
    } finally {
      setUploading(false);
    }
  }

  async function openDoc(id: string) {
    const res = await getDocumentUrlAction(id);
    if (!res.ok) {
      toast.error("Não foi possível abrir o arquivo");
      return;
    }
    window.open(res.url, "_blank", "noopener,noreferrer");
  }

  async function removeDoc(id: string) {
    const res = await removeDocumentAction(id);
    if (!res.ok) {
      toast.error("Não foi possível remover");
      return;
    }
    await refresh();
    toast.success("Documento removido");
  }

  return (
    <div>
      <PageHeader
        title="Documentos"
        description={`${(used / (1024 * 1024)).toFixed(1)} MB de ${(quota / (1024 * 1024 * 1024)).toFixed(0)} GB`}
      />

      <UploadDropzone
        className="mb-8"
        disabled={uploading}
        label={uploading ? "Enviando…" : "Enviar arquivo"}
        onFile={onFile}
      />

      <ul className="divide-y divide-border rounded-lg border border-border bg-canvas-elevated">
        {workspace.documents.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-ink-tertiary">
            Nenhum documento ainda.
          </li>
        ) : (
          workspace.documents.map((d) => (
            <li
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{d.name}</p>
                <p className="text-xs text-ink-tertiary">
                  {(d.sizeBytes / 1024).toFixed(0)} KB · {d.createdAt}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{TYPE_LABEL[d.type] ?? d.type}</Badge>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void openDoc(d.id)}
                >
                  Abrir
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void removeDoc(d.id)}
                >
                  Remover
                </Button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
