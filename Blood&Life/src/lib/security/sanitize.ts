/**
 * Input Sanitization Utility for Blood&Life
 * Defends against XSS, HTML injection, and control character tampering
 */

export function sanitizeText(
  input: string | undefined | null,
  maxLength?: number
): string {
  if (!input) return "";

  // 1. Strip entire <script>...</script> and <style>...</style> blocks and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  // 2. Strip all remaining HTML tags (<a ...>, <img ...>, etc.)
  sanitized = sanitized.replace(/<\/?[^>]+(>|$)/gi, "");

  // 3. Remove script / data / javascript protocol injection vectors
  sanitized = sanitized.replace(/(javascript|vbscript|data):/gi, "");

  // 4. Remove DOM inline event handlers (e.g. onerror=, onclick=, onload=)
  sanitized = sanitized.replace(/on\w+\s*=/gi, "");

  // 5. Strip dangerous ASCII control chars (allowing standard newline \n and \r)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 6. Trim leading/trailing whitespace
  sanitized = sanitized.trim();

  // 7. Enforce optional max length boundary
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Escapes special RegExp metacharacters for safe case-insensitive MongoDB regex queries.
 */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
