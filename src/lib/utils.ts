import { clsx, type ClassValue } from "clsx";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function showErrorMessage(error: unknown) {
  if (error instanceof ConvexError) {
    toast.error(error.data);
  } else {
    toast.error("An unexpected error occurred.");
  }
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCurrency(amount?: number): string {
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  });
  return formatter.format(amount ?? 0);
}
