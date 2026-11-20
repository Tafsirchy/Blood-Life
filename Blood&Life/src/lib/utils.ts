import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(dateInput: Date | string | number, locale: "en" | "bn" = "en"): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  if (locale === "bn") {
    return date.toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function translateBloodGroup(group: string): string {
  const mapping: Record<string, string> = {
    "A+": "এ+",
    "A-": "এ-",
    "B+": "বি+",
    "B-": "বি-",
    "AB+": "এবি+",
    "AB-": "এবি-",
    "O+": "ও+",
    "O-": "ও-",
  };
  return mapping[group] || group;
}
