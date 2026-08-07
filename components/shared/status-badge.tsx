import { Badge } from "@/components/ui/badge";

const statusMap = {
  todo: { label: "A fazer", variant: "neutral" as const },
  doing: { label: "Em andamento", variant: "accent" as const },
  blocked: { label: "Bloqueada", variant: "warning" as const },
  done: { label: "Concluída", variant: "success" as const },
  cancelled: { label: "Cancelada", variant: "outline" as const },
  planned: { label: "Planejado", variant: "neutral" as const },
  quoted: { label: "Cotado", variant: "outline" as const },
  contracted: { label: "Contratado", variant: "accent" as const },
  partially_paid: { label: "Parcial", variant: "warning" as const },
  paid: { label: "Pago", variant: "success" as const },
  pending: { label: "Pendente", variant: "warning" as const },
  decided: { label: "Decidido", variant: "success" as const },
  critical: { label: "Crítico", variant: "danger" as const },
} as const;

export type StatusKey = keyof typeof statusMap;

export function StatusBadge({ status }: { status: StatusKey }) {
  const config = statusMap[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
