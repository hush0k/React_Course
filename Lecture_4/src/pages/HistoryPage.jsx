import { ClubHistory } from "@/components/ClubHistory.jsx";
import { Button } from "@/components/Button.jsx";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadHistory } from "@/store/historySlice.js";

export function HistoryPage() {
    const dispatch = useDispatch();
    const {seasons, status} = useSelector(state => state.history);
    const isPending = status === "idle" || status === "loading";
    const isError = status === "failed";

    useEffect(() => {
        dispatch(loadHistory());
    }, [dispatch]);

    if (isPending) {
        return (
            <div className={"container flex flex-col items-center justify-center gap-4 py-24"}>
                <div className={"size-12 rounded-full border-4 border-background-subtle border-t-secondary animate-spin"}></div>
                <p className={"text-text-muted text-sm uppercase tracking-wide"}>Загружаем историю клуба…</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className={"container flex flex-col items-center justify-center gap-4 py-24 text-center"}>
                <p className={"text-danger text-base font-bold"}>Не удалось загрузить историю клуба. Проверьте соединение и попробуйте ещё раз.</p>
                <Button text={"Повторить"} variant={"outline"} size={"sm"} onClick={() => dispatch(loadHistory())} />
            </div>
        );
    }

    return <ClubHistory seasons={seasons}/>
}
