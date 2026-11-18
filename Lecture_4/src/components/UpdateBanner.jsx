import { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { Button } from "@/components/Button.jsx";
import { useUpdateAvailable } from "@/hooks/useUpdateAvailable.js";
import { applyUpdate } from "@/services/update.js";

export function UpdateBanner() {
    const updateAvailable = useUpdateAvailable();
    const [updating, setUpdating] = useState(false);

    if (!updateAvailable) return null;

    const update = () => {
        setUpdating(true);
        applyUpdate();
    };

    return (
        <div
            role={"status"}
            aria-live={"polite"}
            className={"fixed bottom-4 inset-x-4 z-[55] mx-auto flex max-w-lg flex-col gap-3 rounded-lg border border-border bg-background-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between"}
        >
            <div className={"flex flex-col"}>
                <p className={"text-text font-bold uppercase tracking-wide"}>Доступна новая версия</p>
                <p className={"text-text-secondary text-sm"}>Обновите приложение, чтобы получить последние изменения.</p>
            </div>
            <Button
                text={updating ? "Обновляем…" : "Обновить"}
                variant={"secondary"}
                disabled={updating}
                icon={<FiRefreshCw className={updating ? "animate-spin" : ""} />}
                onClick={update}
            />
        </div>
    );
}
