import { useOnlineStatus } from "@/hooks/useOnlineStatus.js";
import { cn } from "@/lib/utils";

export function ConnectionStatus() {
    const online = useOnlineStatus();

    return (
        <div
            role={"status"}
            aria-live={"polite"}
            title={online ? "Есть соединение" : "Нет соединения"}
            className={"flex flex-row items-center gap-1.5 shrink-0"}
        >
            <span className={cn("size-2.5 rounded-full", online ? "bg-success" : "bg-danger animate-pulse")}></span>
            <span className={"hidden sm:inline text-xs font-bold uppercase tracking-wide text-text-inverse-muted"}>
                {online ? "Онлайн" : "Офлайн"}
            </span>
        </div>
    );
}
