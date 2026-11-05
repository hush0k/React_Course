import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header.jsx";
import { SeasonResult } from "@/components/SeasonResult.jsx";
import { ConfirmDialog } from "@/components/ConfirmDialog.jsx";
import { ErrorDialog } from "@/components/ErrorDialog.jsx";
import { Button } from "@/components/Button.jsx";
import { useGame } from "@/hooks/useGame.js";

function PageFallback() {
    return (
        <div className={"flex flex-col items-center justify-center w-full py-24 space-y-4"}>
            <div className={"size-12 rounded-full border-4 border-background-subtle border-t-secondary animate-spin"}></div>
            <p className={"text-text-secondary font-bold uppercase tracking-wide"}>Загрузка страницы...</p>
        </div>
    );
}

export function RootLayout() {
    const game = useGame();

    if (game.loadError) {
        return (
            <div className={"flex flex-col items-center justify-center w-full min-h-screen space-y-4 p-4 text-center"}>
                <h1 className={"text-text font-bold font-display text-4xl uppercase"}>Ошибка загрузки</h1>
                <p className={"text-text-secondary max-w-md"}>{game.loadError}</p>
                <Button text={"Повторить"} variant={"primary"} onClick={game.retryLoad} />
            </div>
        );
    }

    if (!game.finance) {
        return (
            <div className={"flex flex-col items-center justify-center w-full min-h-screen space-y-4 p-4"}>
                <div className={"size-12 rounded-full border-4 border-background-subtle border-t-secondary animate-spin"}></div>
                <p className={"text-text-secondary font-bold uppercase tracking-wide"}>Загрузка...</p>
            </div>
        );
    }

    return (
        <div className={"flex flex-col items-start justify-start w-full"}>
            <Header
                season={game.season}
                week={game.finance.week}
                weekIncrement={game.nextWeek}
                weekLoading={game.weekLoading}
                onNextSeason={game.nextSeason}
                seasonOver={game.seasonOver}
                fired={game.seasonResult === "lose"}
                onRestart={game.openRestartConfirm}
                availableBudget={game.finance.available_budget}
                transferBudgetLeft={game.finance.effective_transfer_left}
                power={game.power}
            />
            <Suspense fallback={<PageFallback />}>
                <Outlet context={game} />
            </Suspense>
            {game.seasonResult && !game.seasonResultClosed && (
                <SeasonResult result={game.seasonResult} stats={game.stats} onRestart={game.restartGame} onClose={game.closeSeasonResult} />
            )}
            {game.restartConfirmOpen && (
                <ConfirmDialog
                    title={"Перезапуск"}
                    text={"Весь прогресс будет удалён, и игра начнётся заново. Продолжить?"}
                    confirmText={"Перезапустить"}
                    onConfirm={game.restartGame}
                    onCancel={game.closeRestartConfirm}
                />
            )}
            {game.actionError && (
                <ErrorDialog text={game.actionError} onClose={game.clearActionError} />
            )}
        </div>
    );
}
