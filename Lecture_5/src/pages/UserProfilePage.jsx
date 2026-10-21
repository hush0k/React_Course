import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiMapPin, FiBriefcase, FiCalendar, FiHome, FiArrowLeft, FiHash, FiHeart, FiTrash2, FiRefreshCw, FiX } from "react-icons/fi";
import { FaRegHeart, FaRegSmile } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { deleteItem, getItem, getItemsList, updateItem } from "@/api/fakeApi.js";

const NOT_FOUND_MESSAGE = "Item not found";
const NEIGHBOURS_LIMIT = 5;

function getInitials(name = "") {
    return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "?";
}

export function UserProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    const [neighbours, setNeighbours] = useState([]);
    const [neighboursLoading, setNeighboursLoading] = useState(false);
    const [neighboursError, setNeighboursError] = useState(null);

    const [pendingAction, setPendingAction] = useState(null);
    const [actionError, setActionError] = useState(null);

    // Загрузка пользователя: перезапускается при смене id в URL или по кнопке Retry/Reload
    useEffect(() => {
        let ignore = false;

        async function loadUser() {
            setLoading(true);
            setError(null);

            try {
                const item = await getItem(id);
                if (!ignore) {
                    setUser(item);
                }
            } catch (err) {
                if (!ignore) {
                    setUser(null);
                    setError(err.message);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadUser();

        return () => {
            ignore = true;
        };
    }, [id, reloadKey]);

    const city = user?.address?.city;

    // Загрузка людей из того же города: зависит только от города, а не от всего объекта user
    useEffect(() => {
        if (!city) return;

        let ignore = false;

        async function loadNeighbours() {
            setNeighboursLoading(true);
            setNeighboursError(null);

            const params = new URLSearchParams();
            params.set("city", city);
            params.set("limit", String(NEIGHBOURS_LIMIT + 1));

            try {
                const response = await getItemsList(params.toString());
                if (!ignore) {
                    setNeighbours(response.data);
                }
            } catch (err) {
                if (!ignore) {
                    setNeighboursError(err.message);
                }
            } finally {
                if (!ignore) {
                    setNeighboursLoading(false);
                }
            }
        }

        loadNeighbours();

        return () => {
            ignore = true;
        };
    }, [city]);

    async function handleToggleMarried() {
        if (pendingAction || !user) return;

        // id и новое значение фиксируем в момент старта действия
        const userId = user.id;
        const nextMarried = !user.married;

        setPendingAction("update");
        setActionError(null);

        try {
            const updated = await updateItem(userId, {married: nextMarried});
            setUser((prev) => prev?.id === userId ? updated : prev);
        } catch (err) {
            setActionError(`Failed to update: ${err.message}`);
        } finally {
            setPendingAction(null);
        }
    }

    async function handleDelete() {
        if (pendingAction || !user) return;
        if (!window.confirm(`Delete ${user.name}?`)) return;

        const userId = user.id;

        setPendingAction("delete");
        setActionError(null);

        try {
            await deleteItem(userId);
            navigate("/");
        } catch (err) {
            setActionError(`Failed to delete: ${err.message}`);
            setPendingAction(null);
        }
    }

    const isCurrentUser = user && String(user.id) === String(id);
    const otherNeighbours = neighbours.filter((item) => String(item.id) !== String(id)).slice(0, NEIGHBOURS_LIMIT);

    if (loading && !isCurrentUser) {
        return (
            <div className={"flex flex-col items-center justify-center p-7 w-full text-gray-500"}>
                <FiRefreshCw size={28} className={"animate-spin text-primary mb-3"}/>
                <p>Loading profile...</p>
            </div>
        )
    }

    if (error === NOT_FOUND_MESSAGE) {
        return (
            <div className={"flex flex-col items-center justify-center p-7 w-full space-y-4 text-center"}>
                <h2 className={"text-2xl font-bold text-gray-800"}>User not found</h2>
                <p className={"text-gray-500"}>User with id {id} does not exist or was deleted.</p>
                <Link to={"/"} className={"bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-700"}>
                    Back to all users
                </Link>
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className={"flex flex-col items-center justify-center p-7 w-full space-y-3"}>
                <p className={"text-red-500 font-medium"}>{error || "Failed to load user"}</p>
                <button
                    type={"button"}
                    onClick={() => setReloadKey((key) => key + 1)}
                    className={"bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-700 cursor-pointer"}
                >
                    Retry
                </button>
            </div>
        )
    }

    const details = [
        { icon: <FiHash size={18}/>, label: "ID", value: user.id },
        { icon: <FiBriefcase size={18}/>, label: "Profession", value: user.profession },
        { icon: <FiCalendar size={18}/>, label: "Age", value: user.age ? `${user.age} years old` : "" },
        { icon: <FiMapPin size={18}/>, label: "City", value: user.address?.city },
        { icon: <FiHome size={18}/>, label: "Street", value: user.address?.street },
        { icon: <FaRegSmile size={18}/>, label: "Hobby", value: user.hobby },
        { icon: <FaRegHeart size={18}/>, label: "Marital status", value: user.married ? "Married" : "Not married" },
    ]

    const isBusy = Boolean(pendingAction);

    return (
        <div className={"flex flex-col p-4 sm:p-7 space-y-4 w-full min-w-0"}>
            <div className={"flex flex-row items-center justify-between gap-3"}>
                <Link to={"/"} className={"flex flex-row items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium"}>
                    <FiArrowLeft/>
                    <span>All users</span>
                </Link>
                <button
                    type={"button"}
                    onClick={() => setReloadKey((key) => key + 1)}
                    disabled={loading || isBusy}
                    className={"flex flex-row items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg" +
                        " hover:bg-gray-100 cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed"}
                >
                    <FiRefreshCw className={loading ? "animate-spin" : ""}/>
                    <span>Reload</span>
                </button>
            </div>

            {actionError && (
                <div className={"flex flex-row items-center justify-between gap-3 bg-red-50 text-red-600 px-4 py-3 rounded-lg"}>
                    <p className={"text-sm font-medium"}>{actionError}</p>
                    <button type={"button"} onClick={() => setActionError(null)} className={"cursor-pointer"} aria-label={"Dismiss"}>
                        <FiX />
                    </button>
                </div>
            )}

            <div className={"flex flex-col bg-white rounded-xl"}>
                {user.bgUrl ? (
                    <img className={"h-40 sm:h-64 w-full object-cover rounded-t-xl"} src={user.bgUrl} alt=""/>
                ) : (
                    <div className={"h-40 sm:h-64 w-full rounded-t-xl bg-gradient-to-r from-primary-300 to-primary-600"}/>
                )}

                <div className={"flex flex-col lg:flex-row lg:items-end justify-between gap-4 px-4 sm:px-8 pb-5"}>
                    <div className={"flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5"}>
                        {user.imgUrl ? (
                            <img className={"h-28 w-28 sm:h-36 sm:w-36 -mt-14 sm:-mt-16 border-5 border-white rounded-full object-cover"}
                                 src={user.imgUrl} alt=""/>
                        ) : (
                            <div className={"h-28 w-28 sm:h-36 sm:w-36 -mt-14 sm:-mt-16 border-5 border-white rounded-full bg-primary-100" +
                                " text-primary-700 font-bold text-3xl flex items-center justify-center"}>
                                {getInitials(user.name)}
                            </div>
                        )}
                        <div className={"flex flex-col space-y-1 sm:pb-2 min-w-0"}>
                            <h2 className={"font-bold text-2xl sm:text-3xl text-gray-800 break-words"}>{user.name}</h2>
                            <div className={"flex flex-row flex-wrap items-center gap-x-3 text-gray-500"}>
                                {user.profession && <p>{user.profession}</p>}
                                {user.profession && user.address?.city && <span>·</span>}
                                {user.address?.city && (
                                    <div className={"flex flex-row items-center space-x-1"}>
                                        <FiMapPin size={14}/>
                                        <p>{user.address.city}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={"flex flex-row flex-wrap gap-2 lg:pb-2"}>
                        <button
                            type={"button"}
                            onClick={handleToggleMarried}
                            disabled={isBusy}
                            className={"flex flex-row items-center space-x-2 bg-primary hover:bg-primary-700 text-white" +
                                " font-semibold px-4 py-2.5 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"}
                        >
                            <FiHeart size={18}/>
                            <p>{pendingAction === "update" ? "Saving..." : user.married ? "Mark as single" : "Mark as married"}</p>
                        </button>
                        <Link
                            to={`/users/${user.id}/edit`}
                            className={`${isBusy ? "pointer-events-none opacity-50" : ""}` +
                                " flex flex-row items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800" +
                                " font-semibold px-4 py-2.5 rounded-lg"}
                        >
                            <MdEdit size={18}/>
                            <p>Edit</p>
                        </Link>
                        <button
                            type={"button"}
                            onClick={handleDelete}
                            disabled={isBusy}
                            className={"flex flex-row items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600" +
                                " font-semibold px-4 py-2.5 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"}
                        >
                            <FiTrash2 size={18}/>
                            <p>{pendingAction === "delete" ? "Deleting..." : "Delete"}</p>
                        </button>
                    </div>
                </div>
            </div>

            <div className={"flex flex-col lg:flex-row items-start gap-4"}>
                <div className={"flex flex-col w-full lg:w-96 shrink-0 space-y-4"}>
                    <div className={"flex flex-col bg-white rounded-xl p-6 space-y-3"}>
                        <h3 className={"text-lg font-semibold text-gray-800"}>About</h3>
                        <p className={"text-gray-600"}>{user.description || "No description"}</p>
                    </div>

                    <div className={"flex flex-col bg-white rounded-xl p-6 space-y-4"}>
                        <h3 className={"text-lg font-semibold text-gray-800"}>Details</h3>
                        {details.map((detail) => (
                            <div key={detail.label} className={"flex flex-row items-center space-x-3"}>
                                <span className={"h-9 w-9 shrink-0 rounded-lg bg-gray-100 text-primary flex justify-center items-center"}>
                                    {detail.icon}
                                </span>
                                <div className={"flex flex-col min-w-0"}>
                                    <p className={"text-xs text-gray-500"}>{detail.label}</p>
                                    <p className={"font-medium text-gray-800 break-words"}>{detail.value || "—"}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={"flex flex-col flex-1 w-full min-w-0 space-y-4"}>
                    <div className={"flex flex-col bg-white rounded-xl p-6 space-y-4"}>
                        <h3 className={"text-lg font-semibold text-gray-800"}>People from {city || "the same city"}</h3>

                        {neighboursLoading && (
                            <p className={"text-sm text-gray-500 py-4 text-center"}>Loading...</p>
                        )}

                        {!neighboursLoading && neighboursError && (
                            <p className={"text-sm text-red-500 py-4 text-center"}>{neighboursError}</p>
                        )}

                        {!neighboursLoading && !neighboursError && otherNeighbours.length === 0 && (
                            <div className={"flex flex-row items-center justify-center h-24 rounded-lg bg-gray-50 text-sm text-gray-400"}>
                                No other users from this city
                            </div>
                        )}

                        {!neighboursLoading && !neighboursError && otherNeighbours.length > 0 && (
                            <div className={"flex flex-col divide-y divide-gray-100"}>
                                {otherNeighbours.map((item) => (
                                    <Link
                                        key={item.id}
                                        to={`/users/${item.id}`}
                                        className={"flex flex-row items-center space-x-3 py-3 hover:bg-gray-50 rounded-lg px-2"}
                                    >
                                        {item.imgUrl ? (
                                            <img className={"h-10 w-10 rounded-full object-cover shrink-0"} src={item.imgUrl} alt=""/>
                                        ) : (
                                            <div className={"h-10 w-10 rounded-full bg-primary-100 text-primary-700 font-bold text-sm" +
                                                " flex items-center justify-center shrink-0"}>
                                                {getInitials(item.name)}
                                            </div>
                                        )}
                                        <div className={"flex flex-col min-w-0"}>
                                            <p className={"font-medium text-gray-800 truncate"}>{item.name}</p>
                                            <p className={"text-sm text-gray-500 truncate"}>{item.profession || "—"}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <Link
                        to={"/"}
                        className={"flex flex-row items-center justify-between bg-white rounded-xl p-6 hover:bg-gray-50 group"}
                    >
                        <div className={"flex flex-row items-center space-x-4"}>
                            <span className={"h-11 w-11 rounded-full bg-primary-100 text-primary flex justify-center items-center" +
                                " group-hover:bg-primary group-hover:text-white"}>
                                <FiArrowLeft size={20}/>
                            </span>
                            <div className={"flex flex-col"}>
                                <p className={"font-semibold text-gray-800"}>Back to all users</p>
                                <p className={"text-sm text-gray-500"}>Return to the User Catalog</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
