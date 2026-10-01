import { cn } from '@/lib/utils'

const variants = {
    primary: 'bg-primary text-text-inverse hover:bg-primary-700 active:bg-primary-800',
    secondary: 'bg-secondary text-primary hover:bg-secondary-light active:bg-secondary-dark',
    outline: 'border-1.5 border-border-strong bg-transparent text-primary hover:border-primary hover:bg-primary-50',
    ghost: 'bg-transparent text-primary hover:bg-primary-50',
    danger: 'bg-danger text-text-inverse hover:opacity-90',
}

const sizes = {
    sm: 'h-9 gap-1.5 px-3 text-sm',
    md: 'h-control gap-2 px-5 text-base-sm',
    lg: 'h-control-lg gap-2 px-6 text-base-sm',
    icon: 'size-control p-0',
}

export function Button({
    text,
    icon,
    children,
    variant = 'primary',
    size = 'md',
    className,
    type = 'button',
    onClick,
    ...props
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={cn(
                'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md',
                'font-sans font-bold uppercase tracking-wide whitespace-nowrap',
                'transition-colors duration-150',
                'focus-visible:shadow-gold focus-visible:outline-none',
                'disabled:pointer-events-none disabled:opacity-50',
                variants[variant],
                sizes[size],
                className,
            )}
            {...props}
        >
            {children ?? text}
            {icon}
        </button>
    )
}
