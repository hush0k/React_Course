import { useEffect, useState } from "react";
import { ClubHistory } from "@/components/ClubHistory.jsx";
import { Button } from "@/components/Button.jsx";
import { fetchSeasonHistory } from "@/api";

export function HistoryPage({season}) {
    const [retry, setRetry] = useState(0);
    const [result, setResult] = useState({key: null, seasons: [], error: false});
    const requestKey = `${season}-${retry}`;
    const loading = result.key !== requestKey;

    // сезон сменился — значит, в истории появилась новая запись
    useEffect(() => {
        let ignore = false;
        fetchSeasonHistory()
            .then(data => {
                if (!ignore) setResult({key: requestKey, seasons: data, error: false});
            })
            .catch(() => {
                if (!ignore) setResult({key: requestKey, seasons: [], error: true});
            });
        return () => {
            ignore = true;
        };
    }, [requestKey]);

    // первая загрузка — спиннер; при повторной показываем старые данные, пока не придут новые
    if (loading && result.key === null) {
        return (
            <div className={"container flex flex-col items-center justify-center gap-4 py-24"}>
                <div className={"size-12 rounded-full border-4 border-background-subtle border-t-secondary animate-spin"}></div>
                <p className={"text-text-muted text-sm uppercase tracking-wide"}>Загружаем историю клуба…</p>
            </div>
        );
    }

    if (!loading && result.error) {
        return (
            <div className={"container flex flex-col items-center justify-center gap-4 py-24 text-center"}>
                <p className={"text-danger text-base font-bold"}>Не удалось загрузить историю клуба. Проверьте соединение и попробуйте ещё раз.</p>
                <Button text={"Повторить"} variant={"outline"} size={"sm"} onClick={() => setRetry(r => r + 1)} />
            </div>
        );
    }

    return <ClubHistory seasons={result.seasons}/>
}
