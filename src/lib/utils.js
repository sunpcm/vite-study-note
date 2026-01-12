import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并类名的工具函数
 * 1. clsx: 处理条件类名 (如: isOpen && "block")
 * 2. twMerge: 处理 Tailwind 冲突 (如: 传入 "px-4" 覆盖默认的 "px-2")
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}