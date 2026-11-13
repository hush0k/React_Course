import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAcademy, fetchPlayer, fetchPlayers, fetchSeasonHistory } from "@/services/service.js";

// Ключи кэша. Иерархия позволяет инвалидировать группу: invalidateQueries({queryKey: ["players"]})
export const queryKeys = {
    players: filters => ["players", filters],
    player: id => ["player", String(id)],
    academy: () => ["academy"],
    history: () => ["history"],
};

const MINUTE = 60 * 1000;

export function usePlayersQuery(filters) {
    return useQuery({
        queryKey: queryKeys.players(filters),
        queryFn: ({signal}) => fetchPlayers(filters, signal),
        staleTime: MINUTE,
        placeholderData: keepPreviousData,
    });
}

export function usePlayerQuery(id) {
    return useQuery({
        queryKey: queryKeys.player(id),
        queryFn: ({signal}) => fetchPlayer(id, signal),
        staleTime: MINUTE,
    });
}

export function useAcademyQuery() {
    return useQuery({
        queryKey: queryKeys.academy(),
        queryFn: async () => {
            const academy = await fetchAcademy();
            if (!academy) throw new Error("academy request failed");
            return academy;
        },
        staleTime: 30 * 1000,
    });
}

export function useSeasonHistoryQuery() {
    return useQuery({
        queryKey: queryKeys.history(),
        queryFn: fetchSeasonHistory,
        staleTime: 5 * MINUTE,
    });
}

/** Сбрасывает весь серверный кэш игры после любой мутации (купил/продал, неделя, сезон и т.д.). */
export function useInvalidateGameData() {
    const queryClient = useQueryClient();
    return () => Promise.all(
        ["players", "player", "academy", "history"].map(key => queryClient.invalidateQueries({queryKey: [key]})),
    );
}
