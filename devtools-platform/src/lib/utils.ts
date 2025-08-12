import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function validateJSON(jsonString: string): { valid: boolean; error?: string } {
  try {
    JSON.parse(jsonString);
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Invalid JSON' 
    };
  }
}

export function formatJSON(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonString;
  }
}

export function minifyJSON(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  } catch {
    return jsonString;
  }
}

export function encodeBase64(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    throw new Error('Failed to encode to Base64');
  }
}

export function decodeBase64(base64: string): string {
  try {
    return decodeURIComponent(escape(atob(base64)));
  } catch {
    throw new Error('Failed to decode from Base64');
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      textArea.remove();
      return Promise.resolve(true);
    } catch {
      textArea.remove();
      return Promise.resolve(false);
    }
  }
}