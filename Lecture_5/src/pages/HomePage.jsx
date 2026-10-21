import {UserCard} from "@/features/ui/UserCard";
import {ProfilePage} from "@/pages/ProfilePage.jsx";
import {UserFilters} from "@/features/ui/UserFilters.jsx";
import {LoadMore} from "@/features/ui/LoadMore.jsx";
import {useEffect, useState} from "react";
import {deleteItem, getItem, getItemsList, updateItem} from "@/api/fakeApi.js";
import {FiRefreshCw, FiX} from "react-icons/fi";

const PAGE_LIMIT = 10;

const initialFilters = {
    search: "",
    city: "",
    profession: "",
    status: "",
    sort: "name",
};

function DetailsRow({label, value}) {
    return (
        <div className={"flex flex-row justify-between gap-4 py-2 border-b border-gray-100 text-sm"}>
            <span className={"font-semibold text-gray-500"}>{label}</span>
            <span className={"text-gray-800 text-right break-all"}>{value || "—"}</span>
        </div>
    )
}

export function HomePage() {
    const [filters, setFilters] = useState(initialFilters);
    const [page, setPage] = useState(1);
    const [usersList, setUsersList] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    const [selectedId, setSelectedId] = useState(null);
    const [details, setDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState(null);
    const [detailsReloadKey, setDetailsReloadKey] = useState(0);

    const [pendingId, setPendingId] = useState(null);
    const [pendingAction, setPendingAction] = useState(null);
    const [actionError, setActionError] = useState(null);

    const {search, city, profession, status, sort} = filters;

    // Загрузка списка: перезапускается при смене фильтров, страницы или по кнопке Reload
    useEffect(() => {
        let ignore = false;

        async function loadUsers() {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (city) params.set("city", city);
            if (profession) params.set("profession", profession);
            if (status) params.set("status", status);
            params.set("sort", sort);
            params.set("page", String(page));
            params.set("limit", String(PAGE_LIMIT));

            try {
                const response = await getItemsList(params.toString());
                if (!ignore) {
                    if (page > 1) {
                        setUsersList((prev) => {
                            const existingIds = new Set(prev.map((user) => user.id));
                            return [...prev, ...response.data.filter((user) => !existingIds.has(user.id))];
                        });
                    } else {
                        setUsersList(response.data);
                    }
                    setTotal(response.total);
                }
            } catch (err) {
                if (!ignore) {
                    setError(err.message);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        loadUsers();

        return () => {
            ignore = true;
        };
    }, [search, city, profession, status, sort, page, reloadKey]);

    // Загрузка деталей выбранного пользователя
    useEffect(() => {
        if (!selectedId) return;

        let ignore = false;

        async function loadDetails() {
            setDetailsLoading(true);
            setDetailsError(null);

            try {
                const item = await getItem(selectedId);
                if (!ignore) {
                    setDetails(item);
                }
            } catch (err) {
                if (!ignore) {
                    setDetailsError(err.message);
                }
            } finally {
                if (!ignore) {
                    setDetailsLoading(false);
                }
            }
        }

        loadDetails();

        return () => {
            ignore = true;
        };
    }, [selectedId, detailsReloadKey]);

    function handleFilterChange(name, value) {
        setFilters((prev) => ({...prev, [name]: value}));
        setPage(1);
    }

    function handleReload() {
        setPage(1);
        setReloadKey((key) => key + 1);
    }

    function handleSelect(id) {
        if (id === selectedId) return;
        setDetails(null);
        setSelectedId(id);
    }

    function handleCloseDetails() {
        setSelectedId(null);
        setDetails(null);
        setDetailsError(null);
    }

    async function handleToggleMarried(user) {
        if (pendingId) return;

        // id и новое значение фиксируем в момент старта действия
        const id = user.id;
        const nextMarried = !user.married;

        setPendingId(id);
        setPendingAction("update");
        setActionError(null);

        try {
            const updated = await updateItem(id, {married: nextMarried});
            setUsersList((prev) => prev.map((item) => item.id === id ? updated : item));
            setDetails((prev) => prev?.id === id ? updated : prev);
        } catch (err) {
            setActionError(`Failed to update ${user.name}: ${err.message}`);
        } finally {
            setPendingId(null);
            setPendingAction(null);
        }
    }

    async function handleDelete(user) {
        if (pendingId) return;
        if (!window.confirm(`Delete ${user.name}?`)) return;

        const id = user.id;

        setPendingId(id);
        setPendingAction("delete");
        setActionError(null);

        try {
            await deleteItem(id);
            setUsersList((prev) => prev.filter((item) => item.id !== id));
            setTotal((prev) => Math.max(prev - 1, 0));
            setSelectedId((prev) => prev === id ? null : prev);
            setDetails((prev) => prev?.id === id ? null : prev);
        } catch (err) {
            setActionError(`Failed to delete ${user.name}: ${err.message}`);
        } finally {
            setPendingId(null);
            setPendingAction(null);
        }
    }

    const isFirstPageLoading = loading && page === 1;
    const selectedUser = details?.id === selectedId ? details : null;

    return (
        <div className={"flex flex-col p-4 sm:p-7 space-y-4 w-full min-w-0"}>
            <ProfilePage />

            <UserFilters
                search={search}
                city={city}
                profession={profession}
                status={status}
                sort={sort}
                total={total}
                onChange={handleFilterChange}
            />

            <div className={"flex flex-row items-center justify-between gap-3"}>
                <p className={"text-sm text-gray-500"}>
                    {pendingId ? (pendingAction === "delete" ? "Deleting user..." : "Saving changes...") : ""}
                </p>
                <button
                    type={"button"}
                    onClick={handleReload}
                    disabled={loading}
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

            <div className={"flex flex-col lg:flex-row gap-4 items-start"}>
                <div className={"flex flex-col flex-1 min-w-0 w-full space-y-4"}>
                    {isFirstPageLoading && (
                        <p className={"text-center text-gray-500 py-10"}>Loading users...</p>
                    )}

                    {!loading && error && (
                        <div className={"flex flex-col items-center space-y-3 py-10"}>
                            <p className={"text-red-500 font-medium"}>{error}</p>
                            <button
                                type={"button"}
                                onClick={() => setReloadKey((key) => key + 1)}
                                className={"bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-700 cursor-pointer"}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!isFirstPageLoading && !error && usersList.length === 0 && (
                        <p className={"text-center text-gray-500 py-10"}>No users found</p>
                    )}

                    {!isFirstPageLoading && usersList.length > 0 && (
                        <div className={"grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-4"}>
                            {usersList.map((user) => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    selected={user.id === selectedId}
                                    pending={user.id === pendingId && pendingAction === "update"}
                                    disabled={Boolean(pendingId)}
                                    onSelect={handleSelect}
                                    onToggleMarried={handleToggleMarried}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}

                    {!isFirstPageLoading && usersList.length > 0 && (
                        <LoadMore
                            shown={usersList.length}
                            total={total}
                            isLoading={loading && page > 1}
                            onLoadMore={() => setPage((prev) => prev + 1)}
                        />
                    )}
                </div>

                {selectedId && (
                    <aside className={"w-full lg:w-96 shrink-0 bg-white rounded-2xl p-5 lg:sticky lg:top-4 space-y-4"}>
                        <div className={"flex flex-row items-center justify-between"}>
                            <h3 className={"text-lg font-bold text-gray-800"}>User details</h3>
                            <button
                                type={"button"}
                                onClick={handleCloseDetails}
                                className={"text-gray-500 hover:text-gray-800 cursor-pointer"}
                                aria-label={"Close details"}
                            >
                                <FiX size={20}/>
                            </button>
                        </div>

                        {detailsLoading && (
                            <p className={"text-center text-gray-500 py-6"}>Loading details...</p>
                        )}

                        {!detailsLoading && detailsError && (
                            <div className={"flex flex-col items-center space-y-3 py-6"}>
                                <p className={"text-red-500 font-medium"}>{detailsError}</p>
                                <button
                                    type={"button"}
                                    onClick={() => setDetailsReloadKey((key) => key + 1)}
                                    className={"bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-700 cursor-pointer"}
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {!detailsLoading && !detailsError && selectedUser && (
                            <div className={"flex flex-col"}>
                                <DetailsRow label={"ID"} value={selectedUser.id}/>
                                <DetailsRow label={"Name"} value={selectedUser.name}/>
                                <DetailsRow label={"Age"} value={selectedUser.age}/>
                                <DetailsRow label={"Profession"} value={selectedUser.profession}/>
                                <DetailsRow label={"Hobby"} value={selectedUser.hobby}/>
                                <DetailsRow label={"City"} value={selectedUser.address?.city}/>
                                <DetailsRow label={"Street"} value={selectedUser.address?.street}/>
                                <DetailsRow label={"Marital status"} value={selectedUser.married ? "Married" : "Not married"}/>
                                <p className={"text-sm text-gray-600 pt-3"}>{selectedUser.description || "No description"}</p>
                            </div>
                        )}
                    </aside>
                )}
            </div>
        </div>
    )
}
