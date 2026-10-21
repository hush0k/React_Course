import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiOutlineUserAdd } from "react-icons/hi";
import { FiCamera, FiMapPin, FiUser, FiBriefcase, FiInfo, FiX } from "react-icons/fi";
import { MdOutlineAdminPanelSettings, MdOutlineTipsAndUpdates } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import { FormCheckbox, FormInput, FormSection, FormTextarea } from "@/features/ui/form/FormField.jsx";
import { UserCard } from "@/features/ui/UserCard.jsx";
import { createItem } from "@/api/fakeApi.js";

const DESCRIPTION_MAX = 200;

const initialForm = {
    name: "",
    age: "",
    profession: "",
    hobby: "",
    city: "",
    street: "",
    description: "",
    married: false,
    imgUrl: "",
    bgUrl: "",
};

const tips = [
    "Use a real photo, so colleagues can recognize the user",
    "Describe the profession in 1-2 words",
    "Keep the description short and friendly",
    "Fields marked with * are required",
]

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

export function CreateUserPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    function handleChange(e) {
        const {name, value, type, checked} = e.target;
        setForm((prev) => ({...prev, [name]: type === "checkbox" ? checked : value}));
        // ошибку поля убираем, как только пользователь начал его исправлять
        setErrors((prev) => {
            if (!prev[name]) return prev;
            const next = {...prev};
            delete next[name];
            return next;
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (submitting) return;

        const nextErrors = validate(form);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setSubmitting(true);
        setSubmitError(null);

        try {
            const created = await createItem({
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
            navigate(`/users/${created.id}`);
        } catch (err) {
            setSubmitError(`Failed to create user: ${err.message}`);
            setSubmitting(false);
        }
    }

    const previewUser = {
        id: "new",
        name: form.name || "New user",
        description: form.description || "Short description will appear here",
        age: form.age || "—",
        address: {
            city: form.city || "City",
            street: form.street,
        },
        profession: form.profession || "Profession",
        hobby: form.hobby,
        married: form.married,
        imgUrl: form.imgUrl,
        bgUrl: form.bgUrl,
    };

    return (
        <div className={"flex flex-col p-4 sm:p-7 space-y-4 w-full min-w-0"}>
            <div className={"flex flex-row items-center space-x-2 text-sm text-gray-500"}>
                <Link to={"/"} className={"hover:text-primary"}>User Catalog</Link>
                <span>/</span>
                <span className={"text-gray-800 font-medium"}>Create user</span>
            </div>

            <div className={"flex flex-col sm:flex-row gap-4 bg-white py-6 px-4 sm:px-8 rounded-xl sm:items-center justify-between"}>
                <div className={"flex flex-row items-center space-x-4"}>
                    <div className={"h-14 w-14 shrink-0 rounded-2xl bg-primary-100 text-primary flex justify-center items-center"}>
                        <HiOutlineUserAdd size={28}/>
                    </div>
                    <div className={"flex flex-col space-y-1"}>
                        <h2 className={"font-bold text-2xl sm:text-3xl text-gray-800"}>Create new user</h2>
                        <p className={"text-gray-500"}>Fill in the information to add a new member to the catalog</p>
                    </div>
                </div>
                <div className={"flex flex-row items-center space-x-2 bg-primary-50 text-primary-700 px-3 py-1.5 w-fit" +
                    " rounded-full text-sm font-medium"}>
                    <MdOutlineAdminPanelSettings size={18}/>
                    <p>Admin mode</p>
                </div>
            </div>

            {submitError && (
                <div className={"flex flex-row items-center justify-between gap-3 bg-red-50 text-red-600 px-4 py-3 rounded-lg"}>
                    <p className={"text-sm font-medium"}>{submitError}</p>
                    <button type={"button"} onClick={() => setSubmitError(null)} className={"cursor-pointer"} aria-label={"Dismiss"}>
                        <FiX />
                    </button>
                </div>
            )}

            <div className={"flex flex-col lg:flex-row gap-4 items-start"}>
                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className={"flex flex-col flex-1 min-w-0 w-full bg-white rounded-xl py-6 px-4 sm:px-8 space-y-8"}
                >
                    <FormSection title={"Photos"} icon={<FiCamera size={20}/>}>
                        <div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                            <FormInput
                                label={"Avatar URL"}
                                name={"imgUrl"}
                                type={"url"}
                                value={form.imgUrl}
                                onChange={handleChange}
                                disabled={submitting}
                                placeholder={"https://..."}
                            />
                            <FormInput
                                label={"Cover URL"}
                                name={"bgUrl"}
                                type={"url"}
                                value={form.bgUrl}
                                onChange={handleChange}
                                disabled={submitting}
                                placeholder={"https://..."}
                            />
                        </div>
                        <p className={"text-sm text-gray-500"}>
                            Optional. Without photos the card shows initials and a gradient cover.
                        </p>
                    </FormSection>

                    <FormSection title={"Basic information"} icon={<FiUser size={20}/>}>
                        <div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                            <FormInput
                                label={"Full name"}
                                name={"name"}
                                value={form.name}
                                onChange={handleChange}
                                error={errors.name}
                                disabled={submitting}
                                placeholder={"e.g. Daniel Kim"}
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
                                disabled={submitting}
                                placeholder={"e.g. 25"}
                                required
                            />
                        </div>
                    </FormSection>

                    <FormSection title={"Work & hobby"} icon={<FiBriefcase size={20}/>}>
                        <div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                            <FormInput
                                label={"Profession"}
                                name={"profession"}
                                value={form.profession}
                                onChange={handleChange}
                                error={errors.profession}
                                disabled={submitting}
                                placeholder={"e.g. Software Developer"}
                                required
                            />
                            <FormInput
                                label={"Hobby"}
                                name={"hobby"}
                                value={form.hobby}
                                onChange={handleChange}
                                disabled={submitting}
                                placeholder={"e.g. Streaming"}
                            />
                        </div>
                    </FormSection>

                    <FormSection title={"Address"} icon={<FiMapPin size={20}/>}>
                        <div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                            <FormInput
                                label={"City"}
                                name={"city"}
                                value={form.city}
                                onChange={handleChange}
                                error={errors.city}
                                disabled={submitting}
                                placeholder={"e.g. Seoul"}
                                required
                            />
                            <FormInput
                                label={"Street"}
                                name={"street"}
                                value={form.street}
                                onChange={handleChange}
                                disabled={submitting}
                                placeholder={"e.g. Gangnam-daero 301"}
                            />
                        </div>
                    </FormSection>

                    <FormSection title={"About"} icon={<FiInfo size={20}/>}>
                        <FormTextarea
                            label={"Description"}
                            name={"description"}
                            value={form.description}
                            onChange={handleChange}
                            disabled={submitting}
                            hint={`${form.description.length} / ${DESCRIPTION_MAX}`}
                            maxLength={DESCRIPTION_MAX}
                            placeholder={"Tell a few words about the user..."}
                        />
                        <FormCheckbox
                            name={"married"}
                            checked={form.married}
                            onChange={handleChange}
                            disabled={submitting}
                            label={"Married"}
                            description={"Shown as marital status on the user card"}
                        />
                    </FormSection>

                    <div className={"flex flex-col sm:flex-row gap-4 sm:items-center justify-between pt-6 border-t border-gray-200"}>
                        <p className={"text-sm text-gray-500"}><span className={"text-red-500"}>*</span> Required fields</p>
                        <div className={"flex flex-row space-x-3"}>
                            <Link
                                to={"/"}
                                className={"flex-1 sm:flex-none text-center bg-gray-200 hover:bg-gray-300 text-gray-800" +
                                    " font-semibold px-6 py-2.5 rounded-lg"}
                            >
                                Cancel
                            </Link>
                            <button
                                type={"submit"}
                                disabled={submitting}
                                className={"flex-1 sm:flex-none flex flex-row items-center justify-center space-x-2 bg-primary" +
                                    " hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg cursor-pointer" +
                                    " disabled:opacity-50 disabled:cursor-not-allowed"}
                            >
                                <HiOutlineUserAdd size={18}/>
                                <p>{submitting ? "Creating..." : "Create user"}</p>
                            </button>
                        </div>
                    </div>
                </form>

                <div className={"flex flex-col w-full lg:w-96 shrink-0 space-y-4 lg:sticky lg:top-4"}>
                    <div className={"flex flex-col space-y-2"}>
                        <p className={"text-xs font-semibold tracking-wider text-gray-500 uppercase"}>Live preview</p>
                        <UserCard user={previewUser}/>
                    </div>

                    <div className={"flex flex-col bg-white rounded-2xl p-5 space-y-3"}>
                        <div className={"flex flex-row items-center space-x-2 text-primary"}>
                            <MdOutlineTipsAndUpdates size={20}/>
                            <h3 className={"font-semibold text-gray-800"}>Filling tips</h3>
                        </div>
                        <ul className={"flex flex-col space-y-2"}>
                            {tips.map((tip) => (
                                <li key={tip} className={"flex flex-row items-start space-x-2 text-sm text-gray-600"}>
                                    <FaRegHeart className={"mt-1 shrink-0 text-primary-300"} size={12}/>
                                    <p>{tip}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
