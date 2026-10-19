import { Button } from "@/components/Button.jsx";

export function ErrorDialog({title = "Ошибка", text, onClose}) {
    return (
        <div className={"fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4"} onClick={onClose}>
            <div className={"flex flex-col space-y-4 bg-background-surface rounded-lg shadow-card border border-border p-6 md:p-8 max-w-md w-full"}
                 onClick={(event) => event.stopPropagation()}>
                <h3 className={"text-text font-bold font-display text-3xl uppercase"}>{title}</h3>
                <p className={"text-text-secondary"}>{text}</p>
                <div className={"flex flex-row justify-end pt-2"}>
                    <Button text={"Понятно"} variant={"primary"} onClick={onClose} />
                </div>
            </div>
        </div>
    )
}
