import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiSearch, FiX } from "react-icons/fi";
import { Button } from "@/components/Button.jsx";
import { fetchPlayers } from "@/services/service.js";
import { getBlockReason, getRank, positionGroups } from "@/lib/players.js";

const PAGE_SIZE = 10;
const SEARCH_DELAY = 300; // мс после последнего символа, прежде чем идём на бэк

// params — query-параметры GET /player, фильтрует и сортирует бэк
const filters = [
    {id: "all", label: "Все", params: {}},
    {id: "available", label: "Доступные", params: {affordable: true}},

    {id: "world", label: "Мировой класс", params: {rank: "world_class"}},
    {id: "core", label: "Основа", params: {rank: "starter"}},
    {id: "reserve", label: "Резерв", params: {rank: "reserve"}},

    ...positionGroups.map(group => ({id: group.id, label: group.label, params: {group: group.id}})),
];

const sorts = [
    {id: "power", label: "Сила"},
    {id: "price", label: "Стоимость"},
    {id: "salary", label: "Зарплата"},
    {id: "age", label: "Возраст"},
    {id: "name", label: "Фамилия"},
];

// значения по умолчанию в URL не пишем — ссылка остаётся короткой
const DEFAULTS = {filter: "all", sort: "power", page: 1, q: ""};

// неизвестное значение из URL (опечатка, старая ссылка) заменяем значением по умолчанию
function readOption(value, options, fallback) {
    return options.some(option => option.id === value) ? value : fallback;
}

// копия query-параметров с изменениями; null или значение по умолчанию удаляют ключ
function withParams(prev, changes) {
    const next = new URLSearchParams(prev);
    for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === undefined || value === DEFAULTS[key]) next.delete(key);
        else next.set(key, String(value));
    }
    return next;
}

function getPageNumbers(page, totalPages) {
    // первая, последняя и соседние с текущей, остальное — многоточие
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== "...") {
            pages.push("...");
        }
    }
    return pages;
}

function Pagination({page, totalPages, onChange}) {
    if (totalPages <= 1) return null;

    return (
        <div className={"flex flex-row flex-wrap items-center justify-center gap-2"}>
            <Button size={"icon"} variant={"outline"} disabled={page === 1} onClick={() => onChange(page - 1)} aria-label={"Предыдущая страница"}>
                <FiChevronLeft />
            </Button>
            {getPageNumbers(page, totalPages).map((item, index) => (
                item === "..."
                    ? <span key={`dots-${index}`} className={"px-1 text-text-muted font-bold"}>…</span>
                    : <Button key={item} text={item} size={"icon"} variant={item === page ? "primary" : "outline"} onClick={() => onChange(item)} />
            ))}
            <Button size={"icon"} variant={"outline"} disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label={"Следующая страница"}>
                <FiChevronRight />
            </Button>
        </div>
    );
}

export function Market({players, finances, onBuy}) {
    // фильтр, сортировка, страница и поиск живут в URL: ?q=&filter=&sort=&order=desc&page=
    // так состояние переживает перезагрузку, им можно поделиться ссылкой, а «Назад» возвращает прошлый вид
    const [searchParams, setSearchParams] = useSearchParams();
    const filterId = readOption(searchParams.get("filter"), filters, DEFAULTS.filter);
    const sortId = readOption(searchParams.get("sort"), sorts, DEFAULTS.sort);
    const reversed = searchParams.get("order") === "desc";
    const page = Math.max(1, Number.parseInt(searchParams.get("page"), 10) || 1);
    const search = (searchParams.get("q") ?? "").trim();

    // текст в поле ввода — локальный, в URL он попадает после паузы в наборе
    const [searchText, setSearchText] = useState(search);
    // если q в URL поменялся снаружи (кнопки «Назад»/«Вперёд»), подтягиваем его в поле
    const [syncedSearch, setSyncedSearch] = useState(search);
    if (search !== syncedSearch) {
        setSyncedSearch(search);
        if (searchText.trim() !== search) setSearchText(search);
    }

    function updateParams(changes, options) {
        setSearchParams(prev => withParams(prev, changes), options);
    }

    // запрос уходит не на каждый символ, а когда пользователь перестал печатать;
    // replace — чтобы каждая пауза в наборе не добавляла запись в историю
    useEffect(() => {
        const trimmed = searchText.trim();
        if (trimmed === search) return;
        const timer = setTimeout(() => {
            setSearchParams(prev => withParams(prev, {q: trimmed, page: null}), {replace: true});
        }, SEARCH_DELAY);
        return () => clearTimeout(timer);
    }, [searchText, search, setSearchParams]);

    const columns = ["Игрок", "Клуб", "Поз.", "Возраст", "Ранг", "Сила", "Стоимость", "Зарплата/год", ""];

    const [result, setResult] = useState({key: null, players: [], total: 0, hasNext: false, error: false});
    // счётчик повторов: «Повторить» меняет ключ запроса и эффект запускается снова
    const [retry, setRetry] = useState(0);

    const params = {
        status: "market",
        ...filters.find(filter => filter.id === filterId).params,
        // бэк ищет по имени и фамилии в любом порядке («Педри», «Гонсалес Педри»)
        search: search || undefined,
        sort: sortId,
        reverse: reversed,
        // берём на одного больше, чтобы знать про следующую страницу, даже если заголовок с total не пришёл
        limit: PAGE_SIZE + 1,
        offset: (page - 1) * PAGE_SIZE,
    };
    const requestKey = JSON.stringify(params);
    const loading = result.key !== `${requestKey}#${retry}`;
    const failed = !loading && result.error;

    // players меняется после покупки (App перезагружает данные) — тогда запрашиваем страницу заново
    useEffect(() => {
        let ignore = false;
        fetchPlayers(JSON.parse(requestKey)).then(({players: found, total}) => {
            if (ignore) return;
            const request = JSON.parse(requestKey);
            // после покупки последнего игрока на странице она опустеет — откатываемся назад
            // (или в URL руками вписали слишком большой page)
            if (found.length === 0 && request.offset > 0) {
                const prevPage = Math.max(1, Math.ceil(request.offset / PAGE_SIZE));
                setSearchParams(prev => withParams(prev, {page: prevPage}), {replace: true});
                return;
            }
            setResult({
                key: `${requestKey}#${retry}`,
                players: found.slice(0, PAGE_SIZE),
                total,
                hasNext: found.length > PAGE_SIZE,
                error: false,
            });
        }).catch(() => {
            // бэк недоступен или ответил ошибкой — показываем сообщение вместо вечной «загрузки»
            if (!ignore) setResult({key: `${requestKey}#${retry}`, players: [], total: 0, hasNext: false, error: true});
        });
        return () => {
            ignore = true;
        };
    }, [requestKey, retry, players, setSearchParams]);

    const pagePlayers = result.players;
    const totalPages = result.total !== null
        ? Math.max(1, Math.ceil(result.total / PAGE_SIZE))
        : page + (result.hasNext ? 1 : 0);
    const firstShown = pagePlayers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const lastShown = (page - 1) * PAGE_SIZE + pagePlayers.length;

    // смена фильтра/сортировки всегда возвращает на первую страницу
    const changeFilter = id => updateParams({filter: id, page: null});
    const changeSort = id => updateParams({sort: id, page: null});
    const toggleReversed = () => updateParams({order: reversed ? null : "desc", page: null});
    const changePage = next => updateParams({page: next});

    return (
        <section id={"market"} className={"container flex flex-col space-y-4 py-12 lg:py-20 w-full"}>
            <div className={"flex flex-col space-y-1 uppercase"}>
                <p className={"text-secondary-text font-bold text-base tracking-wide"}>трансферный рынок · {players.length} игроков</p>
                <h2 className={"text-text font-bold text-5xl sm:text-8xl"}>Маркет</h2>
            </div>

            <p className={"text-text-secondary text-sm"}>
                Трансферный бюджет: <b className={"text-text"}>€ {finances.transferBudgetLeft} млн</b> ·
                Свободно: <b className={"text-text"}>€ {finances.availableBudget} млн</b> ·
                Фонд зарплат: <b className={"text-text"}>€ {Math.round(finances.salaryFundUsed * 10) / 10} / {finances.salaryFund} млн</b>
            </p>

            <div className={"flex flex-col space-y-3"}>
                <div className={"flex flex-row flex-wrap items-center gap-2"}>
                    <p className={"text-text-muted text-sm font-bold uppercase tracking-wide w-28"}>Поиск</p>
                    <div className={"relative w-full max-w-md"}>
                        <FiSearch className={"absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"} />
                        <input
                            type={"search"}
                            value={searchText}
                            onChange={event => setSearchText(event.target.value)}
                            maxLength={100}
                            placeholder={"Имя или фамилия игрока"}
                            className={"h-control w-full rounded-md border border-border-strong bg-background-surface pl-9 pr-9 text-text text-base outline-none focus:border-primary focus:shadow-gold [&::-webkit-search-cancel-button]:hidden"}
                        />
                        {searchText && (
                            <button
                                type={"button"}
                                onClick={() => setSearchText("")}
                                aria-label={"Очистить поиск"}
                                className={"absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"}
                            >
                                <FiX />
                            </button>
                        )}
                    </div>
                </div>

                <div className={"flex flex-row flex-wrap items-center gap-2"}>
                    <p className={"text-text-muted text-sm font-bold uppercase tracking-wide w-28"}>Фильтр</p>
                    {filters.map(filter => (
                        <Button
                            key={filter.id}
                            text={filter.label}
                            size={"sm"}
                            variant={filter.id === filterId ? "primary" : "outline"}
                            onClick={() => changeFilter(filter.id)}
                        />
                    ))}
                </div>

                <div className={"flex flex-row flex-wrap items-center gap-2"}>
                    <p className={"text-text-muted text-sm font-bold uppercase tracking-wide w-28"}>Сортировка</p>
                    {sorts.map(sort => (
                        <Button
                            key={sort.id}
                            text={sort.label}
                            size={"sm"}
                            variant={sort.id === sortId ? "primary" : "outline"}
                            onClick={() => changeSort(sort.id)}
                        />
                    ))}
                    <Button
                        text={"Обратный порядок"}
                        size={"sm"}
                        variant={reversed ? "primary" : "outline"}
                        onClick={toggleReversed}
                    />
                </div>

                <p className={"text-text-secondary text-sm"}>
                    Показано: {firstShown}–{lastShown}
                    {result.total !== null && ` из ${result.total}`}
                    {result.total !== null && result.total !== players.length && ` (всего на рынке ${players.length})`}
                    {loading && " · загрузка…"}
                </p>
            </div>

            <div className={`bg-background-surface shadow-card rounded-lg border border-border w-full overflow-x-auto transition-opacity ${loading ? "opacity-50" : ""}`}>
                <table className={"w-full min-w-[960px] text-left"}>
                    <thead className={"bg-background-muted"}>
                        <tr>
                            {columns.map((column) => (
                                <th key={column} className={"text-text-muted text-xs uppercase tracking-wide font-bold px-6 py-4"}>{column}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pagePlayers.map((player) => {
                            const rank = getRank(player.power);
                            const blockReason = getBlockReason(player, finances);

                            return (
                                <tr key={player.id} className={"border-t border-border"}>
                                    <td className={"px-6 py-4"}>
                                        <Link to={`/player/${player.id}`} className={"group flex flex-row items-center space-x-4"}>
                                            <img
                                                src={player.imgUrl}
                                                alt={player.name}
                                                className={"h-12 w-12 shrink-0 rounded-full object-cover object-top bg-background-subtle border border-border"}
                                            />
                                            <div>
                                                <p className={"text-text-muted text-sm"}>{player.lastName}</p>
                                                <p className={"text-text text-lg font-bold font-display uppercase group-hover:text-secondary-text"}>{player.name}</p>
                                                <p className={"text-text-muted text-xs"}>{player.nation}</p>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className={"px-6 py-4"}>
                                        <p className={"text-text text-base font-bold"}>{player.club}</p>
                                        <p className={"text-text-muted text-sm"}>{player.league}</p>
                                    </td>
                                    <td className={"px-6 py-4 text-text text-base font-bold"}>{player.position}</td>
                                    <td className={"px-6 py-4 text-text-secondary text-base"}>{player.age} лет</td>
                                    <td className={"px-6 py-4"}>
                                        <span className={`rounded-md px-2 py-1 text-xs font-bold uppercase whitespace-nowrap ${rank.className}`}>{rank.label}</span>
                                    </td>
                                    <td className={"px-6 py-4"}>
                                        <div className={"flex flex-row items-center space-x-3"}>
                                            <p className={"text-text text-2xl font-bold font-display w-10"}>{player.power}</p>
                                            <div className={"h-2 w-24 bg-background-subtle rounded-full"}>
                                                <div className={"h-full bg-secondary rounded-full"} style={{width: `${player.power}%`}}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={"px-6 py-4 text-text text-lg font-bold whitespace-nowrap"}>{`€ ${player.price} млн`}</td>
                                    <td className={"px-6 py-4 text-text text-lg font-bold whitespace-nowrap"}>{`€ ${player.salary} млн`}</td>
                                    <td className={"px-6 py-4"}>
                                        <div className={"flex flex-col items-end space-y-1"}>
                                            <Button
                                                text={"Купить"}
                                                size={"sm"}
                                                disabled={blockReason !== null}
                                                onClick={() => onBuy(player)}
                                            />
                                            {blockReason && <p className={"text-danger text-xs whitespace-nowrap"}>{blockReason}</p>}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {failed && (
                            <tr>
                                <td colSpan={columns.length} className={"px-6 py-12 text-center"}>
                                    <div className={"flex flex-col items-center gap-3"}>
                                        <p className={"text-danger text-base font-bold"}>Не удалось загрузить игроков рынка. Проверьте соединение и попробуйте ещё раз.</p>
                                        <Button text={"Повторить"} size={"sm"} variant={"outline"} onClick={() => setRetry(r => r + 1)} />
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && !failed && pagePlayers.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className={"px-6 py-12 text-center text-text-muted text-base"}>
                                    {search ? `По запросу «${search}» игроков нет` : "По этому фильтру игроков нет"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={changePage} />
        </section>
    )
}
