import { PiIdentificationCardFill } from "react-icons/pi";
import { HiOutlineUserAdd } from "react-icons/hi";
import { Link } from "react-router-dom";

export function ProfilePage() {
    return (
        <div className={"flex flex-col sm:flex-row gap-4 bg-white py-6 px-4 sm:px-8 rounded-xl sm:items-center justify-between"}>
            <div className={"flex flex-col space-y-2"}>
                <div className={"flex flex-row items-center justify-start space-x-4 text-primary"}>
                    <PiIdentificationCardFill size={35}/>
                    <h2 className={"whitespace-nowrap font-bold text-2xl sm:text-4xl text-gray-800"}> User Catalog</h2>
                </div>
                <p className={"text-gray-500"}>Browse, coordinate, and find members of your corporate community</p>
            </div>

            <Link
                to={"/users/new"}
                className={"bg-primary hover:bg-primary-700 cursor-pointer text-white px-6 sm:px-10 py-3 flex flex-row items-center" +
                    " h-fit rounded-xl font-semibold space-x-2 whitespace-nowrap" +
                    " justify-center"}
            >
                <HiOutlineUserAdd size={20}/>
                <p>Add new user</p>
            </Link>
        </div>
    )
}
