import { cn } from "@/lib/utils"

export function Button({ content, onClick, className, ...props }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn("px-6 py-3 rounded-lg bg-jade-600 text-white" +
                " hover:bg-jade-700 cursor-pointer transition-all" +
                " duration-200" +
                " text-sm", className)}
            {...props}
        >
            {content}
        </button>
    )
}