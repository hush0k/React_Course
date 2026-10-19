import { FaBolt, FaFontAwesomeFlag } from "react-icons/fa";
import { FaCity } from "react-icons/fa";
import { MdStadium } from "react-icons/md";
import { IoMdPerson } from "react-icons/io";

// реальные титулы клуба до старта игры
const BASE_CHAMPIONS_LEAGUE_TITLES = 15;
const BASE_LALIGA_TITLES = 36;

export function ClubBlock({annualBudget, availableBudget, transferBudgetLeft, transferBudget, salaryFund, salaryFundUsed, fans, fansGrowth, reputation, fanPenalty, power, trophies, position}) {
    const achievements = [
        {number: BASE_CHAMPIONS_LEAGUE_TITLES + trophies.championsLeague, content: "Лиг Чемпионов", gold: true},
        {number: BASE_LALIGA_TITLES + trophies.laliga, content: "титулов Ла Лиги", gold: false},
        {number: position ? `${position}-е` : "—", content: "Место в таблице", gold: false},
    ]

    const passportData = [
        {icon: <FaFontAwesomeFlag size={20} color="#e9c95a"/>, name: "Страна", content: "Испания"},
        {icon: <FaCity size={20} color="#e9c95a"/>, name: "Город", content: "Мадрид, Чамартин"},
        {icon: <MdStadium size={20} color="#e9c95a"/>, name: "Стадион", content: "Сантьяго Бернабеу"},
        {icon: <IoMdPerson size={20} color="#e9c95a"/>, name: "Президент", content: "Флорентино Перес"},
    ]

    const supportData = [
        {name: "Соцсети", content: "480 млн"},
        {name: "Сосьос", content: "~ 100 тыс."},
    ]

    const fundUsedPercent = Math.round(salaryFundUsed / salaryFund * 100 * 10) / 10;

    const annualBudgetText = annualBudget >= 1000
        ? `${String(Math.round(annualBudget / 100) / 10).replace(".", ",")} млрд`
        : `${Math.round(annualBudget)} млн`;

    const fansGrowthRounded = Math.round(fansGrowth * 10) / 10;
    const fansGrowthColor = fansGrowthRounded > 0
        ? "text-green-300"
        : fansGrowthRounded < 0
            ? "text-red-400"
            : "text-text-inverse-muted";

    return (
        <section id={"club"} className={"bg-primary flex flex-col w-full scroll-mt-20 px-4 py-12 md:p-12 lg:p-20 space-y-10"}>
            <div className={"flex flex-col xl:flex-row xl:items-end justify-between gap-8"}>
                <div className={"flex flex-col space-y-4"}>
                    <p className={"uppercase text-secondary-light font-bold text-base tracking-widest"}>профиль клуба</p>
                    <div>
                        <h1 className={"text-text-inverse text-6xl md:text-8xl lg:text-hero font-bold"}>real madrid cf</h1>
                        <p className={"text-text-inverse-muted text-base m-0 pt-1"}>Основан в 1902 · Ла Лига · "Сливочные"</p>
                    </div>
                </div>

                <div className={"flex flex-row flex-wrap items-end gap-6 md:gap-10"}>
                    {/* сила считается на бэкенде по основному составу */}
                    <div className={"flex flex-col space-y-1 items-end justify-end bg-primary-800 rounded-lg px-6 py-4 border border-secondary/30"}>
                        <div className={"flex flex-row items-center space-x-3"}>
                            <FaBolt size={36} className={"text-secondary"}/>
                            <h3 className={"text-5xl md:text-8xl font-semibold text-text-inverse"}>{power === null ? "—" : Math.round(power)}</h3>
                        </div>
                        <p className={"text-sm text-text-inverse-muted"}>Сила клуба</p>
                    </div>

                    <div className={"flex flex-row flex-wrap gap-6"}>
                        {achievements.map((item) => (
                            <div key={item.content} className={"flex flex-col space-y-1 items-end justify-end"}>
                                <h3 className={`text-5xl md:text-8xl font-semibold ${item.gold ? "text-secondary" : "text-text-inverse"}`}>{item.number}</h3>
                                <p className={"text-sm text-text-inverse-muted"}>{item.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"}>
                <div className={"flex flex-col space-y-6 min-h-[21rem] w-full bg-primary-800 rounded-lg p-5"}>
                    <h4 className={"uppercase text-secondary-light tracking-widest text-sm font-bold"}>Паспорт клуба</h4>
                    {passportData.map((item) => (
                        <div key={item.name} className={"flex flex-row space-x-2 items-center justify-start"}>
                            <div className={"bg-primary-700 rounded-full p-3"}>
                                {item.icon}
                            </div>
                            <div className={"flex flex-col items-start justify-start"}>
                                <p className={"text-sm text-text-inverse-muted"}>{item.name}</p>
                                <p className={"text-text-inverse font-bold"}>{item.content}</p>
                            </div>
                        </div>
                    ))}

                </div>

                <div className={"flex flex-col min-h-[21rem] w-full bg-primary-800 rounded-lg p-5"}>
                    <h4 className={"uppercase text-secondary-light tracking-widest text-sm font-bold"}>финансы</h4>
                    <div className={"mt-5"}>
                        <p className={"text-text-inverse-muted text-sm"}>Годовой бюджет</p>
                        <h1 className={"text-5xl md:text-7xl 2xl:text-8xl text-text-inverse font-bold font-display break-words"}>€ {annualBudgetText}</h1>
                        <p className={"text-sm font-bold text-green-300"}>Доступно € {availableBudget} млн</p>
                    </div>

                    <div className={"mt-8 flex flex-row items-center justify-between bg-primary-700 rounded-lg py-3 px-5 w-full"}>
                        <p className={"text-text-inverse-muted text-sm"}>Трансферный бюджет <br/>Осталось € {transferBudgetLeft} млн</p>
                        <p className={"text-text-inverse font-bold "}>€ {transferBudget} млн</p>
                    </div>

                    <div className={"mt-3 flex flex-row items-center justify-between bg-primary-700 rounded-lg py-3 px-5 w-full"}>
                        <p className={"text-text-inverse-muted text-sm"}>Зарплатный фонд <br/>Использовано € {Math.round(salaryFundUsed * 10) / 10} млн ({fundUsedPercent}%)</p>
                        <p className={"text-text-inverse font-bold "}>€ {salaryFund} млн/год</p>
                    </div>

                    {fanPenalty > 0 && (
                        <p className={"mt-2 text-sm font-bold text-red-400"}>Отток фанатов: −€ {fanPenalty} млн к зарплатному и трансферному лимиту</p>
                    )}
                </div>

                <div className={"flex flex-col min-h-[21rem] w-full bg-primary-800 rounded-lg p-5"}>
                    <h4 className={"uppercase text-secondary-light tracking-widest text-sm font-bold"}>поддержка</h4>
                    <div className={"mt-5"}>
                        <p className={"text-text-inverse-muted text-sm"}>Фанаты по всему миру</p>
                        <h1 className={"text-5xl md:text-7xl 2xl:text-8xl text-text-inverse font-bold font-display break-words"}>{Math.round(fans * 10) / 10} млн</h1>
                        {/* Цвет и плюс считаем по уже округлённому числу, чтобы -0.04 → 0 был серым */}
                        <p className={`text-sm font-bold ${fansGrowthColor}`}>
                            {fansGrowthRounded > 0 ? "+" : ""}{fansGrowthRounded} млн за неделю
                        </p>
                    </div>

                    <div className={"mt-5 flex flex-row space-x-3 w-full"}>
                        {supportData.map((item) => (
                            <div key={item.name} className={"flex flex-col bg-primary-700 rounded-lg py-3 px-5 w-full"}>
                                <p className={"text-text-inverse-muted text-sm"}>{item.name}</p>
                                <p className={"text-text-inverse font-bold"}>{item.content}</p>
                            </div>
                        ))}
                    </div>

                    <div className={"mt-3 flex flex-row items-center justify-between bg-primary-700 rounded-lg py-3 px-5 w-full"}>
                        <p className={"text-text-inverse-muted text-sm"}>Репутация клуба <br/>Мировая</p>
                        <p className={"text-text-inverse font-bold "}>{reputation} / 100</p>
                    </div>
                </div>
            </div>
        </section>
    )
}