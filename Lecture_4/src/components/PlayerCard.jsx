import { useState } from "react";
import { Button } from "@/components/Button.jsx";

export function PlayerCard({player, onSell, onPromote}) {
    const initialRelationship = player.relationship ?? 50;
    const [relationship, setRelationship] = useState(initialRelationship);

    console.log("render PlayerCard", player.name);

    const nationCodes = {
        "Англия": "ENG",
        "Бельгия": "BEL",
        "Бразилия": "BRA",
        "Германия": "GER",
        "Испания": "ESP",
        "Кот-д'Ивуар": "CIV",
        "Марокко": "MAR",
        "Нидерланды": "NED",
        "Португалия": "POR",
        "Турция": "TUR",
        "Украина": "UKR",
        "Уругвай": "URU",
        "Франция": "FRA",
        "Норвегия": "NOR",
        "Грузия": "GEO",
        "Хорватия": "CRO",
        "Италия": "ITA",
        "Камерун": "CMR",
        "Дания": "DEN",
        "Швейцария": "SUI",
        "ДР Конго": "COD",
    }

    const infoData = [
        {name: "Стоимость", content: `€ ${player.price} млн`},
        {name: "Зарплата/год", content: `€ ${player.salary} млн`},
    ]

    return (
        <div className={"flex flex-col w-72 rounded-2xl border border-border bg-background-muted"}>
            <p className={`text-sm uppercase tracking-widest font-bold px-4 py-1 text-text-inverse rounded-t-2xl  ${
                player.lineUp === "Основной состав" ? "bg-role-starter" : 
                    player.lineUp === "Игрок ротации" ? "bg-role-bench" : 
                        player.lineUp === "Запасной состав" ? "bg-role-rotation" : 
                             "bg-role-depth-border"
            }`}>{player.lineUp}</p>
            <div className={"bg-primary-700 h-80 relative overflow-hidden flex justify-center items-end"}>
                {player.imgUrl ? (
                    <img
                        src={player.imgUrl}
                        alt={`${player.lastName} ${player.name}`}
                        className={"h-[85%] w-auto object-contain object-bottom"}
                    />
                ) : (
                    // У купленных на рынке игроков фото нет - показываем инициалы.
                    <div className={"mb-12 flex items-center justify-center size-40 rounded-full bg-primary-600 border-4 border-primary-500"}>
                        <p className={"text-6xl text-primary-300 font-bold font-display uppercase"}>{player.lastName[0]}{player.name[0]}</p>
                    </div>
                )}

                <div className={"absolute top-4 left-5 flex flex-col items-center"}>
                    <h1 className={"text-7xl text-secondary-light font-bold font-display"}>{player.power}</h1>
                    <p className={"text-2xl text-text-inverse font-bold font-display uppercase"}>{player.position}</p>
                    <p className={"mt-3 bg-background-surface text-text rounded-md px-2 py-0.5 text-sm font-bold"}>{nationCodes[player.nation]}</p>
                </div>

                <h3 className={"absolute top-4 right-5 text-4xl text-primary-400 font-bold font-display"}>#{player.number}</h3>
            </div>

            <div className={"flex flex-col bg-background-surface rounded-b-2xl p-5"}>
                <p className={"text-text-muted text-base"}>{player.lastName}</p>
                <h2 className={"text-5xl text-text font-bold font-display uppercase"}>{player.name}</h2>
                <p className={"text-text-secondary text-base"}>{player.nation} · {player.age} лет</p>

                <div className={"mt-4 flex flex-row space-x-3 w-full"}>
                    {infoData.map((item) => (
                        <div key={item.name} className={"flex flex-col bg-background-muted rounded-lg py-3 px-4 w-full"}>
                            <p className={"text-text-muted text-xs uppercase tracking-wide"}>{item.name}</p>
                            <p className={"text-text text-lg font-bold"}>{item.content}</p>
                        </div>
                    ))}
                </div>

                <div className={"mt-4 flex flex-row items-center justify-between"}>
                    <p className={"text-text-secondary text-sm font-bold"}>Отношение с командой</p>
                    <p className={"text-text text-sm font-bold"}>{relationship}/100</p>
                </div>
                <div className={"mt-2 h-2 w-full bg-background-subtle rounded-full"}>
                    <div className={"h-full bg-secondary rounded-full"} style={{width: `${relationship}%`}}></div>
                </div>

                <div className={"mt-3 flex flex-row space-x-2 w-full"}>
                    <Button text={"+5"} variant={"outline"} size={"sm"} className={"flex-1"} onClick={() => setRelationship(r => Math.min(100, r + 5))}/>
                    <Button text={"−5"} variant={"outline"} size={"sm"} className={"flex-1"} onClick={() => setRelationship(r => Math.max(0, r - 5))}/>
                    <Button text={"Сброс"} variant={"outline"} size={"sm"} className={"flex-1"} onClick={() => setRelationship(initialRelationship)}/>
                </div>

                <div className={"mt-4 flex flex-col space-y-2 w-full"}>
                    <Button text={"Продать"} variant={"danger"} size={"lg"} className={"w-full"} onClick={onSell}/>
                    <Button text={"Изменить статус"} variant={"outline"} size={"lg"} className={"w-full border-primary"} onClick={onPromote}/>
                </div>
            </div>
        </div>
    )
}