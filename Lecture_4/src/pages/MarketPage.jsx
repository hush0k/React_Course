import { Market } from "@/components/Market.jsx";

export function MarketPage({finance, market, onBuy}) {
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
