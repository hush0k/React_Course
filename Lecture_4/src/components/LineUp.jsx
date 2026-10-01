import { useState } from "react";
import { PlayerCard } from "@/components/PlayerCard.jsx";
import { Button } from "@/components/Button.jsx";

// ---------------------------------------------------------------------------
// СОРТИРОВКА ПО УМОЛЧАНИЮ
// ---------------------------------------------------------------------------
// Чтобы сортировать по статусу и позиции, нам нужно знать, КАКОЙ статус/позиция
// "важнее". Строки сами по себе сравниваются по алфавиту, а нам нужен свой порядок.
// Поэтому заводим массивы-"рейтинги": чем меньше индекс элемента в массиве,
// тем выше игрок окажется в списке.

// Статусы: сначала основа, потом ротация, запасные и в конце глубина состава.
const statusPriority = ["Основной состав", "Игрок ротации", "Запасной состав", "Глубина состава"];

// Позиции: как на поле — от вратаря к нападающему.
// ВР - вратарь, ПЗ/ЦЗ/ЛЗ - защитники, ОП/ЦП/АП - полузащитники,
// ПВ/ЛВ - вингеры, ФР - форвард.
const positionPriority = ["ВР", "ПЗ", "ЦЗ", "ЛЗ", "ОП", "ЦП", "АП", "ПВ", "ЛВ", "ФР"];

// ---------------------------------------------------------------------------
// ВАРИАНТЫ ФИЛЬТРАЦИИ
// ---------------------------------------------------------------------------
// Каждый фильтр - объект:
//   id    - уникальный ключ (храним его в state, чтобы знать, какой фильтр выбран)
//   label - текст на кнопке
//   test  - функция, которая получает игрока и возвращает true, если игрок
//           ПОДХОДИТ под фильтр (его надо показать), и false - если нет.
// Такой подход удобен: чтобы добавить новый фильтр, достаточно дописать объект
// в массив - ни JSX, ни логику менять не нужно.
const filters = [
    // "Все" - фильтра нет, пропускаем всех. Это значение по умолчанию.
    {id: "all", label: "Все", test: () => true},

    // Фильтры по статусу в составе
    {id: "starter", label: "Основной", test: player => player.lineUp === "Основной состав"},
    {id: "rotation", label: "Ротация", test: player => player.lineUp === "Игрок ротации"},
    {id: "bench", label: "Запасные", test: player => player.lineUp === "Запасной состав"},
    {id: "depth", label: "Глубина", test: player => player.lineUp === "Глубина состава"},

    // Фильтры по линиям на поле. includes() проверяет, есть ли позиция игрока в списке.
    {id: "gk", label: "Вратари", test: player => player.position === "ВР"},
    {id: "def", label: "Защита", test: player => ["ПЗ", "ЦЗ", "ЛЗ"].includes(player.position)},
    {id: "mid", label: "Полузащита", test: player => ["ОП", "ЦП", "АП"].includes(player.position)},
    {id: "att", label: "Атака", test: player => ["ПВ", "ЛВ", "ФР"].includes(player.position)},
];

// ---------------------------------------------------------------------------
// ВАРИАНТЫ СОРТИРОВКИ
// ---------------------------------------------------------------------------
// compare - функция-компаратор для Array.prototype.sort(a, b).
// Правило sort: если compare вернул
//   < 0  → a ставится раньше b
//   > 0  → b ставится раньше a
//   0    → порядок не важен (считаются равными)
// Поэтому "b.power - a.power" = сортировка по убыванию (сильные выше),
// а "a.age - b.age" = по возрастанию (молодые выше).
const sorts = [
    {
        id: "default",
        label: "По умолчанию",
        compare: (a, b) => {
            // 1) Сначала сравниваем статусы по их индексу в statusPriority.
            //    Если статусы разные - разница индексов не 0, и сразу возвращаем её.
            const byStatus = statusPriority.indexOf(a.lineUp) - statusPriority.indexOf(b.lineUp);
            if (byStatus !== 0) return byStatus;

            // 2) Статус одинаковый → сравниваем позиции.
            const byPosition = positionPriority.indexOf(a.position) - positionPriority.indexOf(b.position);
            if (byPosition !== 0) return byPosition;

            // 3) И статус, и позиция одинаковые → сильнейший идёт первым.
            return b.power - a.power;
        },
    },
    {id: "power", label: "Сила", compare: (a, b) => b.power - a.power},
    {id: "price", label: "Стоимость", compare: (a, b) => b.price - a.price},
    {id: "salary", label: "Зарплата", compare: (a, b) => b.salary - a.salary},
    {id: "age", label: "Возраст", compare: (a, b) => a.age - b.age},
    {id: "number", label: "Номер", compare: (a, b) => a.number - b.number},
];

// ---------------------------------------------------------------------------
// КОМПОНЕНТ
// ---------------------------------------------------------------------------
// Раньше squad (список игроков) хранился прямо здесь, в LineUp. Теперь он живёт
// в App (это называется "поднятие состояния", lifting state up), потому что
// он нужен не только LineUp, но и App: для проверки "в основе ровно 11 игроков"
// перед переходом к следующей неделе.
//
// Поэтому LineUp теперь получает всё через пропсы:
//   squad     - текущий список игроков (только читаем, сами не меняем!)
//   onSell    - функция из App: продать игрока по имени
//   onPromote - функция из App: сменить игроку статус по имени
// Когда пользователь жмёт кнопку, LineUp лишь "сообщает" App, что случилось,
// вызывая эти функции. App меняет свой state → перерисовывается → передаёт
// сюда новый squad → LineUp перерисовывается с обновлёнными данными.
export function LineUp({squad, onSell, onPromote}) {
    // А вот фильтр и сортировка остаются ЛОКАЛЬНЫМ состоянием LineUp:
    // они влияют только на то, как этот компонент показывает список,
    // и больше никому в приложении не нужны. Правило: держим state
    // как можно ниже, но настолько высоко, чтобы до него дотянулись все, кому он нужен.
    //
    // В state храним только id выбранного фильтра и сортировки (а не отфильтрованный массив!).
    // По умолчанию: фильтра нет ("all"), сортировка - "default" (статус → позиция → сила).
    const [filterId, setFilterId] = useState("all");
    const [sortId, setSortId] = useState("default");
    const [reversed, setReversed] = useState(false);
    const [resetKey, setResetKey] = useState(0);


    const activeFilter = filters.find(filter => filter.id === filterId);
    const activeSort = sorts.find(sort => sort.id === sortId);

    const sortedSquad = squad
        .filter(activeFilter.test)
        .sort(activeSort.compare);
    const visibleSquad = reversed ? sortedSquad.reverse() : sortedSquad;

    console.log("render LineUp");

    return(
        <section id={"line_up"} className={"flex flex-col space-y-4 p-20"}>
            <div className={"flex flex-col space-y-1 uppercase"}>
                <p className={"text-secondary-text font-bold text-base tracking-wide"}>первая команда · {squad.length} игрока</p>
                <h2 className={"text-text font-bold text-8xl"}>Состав</h2>
            </div>

            <div className={"flex flex-col space-y-3"}>
                <div className={"flex flex-row flex-wrap items-center gap-2"}>
                    <p className={"text-text-muted text-sm font-bold uppercase tracking-wide w-28"}>Фильтр</p>
                    {filters.map(filter => (
                        <Button
                            key={filter.id}
                            text={filter.label}
                            size={"sm"}
                            variant={filter.id === filterId ? "primary" : "outline"}
                            onClick={() => setFilterId(filter.id)}
                        />
                    ))}
                </div>

                <div className={"flex flex-row flex-wrap items-center gap-2"}>
                    <p className={"text-text-muted text-sm font-bold uppercase tracking-wide w-28"}>Сортировка</p>
                    {/* То же самое для сортировок */}
                    {sorts.map(sort => (
                        <Button
                            key={sort.id}
                            text={sort.label}
                            size={"sm"}
                            variant={sort.id === sortId ? "primary" : "outline"}
                            onClick={() => setSortId(sort.id)}
                        />
                    ))}
                    <Button
                        text={"Обратный порядок"}
                        size={"sm"}
                        variant={reversed ? "primary" : "outline"}
                        onClick={() => setReversed(r => !r)}
                    />
                </div>

                <div className={"flex flex-row items-center gap-4"}>
                    <p className={"text-text-secondary text-sm"}>Показано: {visibleSquad.length} из {squad.length}</p>
                    <Button text={"Сбросить отношения"} size={"sm"} variant={"outline"} onClick={() => setResetKey(k => k + 1)}/>
                </div>
            </div>

            <div className={"flex flex-row flex-wrap gap-11"}>
                {visibleSquad.map(player => (
                    <PlayerCard
                        key={`${player.name}-${resetKey}`}
                        player={player}
                        onSell={() => onSell(player.name)}
                        onPromote={() => onPromote(player.name)}
                    />
                ))}
            </div>
        </section>
    )
}
