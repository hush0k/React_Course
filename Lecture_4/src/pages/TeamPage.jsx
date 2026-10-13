import { LineUp } from "@/components/LineUp.jsx";
import { Staff } from "@/components/Staff.jsx";

export function TeamPage({squad, staff, onSell, onPromote}) {
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
