import { cn } from "@/lib/utils.js";

const variants = {
    leagueOfChampions: {
        active: "bg-gradient-to-br from-[#0a1a5c] via-[#001489] to-[#050b2e] border-[#2b3fa8] text-white shadow-[0_6px_24px_rgba(0,20,137,0.35)]",
        logo: "ring-2 ring-[#00d4ff]/60",
    },
    laLiga: {
        active: "bg-[#ff4b44] border-[#ff4b44] text-white shadow-[0_6px_24px_rgba(255,75,68,0.35)]",
        logo: "ring-2 ring-white/60",
    },
};
// плей-офф оформлен так же, как Лига Чемпионов
variants.championsPlayoff = variants.leagueOfChampions;

const tournaments = [
    {id: "laLiga", label: "Ла Лига", logo: "spain_la-liga.football-logos.cc.svg"},
    {id: "leagueOfChampions", label: "Лига Чемпионов", logo: "tournaments_uefa-champions-league.football-logos.cc.svg"},
    {id: "championsPlayoff", label: "Плей-офф ЛЧ", logo: "tournaments_uefa-champions-league.football-logos.cc.svg"},
];

export function TournamentSwitch({value, onChange}) {
    return (
        <div className={"inline-flex self-start p-1.5 gap-1.5 rounded-xl bg-background-muted border border-border"}>
            {tournaments.map(tournament => {
                const isActive = tournament.id === value;
                const v = variants[tournament.id];

                return (
                    <button
                        key={tournament.id}
                        type={"button"}
                        onClick={() => onChange(tournament.id)}
                        className={cn(
                            "flex items-center gap-3 px-5 py-3 rounded-lg border cursor-pointer",
                            "font-bold uppercase tracking-wide text-sm transition-all duration-200",
                            isActive
                                ? v.active
                                : "border-transparent text-text-muted hover:bg-background-surface hover:text-text",
                        )}
                    >
                        {/* белая подложка только у выбранного, чтобы тёмный логотип ЛЧ было видно на синем фоне */}
                        <span
                            className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200",
                                isActive ? cn("bg-white", v.logo) : "bg-transparent",
                            )}
                        >
                            <img
                                src={`${import.meta.env.BASE_URL}${tournament.logo}`}
                                alt={tournament.label}
                                className={cn(
                                    "w-7 h-7 object-contain transition-all duration-200",
                                    !isActive && "grayscale opacity-60",
                                )}
                            />
                        </span>
                        {tournament.label}
                    </button>
                );
            })}
        </div>
    )
}
