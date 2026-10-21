import { FaUser } from "react-icons/fa";
import { IoAddOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

export function Header() {
    return (
        <div className={"h-16 sm:h-20 w-full bg-white px-4 sm:px-8 lg:px-20 flex flex-row items-center justify-between gap-3"}>
            <div className={"flex flex-row space-x-3 items-center min-w-0"}>
                <div className={"h-10 w-10 sm:h-14 sm:w-14 shrink-0 rounded-2xl bg-primary text-white flex justify-center items-center"}>
                    <FaUser size={20}/>
                </div>
                <h1 className={"text-primary font-bold text-xl sm:text-2xl truncate"}>Connect Hub</h1>
            </div>

            <Link
                to={"/users/new"}
                className={"py-2 px-3 sm:px-4 space-x-2 shrink-0 rounded-lg text-white bg-primary  flex flex-row justify-center items-center" +
                    " hover:bg-primary-700 font-medium"}
            >
                <IoAddOutline size={18}/>
                <p className={"hidden sm:block"}>Create user</p>
            </Link>
        </div>
    )
}