import { useOutletContext } from "react-router-dom";
import { LineUp } from "@/components/LineUp.jsx";
import { Staff } from "@/components/Staff.jsx";

export function TeamPage() {
    const {squad, staff, sellPlayer: onSell, promotePlayer: onPromote} = useOutletContext();
    return (
        <>
            <LineUp
                squad={squad}
                onSell={onSell}
                onPromote={onPromote}
            />
            <Staff staff={staff} />
        </>
    )
}
