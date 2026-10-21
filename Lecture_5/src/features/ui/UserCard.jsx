import { FiMapPin, FiInfo, FiHeart, FiTrash2 } from "react-icons/fi";
import { FaRegUser } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { Link } from "react-router-dom";

function getInitials(name = "") {
    return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "?";
}

export function UserCard({user, selected = false, pending = false, disabled = false, onSelect, onToggleMarried, onDelete}) {
    const hasActions = onToggleMarried || onDelete;

    return (
        <div className={`${selected ? "ring-2 ring-primary" : ""}` +
            " flex flex-col w-full bg-white rounded-2xl space-y-4 pb-3"}>
            <div className={"rounded-t-2xl relative"}>
                {user.bgUrl ? (
                    <img className={"h-44 w-full object-cover rounded-t-2xl"} src={user.bgUrl} alt=""/>
                ) : (
                    <div className={"h-44 w-full rounded-t-2xl bg-gradient-to-r from-primary-300 to-primary-600"}/>
                )}
                {user.profession && (
                    <p className="absolute right-4 top-3 text-sm bg-gray-50/70 px-2 rounded-md font-medium">
                        {user.profession}
                    </p>
                )}
                {user.imgUrl ? (
                    <img className={"h-20 w-20 object-cover border-5 border-white rounded-full absolute -bottom-10 left-5"} src={user.imgUrl} alt=""/>
                ) : (
                    <div className={"h-20 w-20 border-5 border-white rounded-full absolute -bottom-10 left-5 bg-primary-100" +
                        " text-primary-700 font-bold text-xl flex items-center justify-center"}>
                        {getInitials(user.name)}
                    </div>
                )}
            </div>

            <div className={"flex flex-row justify-end text-gray-600 px-4 text-sm items-center space-x-2 min-h-5"}>
                <FiMapPin />
                <p className={"truncate"}>{user.address?.city} {user.address?.street}</p>
            </div>

            <div className={"flex flex-col text-gray-800 px-4 space-y-1 flex-1"}>
                <p className={"text-lg font-semibold"}>{user.name}</p>
                {user.description && (
                    <p className={"text-gray-500 text-sm p-1.5 rounded-lg bg-gray-200 line-clamp-2"}>{user.description}</p>
                )}
                <p className={"text-sm text-gray-600"}><span className={"font-bold text-gray-800"}>Age: </span>{user.age} years old</p>
                <p className={"text-sm text-gray-600"}><span className={"font-bold text-gray-800"}>Hobby: </span>{user.hobby || "—"}</p>
                <p className={"text-sm text-gray-600"}><span className={"font-bold text-gray-800"}>Marital status: </span>{user.married ? "Married" : "Not married"}</p>
            </div>

            <div className={"flex flex-row space-x-2 justify-between px-4"}>
                <Link
                    to={`/users/${user.id}`}
                    className={"flex flex-row items-center justify-center space-x-2 bg-primary text-white py-2 rounded-lg" +
                        " flex-1 hover:bg-primary-700 cursor-pointer"}
                >
                    <FaRegUser /> <p>Open profile</p>
                </Link>
                {onSelect && (
                    <button
                        type={"button"}
                        onClick={() => onSelect(user.id)}
                        className={"flex flex-row items-center justify-center space-x-2 bg-primary-50 text-primary-700 py-2" +
                            " rounded-lg flex-1 hover:bg-primary-100 cursor-pointer"}
                    >
                        <FiInfo /> <p>Details</p>
                    </button>
                )}
            </div>

            {hasActions && (
                <div className={"flex flex-row space-x-2 px-4"}>
                    {onToggleMarried && (
                        <button
                            type={"button"}
                            onClick={() => onToggleMarried(user)}
                            disabled={disabled}
                            className={"flex flex-row items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2" +
                                " rounded-lg flex-1 hover:bg-gray-200 cursor-pointer text-sm font-medium" +
                                " disabled:opacity-50 disabled:cursor-not-allowed"}
                        >
                            <FiHeart />
                            <p>{pending ? "Saving..." : user.married ? "Mark as single" : "Mark as married"}</p>
                        </button>
                    )}
                    <Link to={`/users/${user.id}/edit`} className={"bg-gray-300 text-gray-600 p-3 rounded-lg cursor-pointer"}>
                        <MdEdit size={16} />
                    </Link>
                    {onDelete && (
                        <button
                            type={"button"}
                            onClick={() => onDelete(user)}
                            disabled={disabled}
                            aria-label={"Delete user"}
                            className={"bg-red-50 text-red-600 hover:bg-red-100 p-3 rounded-lg cursor-pointer" +
                                " disabled:opacity-50 disabled:cursor-not-allowed"}
                        >
                            <FiTrash2 size={16} />
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
