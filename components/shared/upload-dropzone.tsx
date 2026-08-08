import { useRef } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/utils/cn";

type UploadDropzoneProps = {
  className?: string;
  label?: string;
  hint?: string;
  accept?: string;
  disabled?: boolean;
  onFile?: (file: File) => void | Promise<void>;
};

export function UploadDropzone({
  className,
  label = "Enviar arquivo",
  hint = "PDF, JPG, PNG ou WEBP · até 10 MB",
  accept = "application/pdf,image/jpeg,image/png,image/webp",
  disabled,
  onFile,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-canvas-elevated px-6 py-10 text-center transition-colors hover:border-accent hover:bg-accent-subtle/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60",
        )}
      >
        <Upload className="h-5 w-5 text-ink-tertiary" strokeWidth={1.5} />
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="text-xs text-ink-tertiary">{hint}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file && onFile) void onFile(file);
        }}
      />
    </div>
  );
}
