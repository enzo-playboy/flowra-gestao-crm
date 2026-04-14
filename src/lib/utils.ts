import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getDificuldadeColor(dificuldade: string): string {
  switch (dificuldade) {
    case "facil":
      return "text-success";
    case "medio":
      return "text-warning";
    case "dificil":
      return "text-danger";
    default:
      return "text-muted";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "concluido":
    case "realizada":
    case "fechado":
    case "confirmada":
      return "bg-success/10 text-success";
    case "em_progresso":
    case "agendada":
    case "qualificado":
    case "contato":
      return "bg-accent/10 text-accent";
    case "pendente":
    case "novo":
      return "bg-muted/10 text-muted";
    case "cancelada":
      return "bg-danger/10 text-danger";
    default:
      return "bg-muted/10 text-muted";
  }
}
