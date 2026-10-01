import { Button } from "@/components/Button.jsx";

const results = {
    win: {label: "Победа в сезоне", text: "Меньше 5 поражений за сезон - руководство в восторге!", className: "text-secondary"},
    lose: {label: "Вы уволены", text: "Больше 12 поражений за сезон - руководство недовольно.", className: "text-danger"},
    finished: {label: "Сезон завершён", text: "Ни триумфа, ни провала - сезон окончен.", className: "text-text-inverse"},
};

export function SeasonResult({result, stats, onRestart}) {
    const info = results[result];

    return (
        <div className={"fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"}>
            <div className={"flex flex-col items-center space-y-5 bg-primary rounded-lg shadow-card p-10 max-w-lg w-full text-center"}>
                <p className={"uppercase text-secondary-light font-bold text-sm tracking-widest"}>итоги сезона</p>
                <h2 className={`font-bold font-display text-6xl uppercase ${info.className}`}>{info.label}</h2>
                <p className={"text-text-inverse-muted"}>{info.text}</p>

                <div className={"flex flex-row space-x-8 text-text-inverse"}>
                    <p><b className={"text-4xl font-display"}>{stats.wins}</b><br/>побед</p>
                    <p><b className={"text-4xl font-display"}>{stats.draws}</b><br/>ничьих</p>
                    <p><b className={"text-4xl font-display"}>{stats.losses}</b><br/>поражений</p>
                </div>

                <Button text={"Начать заново"} variant={"secondary"} size={"lg"} onClick={onRestart} />
            </div>
        </div>
    )
}
