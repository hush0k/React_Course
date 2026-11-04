import { useOutletContext } from "react-router-dom";
import { Stadium } from "@/components/Stadium.jsx";

export function StadiumPage() {
    const {finance, upgrades, upgradeStadium: onUpgrade} = useOutletContext();
    return (
        <Stadium
            upgrades={upgrades}
            budget={finance.available_budget}
            bonuses={{incomeBonus: finance.income_bonus, fansBonus: finance.fans_bonus, winReward: finance.win_reward}}
            onUpgrade={onUpgrade}
        />
    )
}
