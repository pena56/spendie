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
