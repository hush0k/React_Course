import { FiDatabase } from "react-icons/fi";
import { useCachedData } from "@/hooks/useCachedData.js";

export function CachedDataNotice() {
    const showingCachedData = useCachedData();

    if (!showingCachedData) return null;

    return (
        <div
            role={"status"}
            aria-live={"polite"}
            className={"flex w-full flex-row items-center justify-center gap-2 bg-secondary px-4 py-2 text-center text-sm font-bold text-primary"}
        >
            <FiDatabase className={"shrink-0"} />
            Показаны сохранённые данные. Они могут быть устаревшими.
        </div>
    );
}
