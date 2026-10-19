// Общие справочники и расчёты по игрокам: используются в маркете и на странице игрока

export const positionNames = {
    "ВР": "Вратарь",
    "ПЗ": "Правый защитник",
    "ЦЗ": "Центральный защитник",
    "ЛЗ": "Левый защитник",
    "ОП": "Опорный полузащитник",
    "ЦП": "Центральный полузащитник",
    "АП": "Атакующий полузащитник",
    "ПВ": "Правый вингер",
    "ЛВ": "Левый вингер",
    "ФР": "Форвард",
};

export const positionGroups = [
    {id: "gk", label: "Вратари", positions: ["ВР"]},
    {id: "def", label: "Защита", positions: ["ПЗ", "ЦЗ", "ЛЗ"]},
    {id: "mid", label: "Полузащита", positions: ["ОП", "ЦП", "АП"]},
    {id: "att", label: "Атака", positions: ["ПВ", "ЛВ", "ФР"]},
];

export function getPositionGroup(position) {
    return positionGroups.find(group => group.positions.includes(position));
}

// коды для flagcdn.com
const nationFlags = {
    "Австрия": "at",
    "Алжир": "dz",
    "Англия": "gb-eng",
    "Аргентина": "ar",
    "Бельгия": "be",
    "Болгария": "bg",
    "Бразилия": "br",
    "Венгрия": "hu",
    "Германия": "de",
    "Грузия": "ge",
    "Дания": "dk",
    "ДР Конго": "cd",
    "Испания": "es",
    "Италия": "it",
    "Казахстан": "kz",
    "Камерун": "cm",
    "Колумбия": "co",
    "Кот-д'Ивуар": "ci",
    "Марокко": "ma",
    "Нидерланды": "nl",
    "Норвегия": "no",
    "Португалия": "pt",
    "США": "us",
    "Северная Ирландия": "gb-nir",
    "Сербия": "rs",
    "Словения": "si",
    "Турция": "tr",
    "Узбекистан": "uz",
    "Украина": "ua",
    "Уругвай": "uy",
    "Франция": "fr",
    "Хорватия": "hr",
    "Швейцария": "ch",
    "Швеция": "se",
    "Шотландия": "gb-sct",
    "Южная Корея": "kr",
    "Япония": "jp",
};

// трёхбуквенные коды сборных (как в FIFA) для карточки игрока
const nationCodes = {
    "Австрия": "AUT",
    "Алжир": "ALG",
    "Англия": "ENG",
    "Аргентина": "ARG",
    "Бельгия": "BEL",
    "Болгария": "BUL",
    "Бразилия": "BRA",
    "Венгрия": "HUN",
    "Германия": "GER",
    "Грузия": "GEO",
    "Дания": "DEN",
    "ДР Конго": "COD",
    "Испания": "ESP",
    "Италия": "ITA",
    "Казахстан": "KAZ",
    "Камерун": "CMR",
    "Колумбия": "COL",
    "Кот-д'Ивуар": "CIV",
    "Марокко": "MAR",
    "Нидерланды": "NED",
    "Норвегия": "NOR",
    "Португалия": "POR",
    "США": "USA",
    "Северная Ирландия": "NIR",
    "Сербия": "SRB",
    "Словения": "SVN",
    "Турция": "TUR",
    "Узбекистан": "UZB",
    "Украина": "UKR",
    "Уругвай": "URU",
    "Франция": "FRA",
    "Хорватия": "CRO",
    "Швейцария": "SUI",
    "Швеция": "SWE",
    "Шотландия": "SCO",
    "Южная Корея": "KOR",
    "Япония": "JPN",
};

export const nations = Object.keys(nationFlags);

export const lineUps = ["Основной состав", "Игрок ротации", "Запасной состав", "Глубина состава", "Воспитанник"];

export const ACADEMY = "Воспитанник";

// вес тренировки — сколько она занимает из лимита нагрузки академии
export const trainings = [
    {id: "Без тренировок", label: "Без тренировок", weight: 0},
    {id: "Умеренная тренировка", label: "Умеренная", weight: 1},
    {id: "Обычная тренировка", label: "Обычная", weight: 2},
    {id: "Интенсивная тренировка", label: "Интенсивная", weight: 3},
];

export function getTrainingWeight(training) {
    return trainings.find(item => item.id === training)?.weight ?? 0;
}

export function isAcademy(player) {
    return player.lineUp === ACADEMY;
}

export function getFlagUrl(nation) {
    const code = nationFlags[nation];
    return code ? `https://flagcdn.com/${code}.svg` : null;
}

// если страны нет в справочнике — первые три буквы названия
export function getNationCode(nation) {
    if (!nation) return "";
    return nationCodes[nation] ?? nation.slice(0, 3).toUpperCase();
}

export function getRank(power) {
    if (power >= 88) return {label: "Мировой класс", className: "bg-secondary text-primary"};
    if (power >= 80) return {label: "Основа", className: "bg-role-bench text-text-inverse"};
    return {label: "Резерв", className: "bg-background-subtle text-text-secondary"};
}

export function getBlockReason(player, finances) {
    if (finances.transferBudgetLeft < player.price) return "Мало трансферного бюджета";
    if (finances.salaryFundUsed + player.salary > finances.salaryFund) return "Превышен фонд зарплат";
    if (finances.availableBudget < player.price + player.salary) return "Мало свободных средств";
    return null;
}

export function average(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}
