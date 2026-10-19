import { FaCheckCircle, FaFutbol, FaHourglassHalf, FaListOl, FaStar, FaTimesCircle, FaTrophy, FaUserClock, FaBullseye } from "react-icons/fa";
import { cn } from "@/lib/utils.js";

const CHAMPIONS_STAGES = ["Общий этап", "1/8 финала", "1/4 финала", "Полуфинал", "Финал", "Победа"];

function formatNumber(value) {
    return Math.round(value * 10) / 10;
}

function formatMoney(value) {
    return `€ ${formatNumber(value)} млн`;
}

function formatChampionsStage(value) {
    return CHAMPIONS_STAGES[value] ?? "—";
}

// иконка и подписи прогресса зависят от типа задачи
const objectiveTypes = {
    laliga_place: {
        icon: FaListOl,
        current: progress => `${progress} место`,
        target: target => `Топ-${target}`,
    },
    champions_league: {
        icon: FaTrophy,
        current: formatChampionsStage,
        target: formatChampionsStage,
    },
    el_clasico: {
        icon: FaFutbol,
        current: progress => `${progress} очк.`,
        target: target => `${target} очк.`,
    },
    rejuvenate: {
        icon: FaUserClock,
        current: progress => `${formatNumber(progress)} лет`,
        target: target => `до ${target} лет`,
    },
    star_player: {
        icon: FaStar,
        current: progress => progress ? `Сила ${formatNumber(progress)}` : "Нет покупок",
        target: target => `Сила ${target}+`,
    },
};

const defaultType = {
    icon: FaBullseye,
    current: progress => formatNumber(progress),
    target: target => target,
};

function getStatus(objective) {
    if (objective.status === "completed" || objective.achieved) {
        return {
            text: objective.status === "completed" ? "Выполнено" : "Достигнуто",
            icon: FaCheckCircle,
            badge: "bg-success text-text-inverse",
            bar: "bg-success",
        };
    }
    if (objective.status === "failed") {
        return {
            text: "Провалено",
            icon: FaTimesCircle,
            badge: "bg-danger text-text-inverse",
            bar: "bg-danger",
        };
    }
    return {
        text: "В процессе",
        icon: FaHourglassHalf,
        badge: "bg-primary-700 text-secondary-light border border-secondary/30",
        bar: "bg-secondary",
    };
}

function ProgressValue({name, value}) {
    return (
        <div className={"flex flex-col space-y-1 border-t border-border py-4"}>
            <p className={"text-text-muted uppercase text-xs font-bold tracking-widest"}>{name}</p>
            <p className={"text-text text-xl font-bold"}>{value}</p>
        </div>
    )
}

function MoneyValue({name, value, className}) {
    return (
        <div className={"flex flex-col bg-background-muted rounded-lg py-3 px-5 w-full"}>
            <p className={"text-text-muted text-sm"}>{name}</p>
            <p className={cn("font-bold", className)}>{value}</p>
        </div>
    )
}

function ObjectiveCard({objective}) {
    const type = objectiveTypes[objective.type] ?? defaultType;
    const status = getStatus(objective);
    const TypeIcon = type.icon;
    const StatusIcon = status.icon;

    return (
        <div className={"flex flex-col bg-background-surface shadow-card rounded-xl border border-border overflow-hidden"}>
            {/* тёмная шапка как в профиле клуба */}
            <div className={"flex flex-row items-center justify-between bg-primary px-5 py-4"}>
                <div className={"bg-primary-700 rounded-full p-3 text-secondary"}>
                    <TypeIcon size={20}/>
                </div>
                <span className={cn("flex flex-row items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide", status.badge)}>
                    <StatusIcon/>
                    <span>{status.text}</span>
                </span>
            </div>

            <div className={"flex flex-col flex-1 space-y-4 p-5"}>
                <p className={"text-text text-lg font-bold flex-1"}>{objective.condition}</p>

                <div className={"grid grid-cols-2 gap-x-6"}>
                    <ProgressValue name={"Сейчас"} value={objective.progress === null ? "—" : type.current(objective.progress)}/>
                    <ProgressValue name={"Цель"} value={type.target(objective.target)}/>
                </div>

                <div className={"flex flex-col sm:flex-row gap-3"}>
                    <MoneyValue name={"Награда"} value={`+${formatMoney(objective.reward)}`} className={"text-success"}/>
                    <MoneyValue name={"Штраф"} value={`−${formatMoney(objective.penalty)}`} className={"text-danger"}/>
                </div>
            </div>

            {/* полоска статуса снизу */}
            <div className={cn("h-1.5 w-full", status.bar)}></div>
        </div>
    )
}

export function SeasonObjectives({objectives}) {
    const done = objectives.filter(objective => objective.status === "completed" || objective.achieved).length;

    return (
        <section id={"objectives"} className={"container flex flex-col space-y-8 py-12 lg:py-20 w-full"}>
            <div className={"flex flex-col md:flex-row md:items-end justify-between gap-4"}>
                <div className={"flex flex-col space-y-1 uppercase"}>
                    <p className={"text-secondary-text font-bold text-base tracking-wide"}>задачи руководства</p>
                    <h2 className={"text-text font-bold text-5xl md:text-8xl"}>Цели на сезон</h2>
                </div>
                {objectives.length > 0 && (
                    <p className={"flex flex-row items-center gap-2 text-3xl md:text-4xl font-bold font-display text-text"}>
                        <FaCheckCircle className={"text-success"}/>
                        {done} / {objectives.length}
                    </p>
                )}
            </div>

            {objectives.length === 0 ? (
                <p className={"text-text-muted"}>Целей на этот сезон нет.</p>
            ) : (
                <div className={"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"}>
                    {objectives.map(objective => <ObjectiveCard key={objective.id} objective={objective}/>)}
                </div>
            )}
        </section>
    )
}
