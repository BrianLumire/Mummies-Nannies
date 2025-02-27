// src/lib/utils.ts

/**
 * Concatenates class names, filtering out falsy values.
 *
 * @param classes - A list of class names, potentially including falsy values.
 * @returns The concatenated class names.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ");
  }
  