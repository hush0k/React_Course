import { TournamentTable } from "@/components/TournamentTable.jsx";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadPublicData } from "@/store/publicDataSlice.js";

export function CachedPublicData() {
    const dispatch = useDispatch();
    const {data, status} = useSelector(state => state.publicData);

    useEffect(() => {
        dispatch(loadPublicData());
    }, [dispatch]);

    if (status === "idle" || status === "loading") return null;

    if (status === "failed") {
        return (
            <p className={"max-w-md pt-6 text-sm text-primary-200"}>
                Сохранённых данных пока нет. Они появятся после того, как вы откроете игру с интернетом.
            </p>
        );
    }

    return (
        <div className={"flex w-full flex-col gap-5 pt-6"}>
            <div className={"flex flex-col"}>
                <h2 className={"font-display text-3xl font-bold uppercase text-secondary"}>Сохранённые данные</h2>
                <p className={"text-sm text-primary-200"}>Это копия с вашего устройства, она может быть устаревшей.</p>
            </div>

            <TournamentTable standings={data.laliga} />

            <h3 className={"font-display text-2xl font-bold uppercase text-text-inverse"}>Трансферный рынок</h3>
            <div className={"grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"}>
                {data.market.map(player => (
                    <div key={player.id} className={"flex flex-row items-center justify-between gap-3 rounded-lg border border-primary-600 bg-primary-800 p-3"}>
                        <div className={"flex min-w-0 flex-col"}>
                            <p className={"truncate font-bold text-text-inverse"}>{player.name} {player.lastName}</p>
                            <p className={"truncate text-sm text-primary-200"}>{player.position} · {player.nation} · {player.age} лет</p>
                        </div>
                        <div className={"flex shrink-0 flex-col items-end"}>
                            <p className={"font-display text-2xl font-bold text-secondary-light"}>{player.power}</p>
                            <p className={"text-sm text-primary-200"}>€ {player.price} млн</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
