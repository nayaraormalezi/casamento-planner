"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { UploadDropzone } from "@/components/shared/upload-dropzone";
import { Badge } from "@/components/ui/badge";
import { useWeddingStore } from "@/lib/demo/store";

export default function DocumentsPage() {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const used = workspace.documents.reduce((a, d) => a + d.sizeBytes, 0);
  const quota = 1024 * 1024 * 1024;

  return (
    <div>
      <PageHeader
        title="Documentos"
        description={`${(used / (1024 * 1024)).toFixed(1)} MB de ${(quota / (1024 * 1024 * 1024)).toFixed(0)} GB`}
      />

      <UploadDropzone
        className="mb-8"
        onClick={() =>
          toast.message(
            "Upload real via Supabase Storage na conexão de infraestrutura.",
          )
        }
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
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{d.name}</p>
                <p className="text-xs text-ink-tertiary">
                  {d.linkedLabel} · {d.createdAt}
                </p>
              </div>
              <Badge variant="outline">{d.type}</Badge>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
