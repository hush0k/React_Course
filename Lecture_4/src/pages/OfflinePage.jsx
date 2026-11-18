import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiRefreshCw, FiWifiOff } from "react-icons/fi";
import { Button } from "@/components/Button.jsx";
import { CachedPublicData } from "@/components/CachedPublicData.jsx";
import { checkConnection, onReconnect } from "@/services/connection.js";

const gridBackground = {
    backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
    backgroundSize: "56px 56px",
};

export function OfflinePage() {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(false);
    const [failed, setFailed] = useState(false);

    const retry = useCallback(async () => {
        setChecking(true);
        setFailed(false);
        const connected = await checkConnection();
        setChecking(false);
        if (connected) {
            navigate("/", {replace: true});
        } else {
            setFailed(true);
        }
    }, [navigate]);

    useEffect(() => onReconnect(retry), [retry]);

    return (
        <section className={"relative flex min-h-screen w-full items-center overflow-hidden bg-primary-950 text-text-inverse"} style={gridBackground}>
            <div className={"container relative flex w-full flex-col items-start gap-5 py-16"}>
                <div className={"inline-flex items-center gap-2 rounded-sm bg-danger px-3 py-1 text-sm font-bold uppercase tracking-wide"}>
                    <FiWifiOff />
                    Нет соединения
                </div>

                <h1 className={"font-display font-bold uppercase leading-none"}>
                    <span className={"block text-6xl md:text-8xl text-secondary"}>Связь</span>
                    <span className={"block text-4xl md:text-6xl"}>потеряна</span>
                </h1>

                <p className={"max-w-md text-lg text-primary-100"}>
                    Не удаётся загрузить страницу без интернета. Проверьте подключение и повторите попытку:
                    как только связь появится, вы вернётесь в игру.
                </p>

                {failed && (
                    <p role={"alert"} className={"text-sm font-bold text-secondary-light"}>
                        Соединения по-прежнему нет. Попробуйте ещё раз.
                    </p>
                )}

                <Button
                    text={checking ? "Проверяем…" : "Повторить подключение"}
                    icon={<FiRefreshCw className={checking ? "animate-spin" : ""} />}
                    variant={"secondary"}
                    onClick={retry}
                    disabled={checking}
                    aria-busy={checking}
                />

                <CachedPublicData />
            </div>
        </section>
    );
}
