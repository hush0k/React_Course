import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/Button.jsx";
import { cn } from "@/lib/utils";
import { average, getBlockReason, getFlagUrl, getPositionGroup, getRank, isAcademy, positionNames } from "@/lib/players.js";

const lineUpColors = {
    "Основной состав": "bg-role-starter text-primary",
    "Игрок ротации": "bg-role-bench text-text-inverse",
    "Запасной состав": "bg-role-rotation text-text-inverse",
    "Глубина состава": "bg-role-depth-border text-primary",
    "Воспитанник": "bg-success text-text-inverse",
};

// тонкая сетка на фоне, как на референсе
const gridBackground = {
    backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
    backgroundSize: "56px 56px",
};

function getAgeCategory(age) {
    if (age <= 21) return "Молодой талант";
    if (age <= 25) return "Растущий игрок";
    if (age <= 30) return "Пик карьеры";
    return "Ветеран";
}

function round(value) {
    return Math.round(value * 10) / 10;
}

function PlayerPhoto({player, className}) {
    if (player.img_url) {
        return <img src={player.imgUrl} alt={`${player.lastName} ${player.name}`} className={className} />;
    }

    return (
        <div className={"mb-10 flex items-center justify-center size-56 rounded-full bg-primary-800 border-4 border-primary-600"}>
            <p className={"text-8xl text-primary-400 font-bold font-display uppercase"}>{player.lastName[0]}{player.name[0]}</p>
        </div>
    );
}

function StatCard({label, children, hint}) {
    return (
        <div className={"flex flex-col bg-background-surface border border-border rounded-xl shadow-card p-5"}>
            <p className={"text-text-muted text-xs uppercase tracking-label font-bold"}>{label}</p>
            <div className={"mt-2"}>{children}</div>
            {hint && <p className={"mt-2 text-text-muted text-sm"}>{hint}</p>}
        </div>
    );
}

function InfoRow({label, value}) {
    return (
        <div className={"flex flex-row items-center justify-between gap-4 py-3 border-t border-border first:border-t-0"}>
            <p className={"text-text-secondary text-base"}>{label}</p>
            <div className={"text-text text-base font-bold text-right"}>{value}</div>
        </div>
    );
}

function CompareBar({label, value, avg, max, suffix = ""}) {
    const diff = round(value - avg);

    return (
        <div className={"flex flex-col gap-2"}>
            <div className={"flex flex-row items-baseline justify-between"}>
                <p className={"text-text-secondary text-base"}>{label}</p>
                <p className={"text-text text-base font-bold"}>
                    {value}{suffix}
                    <span className={cn("ml-2 text-sm", diff >= 0 ? "text-success" : "text-danger")}>
                        {diff >= 0 ? "+" : ""}{diff}
                    </span>
                </p>
            </div>
            <div className={"relative h-2 w-full bg-background-subtle rounded-full"}>
                <div className={"h-full bg-secondary rounded-full"} style={{width: `${Math.min(100, value / max * 100)}%`}}></div>
                <div className={"absolute -top-1 h-4 w-0.5 bg-primary"} style={{left: `${Math.min(100, avg / max * 100)}%`}} title={`Среднее: ${round(avg)}`}></div>
            </div>
            <p className={"text-text-muted text-xs"}>Среднее: {round(avg)}{suffix}</p>
        </div>
    );
}

export function PlayerPage({squad, market, finance, onSell, onPromote, onBuy}) {
    const {id} = useParams();
    const navigate = useNavigate();

    const player = squad.find(item => String(item.id) === id) ?? market.find(item => String(item.id) === id);

    if (!player) {
        return (
            <section className={"container w-full py-24 flex flex-col items-start gap-4"}>
                <p className={"text-secondary-text font-bold text-base uppercase tracking-eyebrow"}>Профиль игрока</p>
                <h1 className={"text-text font-bold text-4xl md:text-6xl"}>Игрок не найден</h1>
                <p className={"text-text-secondary text-lg"}>Возможно, он был продан или ушёл с рынка.</p>
                <Link to={"/team"}><Button text={"К команде"} icon={<FiArrowLeft />} variant={"outline"} /></Link>
            </section>
        );
    }

    const inSquad = player.status === "squad";
    const pool = inSquad ? squad : market;
    const backLink = inSquad ? "/team" : "/market";
    const rank = getRank(player.power);
    const group = getPositionGroup(player.position);
    const flagUrl = getFlagUrl(player.nation);

    const samePosition = [...pool.filter(item => item.position === player.position)].sort((a, b) => b.power - a.power);
    const positionPlace = samePosition.findIndex(item => item.id === player.id) + 1;
    const poolPlace = [...pool].sort((a, b) => b.power - a.power).findIndex(item => item.id === player.id) + 1;

    const similar = pool
        .filter(item => item.id !== player.id && group?.positions.includes(item.position))
        .sort((a, b) => Math.abs(a.power - player.power) - Math.abs(b.power - player.power))
        .slice(0, 4);

    const finances = {
        availableBudget: finance.available_budget,
        transferBudgetLeft: finance.effective_transfer_left,
        salaryFundUsed: finance.all_salary,
        salaryFund: finance.effective_salary_fund,
    };
    const blockReason = inSquad ? null : getBlockReason(player, finances);
    const salaryShare = finance.effective_salary_fund ? round(player.salary / finance.effective_salary_fund * 100) : 0;

    async function handleSell() {
        await onSell(player.id);
        navigate("/team");
    }

    async function handleBuy() {
        await onBuy(player);
        navigate("/team");
    }

    const heroInfo = [
        {label: "Возраст", value: `${player.age} лет`},
        {label: "Позиция", value: positionNames[player.position] ?? player.position},
        {
            label: "Нация",
            value: (
                <span className={"flex flex-row items-center gap-2"}>
                    {flagUrl && <img src={flagUrl} alt="" className={"h-4 w-6 object-cover rounded-xs"} />}
                    {player.nation}
                </span>
            ),
        },
    ];

    return (
        <div className={"flex flex-col w-full"}>
            {/* ---------- Hero ---------- */}
            <section className={"relative w-full overflow-hidden bg-primary-950 text-text-inverse"} style={gridBackground}>
                <div className={"absolute -right-32 top-1/2 -translate-y-1/2 size-[640px] rounded-full bg-primary-700/40 blur-3xl"}></div>

                <div className={"container relative flex flex-col lg:flex-row lg:items-end gap-6 pt-8 lg:pt-12"}>
                    <div className={"flex flex-col flex-1 pb-8 lg:pb-14 z-10"}>
                        <div className={"flex flex-row flex-wrap items-center justify-between gap-3"}>
                            <Link to={backLink} className={"inline-flex items-center gap-2 text-primary-200 hover:text-secondary-light text-sm font-bold uppercase tracking-wide"}>
                                <FiArrowLeft /> Все игроки
                            </Link>
                            <div className={"flex flex-row flex-wrap gap-2"}>
                                <span className={cn("rounded-md px-2 py-1 text-xs font-bold uppercase", rank.className)}>{rank.label}</span>
                                {inSquad
                                    ? <span className={cn("rounded-md px-2 py-1 text-xs font-bold uppercase", lineUpColors[player.lineUp])}>{player.lineUp}</span>
                                    : <span className={"rounded-md px-2 py-1 text-xs font-bold uppercase bg-primary-700 text-primary-100"}>На рынке</span>}
                                {isAcademy(player) && <span className={"rounded-md px-2 py-1 text-xs font-bold uppercase bg-success text-text-inverse"}>Академия</span>}
                            </div>
                        </div>

                        <p className={"mt-10 lg:mt-20 text-xl md:text-2xl text-primary-100"}>
                            {player.lastName}
                            {player.number && <span className={"ml-3 text-secondary-light font-display font-bold"}>#{player.number}</span>}
                        </p>
                        <h1 className={"mt-1 text-6xl md:text-8xl lg:text-hero font-bold tracking-tight-display break-words"}>{player.name}</h1>
                        <div className={"mt-4 h-1.5 w-24 bg-secondary rounded-full"}></div>

                        <div className={"mt-8 lg:mt-14 grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-xl"}>
                            {heroInfo.map(item => (
                                <div key={item.label}>
                                    <p className={"text-primary-300 text-xs uppercase tracking-label font-bold"}>{item.label}</p>
                                    <div className={"mt-1 text-lg md:text-xl font-bold"}>{item.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className={"mt-8 flex flex-row flex-wrap gap-3"}>
                            {inSquad ? (
                                <>
                                    <Button text={isAcademy(player) ? "Перевести в основу" : "Изменить статус"} variant={"secondary"} size={"lg"} onClick={() => onPromote(player.id)} />
                                    <Button text={"Продать"} variant={"danger"} size={"lg"} onClick={handleSell} />
                                </>
                            ) : (
                                <div className={"flex flex-col gap-1"}>
                                    <Button text={`Купить за € ${player.price} млн`} variant={"secondary"} size={"lg"} disabled={blockReason !== null} onClick={handleBuy} />
                                    {blockReason && <p className={"text-warning text-sm font-bold"}>{blockReason}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={"relative flex justify-center items-end lg:w-[44%] h-80 md:h-[440px] lg:h-[560px]"}>
                        <p className={"absolute top-0 right-0 font-display font-bold text-[140px] md:text-[220px] leading-none text-white/5 select-none"}>{player.power}</p>
                        <PlayerPhoto player={player} className={"relative h-full w-auto object-contain object-bottom drop-shadow-2xl"} />
                    </div>
                </div>
            </section>

            {/* ---------- Ключевые показатели ---------- */}
            <section className={"container w-full -mt-px py-10 lg:py-14 flex flex-col gap-10"}>
                <div className={"grid grid-cols-2 lg:grid-cols-4 gap-4"}>
                    <StatCard label={"Сила"} hint={`#${poolPlace} из ${pool.length} ${inSquad ? "в команде" : "на рынке"}`}>
                        <p className={"text-5xl font-display font-bold text-text"}>{player.power}</p>
                        <div className={"mt-3 h-2 w-full bg-background-subtle rounded-full"}>
                            <div className={"h-full bg-secondary rounded-full"} style={{width: `${player.power}%`}}></div>
                        </div>
                    </StatCard>
                    <StatCard label={"Стоимость"} hint={`€ ${round(player.price / player.power)} млн за 1 ед. силы`}>
                        <p className={"text-3xl md:text-4xl font-display font-bold text-text"}>€ {player.price} <span className={"text-xl"}>млн</span></p>
                    </StatCard>
                    <StatCard label={"Зарплата / год"} hint={`${salaryShare}% фонда зарплат`}>
                        <p className={"text-3xl md:text-4xl font-display font-bold text-text"}>€ {player.salary} <span className={"text-xl"}>млн</span></p>
                    </StatCard>
                    <StatCard label={"На позиции"} hint={`${positionNames[player.position]} · ${group?.label ?? ""}`}>
                        <p className={"text-3xl md:text-4xl font-display font-bold text-text"}>#{positionPlace} <span className={"text-xl text-text-muted"}>из {samePosition.length}</span></p>
                    </StatCard>
                </div>

                <div className={"grid grid-cols-1 lg:grid-cols-2 gap-6"}>
                    <div className={"bg-background-surface border border-border rounded-xl shadow-card p-6"}>
                        <h2 className={"text-3xl font-bold text-text"}>Досье</h2>
                        <div className={"mt-4 flex flex-col"}>
                            <InfoRow label={"Полное имя"} value={`${player.lastName} ${player.name}`} />
                            <InfoRow label={"Возраст"} value={`${player.age} лет · ${getAgeCategory(player.age)}`} />
                            <InfoRow label={"Позиция"} value={`${player.position} · ${positionNames[player.position]}`} />
                            <InfoRow label={"Линия"} value={group?.label ?? "—"} />
                            <InfoRow label={"Нация"} value={player.nation} />
                            {inSquad ? (
                                <>
                                    <InfoRow label={"Номер"} value={player.number ? `#${player.number}` : "—"} />
                                    <InfoRow label={"Статус в составе"} value={player.lineUp} />
                                </>
                            ) : (
                                <>
                                    <InfoRow label={"Текущий клуб"} value={player.club ?? "—"} />
                                    <InfoRow label={"Лига"} value={player.league ?? "—"} />
                                    <InfoRow label={"Общая сумма сделки"} value={`€ ${round(player.price + player.salary)} млн`} />
                                </>
                            )}
                            <InfoRow label={"Ранг"} value={rank.label} />
                        </div>
                    </div>

                    <div className={"bg-background-surface border border-border rounded-xl shadow-card p-6 flex flex-col"}>
                        <h2 className={"text-3xl font-bold text-text"}>Сравнение</h2>
                        <p className={"mt-1 text-text-muted text-sm"}>Относительно {inSquad ? "игроков команды" : "игроков на рынке"}</p>
                        <div className={"mt-6 flex flex-col gap-6"}>
                            <CompareBar label={"Сила"} value={player.power} avg={average(pool.map(item => item.power))} max={100} />
                            <CompareBar label={"Стоимость"} value={player.price} avg={average(pool.map(item => item.price))} max={Math.max(...pool.map(item => item.price))} suffix={" млн"} />
                            <CompareBar label={"Зарплата"} value={player.salary} avg={average(pool.map(item => item.salary))} max={Math.max(...pool.map(item => item.salary))} suffix={" млн"} />
                            <CompareBar label={"Возраст"} value={player.age} avg={average(pool.map(item => item.age))} max={40} />
                        </div>
                    </div>
                </div>

                {/* ---------- Похожие игроки ---------- */}
                {similar.length > 0 && (
                    <div className={"flex flex-col gap-4"}>
                        <div className={"flex flex-row items-end justify-between gap-4"}>
                            <div>
                                <p className={"text-secondary-text font-bold text-sm uppercase tracking-eyebrow"}>{group?.label}</p>
                                <h2 className={"text-4xl font-bold text-text"}>Похожие игроки</h2>
                            </div>
                            <Link to={backLink} className={"hidden sm:inline-flex items-center gap-2 text-text font-bold text-sm uppercase tracking-wide hover:text-secondary-text"}>
                                Все игроки <FiArrowRight />
                            </Link>
                        </div>
                        <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"}>
                            {similar.map(item => (
                                <Link key={item.id} to={`/player/${item.id}`} className={"group flex flex-row items-end overflow-hidden rounded-xl bg-stadium text-text-inverse h-36 hover:shadow-gold transition-shadow"}>
                                    <div className={"flex flex-col flex-1 p-4 self-stretch justify-between"}>
                                        <p className={"text-4xl font-display font-bold text-secondary-light"}>{item.power}</p>
                                        <div>
                                            <p className={"text-primary-200 text-sm"}>{item.lastName}</p>
                                            <p className={"text-2xl font-display font-bold uppercase leading-tight group-hover:text-secondary-light"}>{item.name}</p>
                                            <p className={"text-primary-300 text-xs font-bold uppercase"}>{item.position} · {item.age} лет</p>
                                        </div>
                                    </div>
                                    {item.img_url && <img src={item.imgUrl} alt={item.name} className={"h-full w-28 object-contain object-bottom"} />}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
