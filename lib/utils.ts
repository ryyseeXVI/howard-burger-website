import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getScoreColor = (score: string | number | undefined) => {
  if (!score) return "bg-gray-100 text-gray-800 border-gray-200";
  
  const scoreNum = typeof score === 'string' ? parseInt(score) : score;
  
  if (isNaN(scoreNum)) return "bg-gray-100 text-gray-800 border-gray-200";
  if (scoreNum <= 4) return "bg-red-100 text-red-800 border-red-200";
  if (scoreNum <= 7) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-green-100 text-green-800 border-green-200";
};

/**
 * Truncates text to a specified maximum length and adds ellipsis if needed
 * @param text The text to truncate
 * @param maxLength Maximum length of the text (default: 30)
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string | undefined | null, maxLength: number = 30): string => {
  if (!text) return '';
  
  return text.length > maxLength 
    ? text.substring(0, maxLength) + '...'
    : text;
};
