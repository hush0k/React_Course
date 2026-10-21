import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiCamera, FiUser, FiMapPin, FiInfo, FiAlertTriangle, FiEye, FiTrash2, FiSave, FiX } from "react-icons/fi";
import { FaRegHeart } from "react-icons/fa";
import { FormInput, FormSection, FormTextarea, FormToggle } from "@/features/ui/form/FormField.jsx";
import { deleteItem, getItem, updateItem } from "@/api/fakeApi.js";

const DESCRIPTION_MAX = 200;

const sections = [
    { id: "photos", label: "Photos", icon: <FiCamera size={18}/> },
    { id: "personal", label: "Personal data", icon: <FiUser size={18}/> },
    { id: "address", label: "Address", icon: <FiMapPin size={18}/> },
    { id: "about", label: "About", icon: <FiInfo size={18}/> },
    { id: "danger", label: "Danger zone", icon: <FiAlertTriangle size={18}/> },
]

// поля, по которым считается заполненность профиля
const completenessFields = ["name", "age", "profession", "hobby", "city", "street", "description", "imgUrl", "bgUrl"];

function toForm(user) {
    return {
        name: user.name ?? "",
        age: user.age != null ? String(user.age) : "",
        profession: user.profession ?? "",
        hobby: user.hobby ?? "",
        city: user.address?.city ?? "",
        street: user.address?.street ?? "",
        description: user.description ?? "",
        married: Boolean(user.married),
        imgUrl: user.imgUrl ?? "",
        bgUrl: user.bgUrl ?? "",
    };
}

function validate(form) {
    const errors = {};
    const age = Number(form.age);

    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.age) {
        errors.age = "Age is required";
    } else if (!Number.isInteger(age) || age < 1 || age > 120) {
        errors.age = "Age must be a whole number from 1 to 120";
    }
    if (!form.profession.trim()) errors.profession = "Profession is required";
    if (!form.city.trim()) errors.city = "City is required";

    return errors;
}

function getInitials(name = "") {
    return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("") || "?";
}

export function EditUserPage() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [actionError, setActionError] = useState(null);

    // Загрузка пользователя: перезапускается при смене id или по кнопке Retry
    useEffect(() => {
        let ignore = false;

        async function loadUser() {
            setLoading(true);
            setLoadError(null);

            try {
                const item = await getItem(id);
                if (!ignore) {
                    setUser(item);
                    setForm(toForm(item));
                    setErrors({});
                }
            } catch (err) {
                if (!ignore) {
                    setLoadError(err.message);
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

    function handleChange(e) {
        const {name, value, type, checked} = e.target;
        setForm((prev) => ({...prev, [name]: type === "checkbox" ? checked : value}));
        setErrors((prev) => {
            if (!prev[name]) return prev;
            const next = {...prev};
            delete next[name];
            return next;
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (saving || deleting) return;

        const nextErrors = validate(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        // id фиксируем в момент старта действия
        const userId = user.id;

        setSaving(true);
        setActionError(null);

        try {
            await updateItem(userId, {
                name: form.name.trim(),
                age: Number(form.age),
                profession: form.profession.trim(),
                hobby: form.hobby.trim(),
                description: form.description.trim(),
                married: form.married,
                address: {
                    city: form.city.trim(),
                    street: form.street.trim(),
                },
                imgUrl: form.imgUrl.trim(),
                bgUrl: form.bgUrl.trim(),
            });
            navigate(`/users/${userId}`);
        } catch (err) {
            setActionError(`Failed to save changes: ${err.message}`);
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (saving || deleting) return;
        if (!window.confirm(`Delete ${user.name}?`)) return;

        const userId = user.id;

        setDeleting(true);
        setActionError(null);

        try {
            await deleteItem(userId);
            navigate("/");
        } catch (err) {
            setActionError(`Failed to delete ${user.name}: ${err.message}`);
            setDeleting(false);
        }
    }

    if (loading) {
        return (
            <div className={"flex flex-col p-4 sm:p-7 space-y-4 w-full min-w-0"}>
                <p className={"text-center text-gray-500 py-10"}>Loading user...</p>
            </div>
        )
    }

    if (loadError === "Item not found") {
        return (
            <div className={"flex flex-col items-center p-4 sm:p-7 space-y-3 py-10 w-full min-w-0"}>
                <p className={"text-gray-800 font-semibold text-lg"}>User not found</p>
                <p className={"text-gray-500"}>The user may have been deleted</p>
                <Link to={"/"} className={"bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-700"}>
                    Back to catalog
                </Link>
            </div>
        )
    }

    if (loadError || !form) {
        return (
            <div className={"flex flex-col items-center p-4 sm:p-7 space-y-3 py-10 w-full min-w-0"}>
                <p className={"text-red-500 font-medium"}>{loadError}</p>
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

    const busy = saving || deleting;
    const filledCount = completenessFields.filter((field) => String(form[field]).trim()).length;
    const completeness = Math.round(filledCount / completenessFields.length * 100);

    return (
        <div className={"flex flex-col p-4 sm:p-7 space-y-4 w-full min-w-0"}>
            <div className={"flex flex-row items-center space-x-2 text-sm text-gray-500 min-w-0"}>
                <Link to={"/"} className={"hover:text-primary shrink-0"}>User Catalog</Link>
                <span>/</span>
                <Link to={`/users/${user.id}`} className={"hover:text-primary truncate"}>{user.name}</Link>
                <span>/</span>
                <span className={"text-gray-800 font-medium"}>Edit</span>
            </div>

            <div className={"flex flex-col sm:flex-row gap-4 bg-white py-6 px-4 sm:px-8 rounded-xl sm:items-center justify-between"}>
                <div className={"flex flex-row items-center space-x-4 min-w-0"}>
                    {form.imgUrl ? (
                        <img className={"h-14 w-14 shrink-0 rounded-full object-cover"} src={form.imgUrl} alt=""/>
                    ) : (
                        <div className={"h-14 w-14 shrink-0 rounded-full bg-primary-100 text-primary-700 font-bold" +
                            " flex items-center justify-center"}>
                            {getInitials(form.name || user.name)}
                        </div>
                    )}
                    <div className={"flex flex-col space-y-1 min-w-0"}>
                        <h2 className={"font-bold text-2xl sm:text-3xl text-gray-800 break-words"}>
                            Editing profile: {user.name}
                        </h2>
                        <p className={"text-gray-500"}>{user.profession} · {user.address?.city}</p>
                    </div>
                </div>
                <Link
                    to={`/users/${user.id}`}
                    className={"flex flex-row items-center justify-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800" +
                        " font-semibold px-5 py-2.5 rounded-lg shrink-0"}
                >
                    <FiEye size={18}/>
                    <p>View profile</p>
                </Link>
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
                <div className={"flex flex-col w-full lg:w-64 shrink-0 space-y-4 lg:sticky lg:top-4"}>
                    <nav className={"hidden lg:flex flex-col bg-white rounded-xl p-3 space-y-1"}>
                        {sections.map((section) => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className={`${section.id === "danger" ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-100"}` +
                                    " flex flex-row items-center space-x-3 px-3 py-2.5 rounded-lg font-medium"}
                            >
                                {section.icon}
                                <p>{section.label}</p>
                            </a>
                        ))}
                    </nav>

                    <div className={"flex flex-col bg-white rounded-xl p-5 space-y-3"}>
                        <div className={"flex flex-row items-center justify-between"}>
                            <p className={"font-semibold text-gray-800"}>Profile completeness</p>
                            <p className={"font-bold text-primary"}>{completeness}%</p>
                        </div>
                        <div className={"h-2 w-full bg-gray-200 rounded-full"}>
                            <div className={"h-2 bg-primary rounded-full transition-all"} style={{width: `${completeness}%`}}/>
                        </div>
                        <p className={"text-xs text-gray-500"}>
                            {completeness === 100 ? "The profile is complete" : "Fill in all fields, add a photo and a cover to complete the profile"}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate className={"flex flex-col flex-1 min-w-0 w-full space-y-4"}>
                    <div className={"flex flex-row items-start space-x-3 bg-primary-50 text-primary-700 rounded-xl px-5 py-4"}>
                        <FiInfo size={20} className={"mt-0.5 shrink-0"}/>
                        <p className={"text-sm"}>Changes are applied only after you press <b>Save changes</b>.</p>
                    </div>

                    <div id={"photos"} className={"bg-white rounded-xl py-6 px-4 sm:px-8"}>
                        <FormSection title={"Photos"} icon={<FiCamera size={20}/>}>
                            <div className={"flex flex-col sm:flex-row sm:items-center bg-gray-100 rounded-2xl p-5 gap-5"}>
                                {form.imgUrl ? (
                                    <img className={"h-28 w-28 shrink-0 rounded-full object-cover"} src={form.imgUrl} alt=""/>
                                ) : (
                                    <div className={"h-28 w-28 shrink-0 rounded-full bg-primary-100 text-primary-700 font-bold" +
                                        " text-3xl flex items-center justify-center"}>
                                        {getInitials(form.name)}
                                    </div>
                                )}
                                <div className={"flex flex-col flex-1 min-w-0 space-y-3"}>
                                    <div className={"flex flex-col space-y-1"}>
                                        <h4 className={"font-semibold text-lg text-gray-800"}>Profile photo</h4>
                                        <p className={"text-sm text-gray-500"}>Leave empty to show initials</p>
                                    </div>
                                    <FormInput
                                        name={"imgUrl"}
                                        type={"url"}
                                        value={form.imgUrl}
                                        onChange={handleChange}
                                        disabled={busy}
                                        placeholder={"https://..."}
                                    />
                                </div>
                            </div>

                            <div className={"flex flex-col sm:flex-row sm:items-center bg-gray-100 rounded-2xl p-5 gap-5"}>
                                {form.bgUrl ? (
                                    <img className={"h-28 w-full sm:w-48 shrink-0 rounded-xl object-cover"} src={form.bgUrl} alt=""/>
                                ) : (
                                    <div className={"h-28 w-full sm:w-48 shrink-0 rounded-xl bg-gradient-to-r from-primary-300 to-primary-600"}/>
                                )}
                                <div className={"flex flex-col flex-1 min-w-0 space-y-3"}>
                                    <div className={"flex flex-col space-y-1"}>
                                        <h4 className={"font-semibold text-lg text-gray-800"}>Cover image</h4>
                                        <p className={"text-sm text-gray-500"}>Leave empty to show a gradient</p>
                                    </div>
                                    <FormInput
                                        name={"bgUrl"}
                                        type={"url"}
                                        value={form.bgUrl}
                                        onChange={handleChange}
                                        disabled={busy}
                                        placeholder={"https://..."}
                                    />
                                </div>
                            </div>
                        </FormSection>
                    </div>

                    <div id={"personal"} className={"bg-white rounded-xl py-6 px-4 sm:px-8"}>
                        <FormSection title={"Personal data"} icon={<FiUser size={20}/>}>
                            <div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                                <FormInput
                                    label={"Full name"}
                                    name={"name"}
                                    value={form.name}
                                    onChange={handleChange}
                                    error={errors.name}
                                    disabled={busy}
                                    required
                                />
                                <FormInput
                                    label={"Age"}
                                    name={"age"}
                                    type={"number"}
                                    min={1}
                                    max={120}
                                    value={form.age}
                                    onChange={handleChange}
                                    error={errors.age}
                                    disabled={busy}
                                    required
                                />
                                <FormInput
                                    label={"Profession"}
                                    name={"profession"}
                                    value={form.profession}
                                    onChange={handleChange}
                                    error={errors.profession}
                                    disabled={busy}
                                    required
                                />
                                <FormInput
                                    label={"Hobby"}
                                    name={"hobby"}
                                    value={form.hobby}
                                    onChange={handleChange}
                                    disabled={busy}
                                />
                            </div>
                        </FormSection>
                    </div>

                    <div id={"address"} className={"bg-white rounded-xl py-6 px-4 sm:px-8"}>
                        <FormSection title={"Address"} icon={<FiMapPin size={20}/>}>
                            <div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                                <FormInput
                                    label={"City"}
                                    name={"city"}
                                    value={form.city}
                                    onChange={handleChange}
                                    error={errors.city}
                                    disabled={busy}
                                    required
                                />
                                <FormInput
                                    label={"Street"}
                                    name={"street"}
                                    value={form.street}
                                    onChange={handleChange}
                                    disabled={busy}
                                />
                            </div>
                        </FormSection>
                    </div>

                    <div id={"about"} className={"bg-white rounded-xl py-6 px-4 sm:px-8"}>
                        <FormSection title={"About"} icon={<FiInfo size={20}/>}>
                            <FormTextarea
                                label={"Description"}
                                name={"description"}
                                value={form.description}
                                onChange={handleChange}
                                disabled={busy}
                                hint={`${form.description.length} / ${DESCRIPTION_MAX}`}
                                maxLength={DESCRIPTION_MAX}
                            />
                            <FormToggle
                                name={"married"}
                                label={"Married"}
                                description={"Shown as marital status on the user card"}
                                icon={<FaRegHeart size={18}/>}
                                checked={form.married}
                                onChange={handleChange}
                                disabled={busy}
                            />
                        </FormSection>
                    </div>

                    <div className={"flex flex-row sm:justify-end space-x-3"}>
                        <Link
                            to={`/users/${user.id}`}
                            className={"flex-1 sm:flex-none text-center bg-gray-200 hover:bg-gray-300 text-gray-800" +
                                " font-semibold px-6 py-2.5 rounded-lg"}
                        >
                            Cancel
                        </Link>
                        <button
                            type={"submit"}
                            disabled={busy}
                            className={"flex-1 sm:flex-none flex flex-row items-center justify-center space-x-2 bg-primary" +
                                " hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg cursor-pointer" +
                                " disabled:opacity-50 disabled:cursor-not-allowed"}
                        >
                            <FiSave size={18}/>
                            <p>{saving ? "Saving..." : "Save changes"}</p>
                        </button>
                    </div>

                    <div id={"danger"} className={"flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-white" +
                        " rounded-xl py-6 px-4 sm:px-8 border border-red-200"}>
                        <div className={"flex flex-col space-y-1"}>
                            <div className={"flex flex-row items-center space-x-2 text-red-600"}>
                                <FiAlertTriangle size={20}/>
                                <h3 className={"text-lg font-semibold"}>Danger zone</h3>
                            </div>
                            <p className={"text-sm text-gray-500"}>Deleting a profile is permanent and cannot be undone</p>
                        </div>
                        <button
                            type={"button"}
                            onClick={handleDelete}
                            disabled={busy}
                            className={"flex flex-row items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600" +
                                " font-semibold px-5 py-2.5 rounded-lg cursor-pointer shrink-0" +
                                " disabled:opacity-50 disabled:cursor-not-allowed"}
                        >
                            <FiTrash2 size={18}/>
                            <p>{deleting ? "Deleting..." : "Delete profile"}</p>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
