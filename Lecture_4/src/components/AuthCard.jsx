import { cn } from "@/lib/utils.js";

export function AuthCard({icon, title, subtitle, children, footer}) {
    return (
        <section className={"w-full min-h-screen flex flex-col items-center justify-center px-4 py-16"}>
            <div className={"w-full max-w-sm flex flex-col gap-6 rounded-md border border-border bg-background p-6 shadow-sm"}>
                <div className={"flex flex-col items-center gap-2 text-center"}>
                    <span className={"flex items-center justify-center size-12 rounded-full bg-primary text-secondary text-xl"}>
                        {icon}
                    </span>
                    <h1 className={"font-display font-bold uppercase text-3xl text-primary"}>{title}</h1>
                    {subtitle && <p className={"text-text-muted text-sm"}>{subtitle}</p>}
                </div>
                {children}
                {footer && <p className={"text-center text-sm text-text-muted"}>{footer}</p>}
            </div>
        </section>
    );
}

export function AuthField({label, error, className, ...props}) {
    return (
        <label className={"flex flex-col gap-1 text-sm font-semibold"}>
            {label}
            <input
                {...props}
                aria-invalid={error ? true : undefined}
                className={cn(
                    "rounded-md border border-border px-3 py-2 font-normal disabled:opacity-60 disabled:cursor-not-allowed",
                    error && "border-red-500",
                    className,
                )}
            />
            {error && <span className={"text-xs font-normal text-red-600"}>{error}</span>}
        </label>
    );
}

export function AuthError({children}) {
    if (!children) return null;
    return (
        <p role={"alert"} className={"rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"}>
            {children}
        </p>
    );
}
