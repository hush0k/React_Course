import { useOutletContext } from "react-router-dom";
import { Market } from "@/components/Market.jsx";

export function MarketPage() {
    const {finance, market, buyPlayer: onBuy} = useOutletContext();
    return (
        <Market
            players={market}
            finances={{
                availableBudget: finance.available_budget,
                transferBudgetLeft: finance.effective_transfer_left,
                salaryFundUsed: finance.all_salary,
                salaryFund: finance.effective_salary_fund,
            }}
            onBuy={onBuy}
        />
    )
}
