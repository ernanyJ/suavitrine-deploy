import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Calculates the relative luminance of a color (WCAG formula)
 * Returns a value between 0 (darkest) and 1 (lightest)
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    const v = val / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Determines the appropriate text color (black or white) based on the background color
 * Uses WCAG contrast ratio guidelines to ensure readability
 * 
 * @param backgroundColor - Hex color string (e.g., "#00ff00" or "00ff00")
 * @returns "#000000" for light backgrounds, "#ffffff" for dark backgrounds
 */
export function getContrastTextColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor)
  if (!rgb) return "#ffffff" // Default to white if color parsing fails

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
  
  // If luminance is greater than 0.5, the color is light, use dark text
  // Otherwise, the color is dark, use light text
  return luminance > 0.5 ? "#000000" : "#ffffff"
}
