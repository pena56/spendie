import { clsx, type ClassValue } from "clsx";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

/**
 * Merge and normalize CSS class values into a single class string.
 *
 * @param inputs - One or more `clsx`-compatible class values (strings, arrays, objects, etc.)
 * @returns A single class string with values combined and Tailwind classes deduplicated/merged
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Displays an error notification based on the provided error.
 *
 * If `error` is a `ConvexError`, the notification shows `error.data`; otherwise the notification shows
 * "An unexpected error occurred."
 *
 * @param error - The error to display; if a `ConvexError`, its `data` string is used for the message
 */
export function showErrorMessage(error: unknown) {
  if (error instanceof ConvexError) {
    toast.error(error.data);
  } else {
    toast.error("An unexpected error occurred.");
  }
}