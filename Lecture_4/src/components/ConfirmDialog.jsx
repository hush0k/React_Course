import { Button } from "@/components/Button.jsx";

export function ConfirmDialog({title, text, confirmText, onConfirm, onCancel}) {
    return (
        <div className={"fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"} onClick={onCancel}>
            <div className={"flex flex-col space-y-4 bg-background-surface rounded-lg shadow-card border border-border p-8 max-w-md w-full"}
                 onClick={(event) => event.stopPropagation()}>
                <h3 className={"text-text font-bold font-display text-3xl uppercase"}>{title}</h3>
                <p className={"text-text-secondary"}>{text}</p>
                <div className={"flex flex-row justify-end gap-3 pt-2"}>
                    <Button text={"Отмена"} variant={"outline"} onClick={onCancel} />
                    <Button text={confirmText} variant={"danger"} onClick={onConfirm} />
                </div>
            </div>
        </div>
    )
}
