import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Кастомные токены из @theme в index.css — иначе tailwind-merge
// путает, например, text-hero (размер) с text-primary (цвет)
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['2xs', 'base-sm', 'md', 'hero'],
      tracking: ['eyebrow', 'label', 'tight-display'],
      shadow: ['card', 'soft', 'gold'],
      spacing: ['18', '22', 'control', 'control-lg', 'header', 'page-x'],
      container: ['page'],
    },
    classGroups: {
      'bg-image': [{ bg: ['stadium', 'card-photo'] }],
    },
  },
})

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
