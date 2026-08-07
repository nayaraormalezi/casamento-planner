import { Upload } from "lucide-react";
import { cn } from "@/utils/cn";

type UploadDropzoneProps = {
  className?: string;
  label?: string;
  hint?: string;
  onClick?: () => void;
};

export function UploadDropzone({
  className,
  label = "Enviar arquivo",
  hint = "PDF, JPG ou PNG · até 10 MB",
  onClick,
}: UploadDropzoneProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-canvas-elevated px-6 py-10 text-center transition-colors hover:border-accent hover:bg-accent-subtle/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Upload className="h-5 w-5 text-ink-tertiary" strokeWidth={1.5} />
      <span className="text-sm font-medium text-ink">{label}</span>
      <span className="text-xs text-ink-tertiary">{hint}</span>
    </button>
  );
}
