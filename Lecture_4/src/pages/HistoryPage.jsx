import { useEffect, useState } from "react";
import { ClubHistory } from "@/components/ClubHistory.jsx";
import { fetchSeasonHistory } from "@/api";

export function HistoryPage({season}) {
    const [seasons, setSeasons] = useState([]);

    // сезон сменился — значит, в истории появилась новая запись
    useEffect(() => {
        let ignore = false;
        fetchSeasonHistory().then(data => {
            if (!ignore) setSeasons(data);
        });
        return () => {
            ignore = true;
        };
    }, [season]);

    return <ClubHistory seasons={seasons}/>
}
