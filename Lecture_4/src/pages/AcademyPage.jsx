import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiPlus, FiAlertTriangle } from "react-icons/fi";
import { Button } from "@/components/Button.jsx";
import { cn } from "@/lib/utils";
import { createPlayer, fetchAcademy, promote, setTraining } from "@/api";
import { ACADEMY, getTrainingWeight, nations, positionNames, trainings } from "@/lib/players.js";

const TRAINING_CYCLE = 3;
const DEFAULT_TRAINING = "Умеренная тренировка";

const emptyForm = {
    name: "",
    lastName: "",
    nation: "Испания",
    position: "ЦП",
    number: "",
    salary: "0.5",
    price: "1",
    imgUrl: "players4/newPlayer.jpg",
    training: DEFAULT_TRAINING,
};

const inputClass = "h-control w-full rounded-md border border-border-strong bg-background-surface px-3 text-text text-base outline-none focus:border-primary focus:shadow-gold";
const labelClass = "text-text-muted text-xs font-bold uppercase tracking-wide";

function overLimit(training, currentTraining, academy) {
    if (!academy) return false;
    return getTrainingWeight(training) - getTrainingWeight(currentTraining) + academy.weightUsed > academy.weightLimit;
}

function validate(form, squad, academy) {
    const errors = {};
    const nameRule = /^[\p{L}][\p{L}\s'-]*$/u;

    if (!form.name.trim()) errors.name = "Укажите фамилию";
    else if (!nameRule.test(form.name.trim())) errors.name = "Только буквы, пробел, дефис";
    else if (form.name.trim().length > 50) errors.name = "Не длиннее 50 символов";

    if (!form.lastName.trim()) errors.lastName = "Укажите имя";
    else if (!nameRule.test(form.lastName.trim())) errors.lastName = "Только буквы, пробел, дефис";
    else if (form.lastName.trim().length > 50) errors.lastName = "Не длиннее 50 символов";

    if (form.number !== "") {
        const number = Number(form.number);
        if (!Number.isInteger(number) || number < 1 || number > 99) errors.number = "Номер от 1 до 99";
        else if (squad.some(player => player.number === number)) errors.number = "Номер уже занят";
    }

    const salary = Number(form.salary);
    if (form.salary === "" || Number.isNaN(salary)) errors.salary = "Укажите зарплату";
    else if (salary < 0) errors.salary = "Не может быть меньше 0";
    else if (salary > 50) errors.salary = "Слишком много для воспитанника";

    const price = Number(form.price);
    if (form.price === "" || Number.isNaN(price)) errors.price = "Укажите стоимость";
    else if (price < 0) errors.price = "Не может быть меньше 0";

    if (!form.imgUrl.trim()) errors.imgUrl = "Укажите путь к фото";
    else if (form.imgUrl.length > 255) errors.imgUrl = "Не длиннее 255 символов";

    if (overLimit(form.training, "Без тренировок", academy)) errors.training = "Превышен лимит нагрузки академии";

    return errors;
}

function Initials({player, className}) {
    return (
        <div className={cn("flex items-center justify-center bg-primary text-secondary-light font-display font-bold uppercase", className)}>
            {(player.lastName?.[0] ?? "") + (player.name?.[0] ?? "")}
        </div>
    );
}

function Photo({player, className}) {
    const [broken, setBroken] = useState(false);
    if (!player.imgUrl || broken) return <Initials player={player} className={className} />;
    return <img src={player.imgUrl} alt={player.name} onError={() => setBroken(true)} className={cn("object-cover object-top bg-background-subtle", className)} />;
}

function Field({label, error, hint, children}) {
    return (
        <label className={"flex flex-col gap-1.5"}>
            <span className={labelClass}>{label}</span>
            {children}
            {error
                ? <span className={"text-danger text-xs font-bold"}>{error}</span>
                : hint && <span className={"text-text-muted text-xs"}>{hint}</span>}
        </label>
    );
}

function LoadBar({academy}) {
    const used = academy?.weightUsed ?? 0;
    const limit = academy?.weightLimit ?? 8;
    const percent = Math.min(100, (used / limit) * 100);
    const color = used >= limit ? "bg-danger" : used >= limit - 2 ? "bg-warning" : "bg-secondary";

    return (
        <div className={"bg-primary-800/60 border border-primary-700 rounded-xl p-6 w-full lg:max-w-md"}>
            <div className={"flex flex-row items-end justify-between"}>
                <p className={"text-primary-200 text-xs uppercase tracking-label font-bold"}>Нагрузка академии</p>
                <p className={"font-display font-bold text-4xl"}>
                    {used}<span className={"text-primary-300 text-2xl"}> / {limit}</span>
                </p>
            </div>
            <div className={"mt-3 h-3 w-full bg-primary-900 rounded-full overflow-hidden"}>
                <div className={cn("h-full rounded-full transition-all", color)} style={{width: `${percent}%`}}></div>
            </div>
            <div className={"mt-3 flex flex-row flex-wrap gap-x-4 gap-y-1 text-xs text-primary-200"}>
                {trainings.map(item => (
                    <span key={item.id}><b className={"text-secondary-light"}>{item.weight}</b> · {item.label}</span>
                ))}
            </div>
        </div>
    );
}

function CreateForm({squad, academy, onCreated}) {
    const [form, setForm] = useState(emptyForm);
    const [touched, setTouched] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState(null);
    const [created, setCreated] = useState(null);

    const errors = validate(form, squad, academy);
    const showError = field => (touched[field] || submitted) ? errors[field] : null;
    const preview = {name: form.name || "Фамилия", lastName: form.lastName || "Имя", imgUrl: form.imgUrl ? `${import.meta.env.BASE_URL}${form.imgUrl}` : null};

    function change(field) {
        return event => {
            setForm(prev => ({...prev, [field]: event.target.value}));
            setServerError(null);
        };
    }

    function blur(field) {
        return () => setTouched(prev => ({...prev, [field]: true}));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitted(true);
        if (Object.keys(errors).length > 0) return;

        setSubmitting(true);
        setServerError(null);
        // возраст, силу и потенциал бэк генерирует сам
        const result = await createPlayer({
            name: form.name.trim(),
            last_name: form.lastName.trim(),
            nation: form.nation,
            position: form.position,
            number: form.number === "" ? null : Number(form.number),
            salary: Number(form.salary),
            price: Number(form.price),
            img_url: form.imgUrl.trim(),
            line_up: ACADEMY,
            training: form.training,
            status: "squad",
        });
        setSubmitting(false);

        if (!result.ok) {
            setServerError(result.error);
            return;
        }
        setCreated(result.data);
        setForm(emptyForm);
        setTouched({});
        setSubmitted(false);
        onCreated();
    }

    return (
        <form onSubmit={handleSubmit} noValidate className={"bg-background-surface border border-border rounded-xl shadow-card p-6 lg:p-8 flex flex-col gap-6"}>
            <div className={"flex flex-row items-center justify-between gap-4"}>
                <div>
                    <p className={"text-secondary-text font-bold text-sm uppercase tracking-wide"}>Новый воспитанник</p>
                    <h2 className={"text-3xl md:text-4xl font-bold text-text"}>Зачислить в академию</h2>
                </div>
                <div className={"hidden sm:flex flex-col items-center gap-1"}>
                    <Photo key={form.imgUrl} player={preview} className={"size-20 rounded-full border-2 border-secondary text-2xl"} />
                    <span className={"text-text-muted text-xs"}>превью</span>
                </div>
            </div>

            <div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                <Field label={"Имя"} error={showError("lastName")}>
                    <input className={inputClass} value={form.lastName} onChange={change("lastName")} onBlur={blur("lastName")} placeholder={"Например, Пабло"} />
                </Field>
                <Field label={"Фамилия"} error={showError("name")}>
                    <input className={inputClass} value={form.name} onChange={change("name")} onBlur={blur("name")} placeholder={"Например, Гарсия"} />
                </Field>
                <Field label={"Нация"}>
                    <select className={inputClass} value={form.nation} onChange={change("nation")}>
                        {nations.map(nation => <option key={nation} value={nation}>{nation}</option>)}
                    </select>
                </Field>
                <Field label={"Позиция"}>
                    <select className={inputClass} value={form.position} onChange={change("position")}>
                        {Object.entries(positionNames).map(([code, title]) => <option key={code} value={code}>{code} · {title}</option>)}
                    </select>
                </Field>
                <Field label={"Номер"} error={showError("number")} hint={"Необязательно, 1–99"}>
                    <input className={inputClass} type={"number"} min={1} max={99} value={form.number} onChange={change("number")} onBlur={blur("number")} placeholder={"—"} />
                </Field>
                <Field label={"Тренировка"} error={showError("training")} hint={"Вес занимает лимит нагрузки"}>
                    <select className={inputClass} value={form.training} onChange={change("training")}>
                        {trainings.filter(item => item.weight > 0).map(item => (
                            <option key={item.id} value={item.id} disabled={overLimit(item.id, "Без тренировок", academy)}>
                                {item.label} · вес {item.weight}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field label={"Зарплата / год, € млн"} error={showError("salary")}>
                    <input className={inputClass} type={"number"} step={"0.1"} min={0} value={form.salary} onChange={change("salary")} onBlur={blur("salary")} />
                </Field>
                <Field label={"Стоимость, € млн"} error={showError("price")}>
                    <input className={inputClass} type={"number"} step={"0.1"} min={0} value={form.price} onChange={change("price")} onBlur={blur("price")} />
                </Field>
                <div className={"sm:col-span-2"}>
                    <Field label={"Фото"} error={showError("imgUrl")} hint={"Путь к файлу из public, например players4/…"}>
                        <input className={inputClass} value={form.imgUrl} onChange={change("imgUrl")} onBlur={blur("imgUrl")} />
                    </Field>
                </div>
            </div>

            <p className={"text-text-muted text-sm"}>
                Возраст, силу и потенциал определит академия — они станут известны после зачисления.
            </p>

            {serverError && (
                <div className={"flex flex-row items-start gap-2 rounded-md border border-danger bg-danger/10 p-3 text-danger text-sm font-bold"}>
                    <FiAlertTriangle className={"mt-0.5 shrink-0"} /> {serverError}
                </div>
            )}

            {created && (
                <div className={"flex flex-row items-center gap-4 rounded-lg border border-success bg-success/10 p-4"}>
                    <FiCheckCircle className={"text-success text-2xl shrink-0"} />
                    <div className={"flex-1"}>
                        <p className={"text-text font-bold"}>{created.lastName} {created.name} зачислен в академию</p>
                        <p className={"text-text-secondary text-sm"}>
                            {created.age} лет · сила <b className={"text-text"}>{created.power}</b>
                        </p>
                    </div>
                    <Link to={`/player/${created.id}`} className={"text-primary text-sm font-bold uppercase hover:text-secondary-text"}>Профиль</Link>
                </div>
            )}

            <Button type={"submit"} size={"lg"} variant={"secondary"} disabled={submitting} icon={<FiPlus />}
                    text={submitting ? "Зачисляем…" : "Зачислить"} />
        </form>
    );
}

function YouthRow({player, academy, onChanged}) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const progress = Math.min(100, player.training_progress ?? 0);
    const week = Math.min(TRAINING_CYCLE, (player.training_weeks ?? 0) + 1);

    async function run(action) {
        setBusy(true);
        setError(null);
        const result = await action();
        setBusy(false);
        if (!result.ok) setError(result.error);
        else onChanged();
    }

    return (
        <li className={"bg-background-surface border border-border rounded-xl shadow-card p-5 flex flex-col gap-4"}>
            <div className={"flex flex-row items-center gap-4"}>
                <Photo player={player} className={"size-16 shrink-0 rounded-full border border-border text-xl"} />
                <div className={"flex-1 min-w-0"}>
                    <div className={"flex flex-row items-center gap-2"}>
                        <span className={"rounded-md px-2 py-0.5 text-[10px] font-bold uppercase bg-success text-text-inverse"}>Академия</span>
                        <span className={"text-text-muted text-xs font-bold"}>{player.position} · {player.age} лет</span>
                    </div>
                    <Link to={`/player/${player.id}`} className={"block truncate"}>
                        <span className={"text-text-muted text-sm"}>{player.lastName} </span>
                        <span className={"text-text text-xl font-bold font-display uppercase hover:text-secondary-text"}>{player.name}</span>
                    </Link>
                </div>
                <div className={"text-right"}>
                    <p className={"font-display font-bold text-3xl text-text leading-none"}>{player.power}</p>
                </div>
            </div>

            <div className={"grid grid-cols-1 sm:grid-cols-2 gap-4 items-end"}>
                <label className={"flex flex-col gap-1.5"}>
                    <span className={labelClass}>Тренировка</span>
                    <select className={inputClass} value={player.training ?? "Без тренировок"} disabled={busy}
                            onChange={event => run(() => setTraining(player.id, event.target.value))}>
                        {trainings.map(item => (
                            <option key={item.id} value={item.id} disabled={overLimit(item.id, player.training, academy)}>
                                {item.label} · вес {item.weight}
                            </option>
                        ))}
                    </select>
                </label>
                <div className={"flex flex-col gap-1.5"}>
                    <div className={"flex flex-row justify-between text-xs font-bold"}>
                        <span className={"text-text-muted uppercase tracking-wide"}>неделя {week} из {TRAINING_CYCLE}</span>
                        <span className={"text-text"}>{progress}%</span>
                    </div>
                    <div className={"h-2.5 w-full bg-background-subtle rounded-full overflow-hidden flex flex-row"}>
                        <div className={"h-full bg-success transition-all"} style={{width: `${progress}%`}}></div>
                    </div>
                    <div className={"flex flex-row gap-1"}>
                        {Array.from({length: TRAINING_CYCLE}, (_, index) => (
                            <span key={index} className={cn("h-1 flex-1 rounded-full", index < (player.training_weeks ?? 0) ? "bg-success" : "bg-background-subtle")}></span>
                        ))}
                    </div>
                </div>
            </div>

            {error && <p className={"text-danger text-sm font-bold"}>{error}</p>}

            <Button text={"Перевести в основу"} variant={"outline"} size={"sm"} disabled={busy}
                    onClick={() => run(() => promote(player.id))} />
        </li>
    );
}

export function AcademyPage({squad, version, onChange}) {
    const [refresh, setRefresh] = useState(0);
    const [result, setResult] = useState({key: null, academy: null});
    const requestKey = `${version}-${refresh}`;
    const loading = result.key !== requestKey;
    const academy = result.academy;

    useEffect(() => {
        let ignore = false;
        fetchAcademy()
            .then(data => {
                if (!ignore) setResult({key: requestKey, academy: data});
            })
            .catch(() => {
                // сеть упала — academy останется null и покажется сообщение об ошибке
                if (!ignore) setResult({key: requestKey, academy: null});
            });
        return () => {
            ignore = true;
        };
    }, [requestKey]);

    // после любого изменения перечитываем и академию, и общие данные клуба
    function handleChanged() {
        setRefresh(r => r + 1);
        onChange();
    }

    const players = academy?.players ?? [];
    const best = players.reduce((max, player) => Math.max(max, player.power ?? 0), 0);

    return (
        <div className={"flex flex-col w-full"}>
            <section className={"relative overflow-hidden bg-primary text-text-inverse"}>
                <div className={"absolute -right-24 -top-24 size-[480px] rounded-full bg-success/20 blur-3xl"}></div>
                <div className={"container relative flex flex-col lg:flex-row lg:items-end justify-between gap-8 py-12 lg:py-20"}>
                    <div className={"flex flex-col gap-3 uppercase"}>
                        <p className={"text-secondary-light font-bold text-sm tracking-widest"}>Молодёжная академия · La Fábrica</p>
                        <h1 className={"font-display font-bold text-6xl md:text-8xl tracking-tight-display"}>Академия</h1>
                        <div className={"h-1.5 w-24 bg-secondary rounded-full"}></div>
                        <div className={"mt-4 flex flex-row gap-8 normal-case"}>
                            <div>
                                <p className={"text-primary-300 text-xs uppercase tracking-label font-bold"}>Воспитанников</p>
                                <p className={"font-display font-bold text-3xl"}>{players.length}</p>
                            </div>
                            <div>
                                <p className={"text-primary-300 text-xs uppercase tracking-label font-bold"}>Лучшая сила</p>
                                <p className={"font-display font-bold text-3xl text-secondary-light"}>{best || "—"}</p>
                            </div>
                        </div>
                    </div>
                    <LoadBar academy={academy} />
                </div>
            </section>

            <section className={"container w-full py-10 lg:py-14 grid grid-cols-1 xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-8 items-start"}>
                <CreateForm squad={squad} academy={academy} onCreated={handleChanged} />

                <div className={cn("flex flex-col gap-4 transition-opacity", loading && "opacity-60")}>
                    <div className={"flex flex-row items-end justify-between"}>
                        <div>
                            <p className={"text-secondary-text font-bold text-sm uppercase tracking-wide"}>Тренировки идут каждый тур · цикл {TRAINING_CYCLE} недели</p>
                            <h2 className={"text-3xl md:text-4xl font-bold text-text"}>Воспитанники</h2>
                        </div>
                        {loading && <span className={"text-text-muted text-sm"}>загрузка…</span>}
                    </div>

                    {!loading && academy === null && (
                        <div className={"flex flex-col items-start gap-3 rounded-lg border border-warning bg-warning/10 p-4"}>
                            <p className={"text-text text-sm"}>Не удалось загрузить академию. Проверьте соединение и попробуйте ещё раз.</p>
                            <Button text={"Повторить"} variant={"outline"} size={"sm"} onClick={() => setRefresh(r => r + 1)} />
                        </div>
                    )}

                    {academy && players.length === 0 && (
                        <div className={"rounded-xl border-2 border-dashed border-border p-10 text-center text-text-muted"}>
                            В академии пока никого нет — зачислите первого воспитанника.
                        </div>
                    )}

                    <ul className={"flex flex-col gap-4"}>
                        {players.map(player => (
                            <YouthRow key={player.id} player={player} academy={academy} onChanged={handleChanged} />
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
}
