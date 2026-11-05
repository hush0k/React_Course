import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHome } from "react-icons/fi";
import { Button } from "@/components/Button.jsx";
import { cn } from "@/lib/utils";

const gridBackground = {
    backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
    backgroundSize: "56px 56px",
};

const corners = {
    left: {label: "Влево", x: -34, y: -18},
    center: {label: "По центру", x: 0, y: -26},
    right: {label: "Вправо", x: 34, y: -18},
};
const cornerIds = Object.keys(corners);

const missLines = {
    goal: ["ГОЛ! Но страницы всё равно нет", "Мяч в сетке, адрес — мимо", "Красиво! Жаль, VAR не засчитал маршрут"],
    saved: ["Сейв! Вратарь угадал", "Отбито. Как и этот URL", "Кипер прочитал удар"],
};

function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function Penalty() {
    const [shot, setShot] = useState(null);
    const [score, setScore] = useState({goals: 0, shots: 0});
    const timer = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    function kick(aim) {
        if (shot) return;
        const keeper = pick(cornerIds);
        const result = keeper === aim ? "saved" : "goal";
        setShot({aim, keeper, result, line: pick(missLines[result])});
        setScore(s => ({goals: s.goals + (result === "goal" ? 1 : 0), shots: s.shots + 1}));
        timer.current = setTimeout(() => setShot(null), 1600);
    }

    const ball = shot ? corners[shot.aim] : {x: 0, y: 0};
    const keeper = shot ? corners[shot.keeper] : {x: 0};

    return (
        <div className={"w-full max-w-md flex flex-col gap-4"}>
            <div className={"flex flex-row items-end justify-between uppercase"}>
                <p className={"text-primary-200 font-bold text-sm tracking-wide"}>Пока ищем страницу — пробейте пенальти</p>
                <p className={"font-display text-3xl text-secondary"}>{score.goals}<span className={"text-primary-300"}>/{score.shots}</span></p>
            </div>

            <div className={"relative h-56 rounded-md overflow-hidden border border-border-dark bg-primary-900"}>
                <div className={"absolute inset-0"} style={{backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 40px, transparent 40px 80px)"}}></div>
                <div className={"absolute left-1/2 top-4 -translate-x-1/2 w-4/5 h-24 border-4 border-b-0 border-text-inverse rounded-t-sm"}
                     style={{backgroundImage: "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "12px 12px"}}>
                </div>
                <div className={"absolute left-0 right-0 top-28 h-px bg-text-inverse/30"}></div>
                <div className={"absolute left-1/2 bottom-8 -translate-x-1/2 size-1.5 rounded-full bg-text-inverse/60"}></div>

                <div className={"absolute left-1/2 top-[68px] h-14 w-6 rounded-full bg-secondary transition-transform duration-300 ease-out"}
                     style={{transform: `translateX(calc(-50% + ${keeper.x * 3}px)) rotate(${keeper.x}deg)`}}>
                    <div className={"absolute -top-3 left-1/2 -translate-x-1/2 size-5 rounded-full bg-secondary-light"}></div>
                </div>

                <div className={"absolute left-1/2 bottom-6 text-2xl transition-all duration-500 ease-out"}
                     style={{transform: `translate(calc(-50% + ${ball.x * 3}px), ${ball.y * 4.6}px) scale(${shot ? 0.6 : 1}) rotate(${shot ? 540 : 0}deg)`}}>
                    ⚽
                </div>

                {shot && (
                    <div className={"absolute inset-x-0 bottom-0 py-2 text-center bg-primary-950/80"}>
                        <p className={cn("font-display uppercase text-xl", shot.result === "goal" ? "text-secondary" : "text-primary-100")}>{shot.line}</p>
                    </div>
                )}
            </div>

            <div className={"grid grid-cols-3 gap-2"}>
                {cornerIds.map(id => (
                    <Button key={id} text={corners[id].label} variant={"secondary"} size={"sm"} disabled={!!shot} onClick={() => kick(id)} />
                ))}
            </div>
        </div>
    );
}

export function NotFoundPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const canGoBack = location.key !== "default";

    return (
        <section className={"relative w-full overflow-hidden bg-primary-950 text-text-inverse"} style={gridBackground}>
            <p aria-hidden={"true"} className={"pointer-events-none select-none absolute -right-6 -bottom-16 font-display font-bold text-[260px] md:text-[420px] leading-none text-text-inverse/[0.04]"}>404</p>

            <div className={"container relative w-full py-16 lg:py-24 flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-20"}>
                <div className={"flex-1 flex flex-col items-start gap-5"}>
                    <div className={"inline-flex items-center gap-2 rounded-sm bg-danger px-3 py-1 text-sm font-bold uppercase tracking-wide"}>
                        <span className={"size-2 rounded-full bg-text-inverse animate-pulse"}></span>
                        VAR · проверка маршрута
                    </div>

                    <h1 className={"font-display font-bold uppercase leading-none"}>
                        <span className={"block text-8xl md:text-[160px] text-secondary"}>404</span>
                        <span className={"block text-5xl md:text-7xl"}>Вне игры</span>
                    </h1>

                    <p className={"text-primary-100 text-lg max-w-md"}>
                        Судья поднял флажок: страница <code className={"px-1.5 py-0.5 rounded-sm bg-primary-800 text-secondary-light font-mono text-base break-all"}>{location.pathname}</code> оказалась
                        в положении вне игры. Такого маршрута в клубе нет — возможно, игрок уже продан, а ссылка устарела.
                    </p>

                    <div className={"flex flex-row flex-wrap gap-3 pt-2"}>
                        <Link to={"/"}><Button text={"На главную"} icon={<FiHome />} variant={"secondary"} /></Link>
                        {canGoBack && (
                            <Button text={"Назад"} icon={<FiArrowLeft />} variant={"outline"} className={"text-text-inverse border-primary-500 hover:bg-primary-800 hover:border-primary-300"} onClick={() => navigate(-1)} />
                        )}
                    </div>

                    <nav className={"flex flex-row flex-wrap gap-x-5 gap-y-2 pt-4 text-sm font-bold uppercase tracking-wide"}>
                        <span className={"text-primary-300"}>Может, вы искали:</span>
                        {[["/team", "Команда"], ["/market", "Трансферы"], ["/academy", "Академия"], ["/history", "История"]].map(([to, label]) => (
                            <Link key={to} to={to} className={"text-primary-100 hover:text-secondary-light underline-offset-4 hover:underline"}>{label}</Link>
                        ))}
                    </nav>
                </div>

                <Penalty />
            </div>
        </section>
    );
}
