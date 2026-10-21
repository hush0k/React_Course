// Shared form controls. All extra props (name, value, onChange, ...) are passed to the native element.

export function FormLabel({label, required, hint}) {
    return (
        <div className={"flex flex-row items-center justify-between"}>
            <label className={"text-sm font-medium text-gray-700"}>
                {label} {required && <span className={"text-red-500"}>*</span>}
            </label>
            {hint && <span className={"text-xs text-gray-400"}>{hint}</span>}
        </div>
    )
}

export function FormInput({label, required, icon, error, ...props}) {
    return (
        <div className={"flex flex-col space-y-1.5"}>
            {label && <FormLabel label={label} required={required}/>}
            <div className={"flex flex-row items-center bg-gray-100 rounded-lg px-3 space-x-2 text-gray-500" +
                " focus-within:ring-2 focus-within:ring-primary-200"}>
                {icon}
                <input
                    className={"w-full bg-transparent py-2.5 text-gray-800 outline-none placeholder:text-gray-400"}
                    {...props}
                />
            </div>
            {error && <p className={"text-xs text-red-500"}>{error}</p>}
        </div>
    )
}

export function FormTextarea({label, required, hint, error, rows = 4, ...props}) {
    return (
        <div className={"flex flex-col space-y-1.5"}>
            {label && <FormLabel label={label} required={required} hint={hint}/>}
            <textarea
                rows={rows}
                className={"w-full bg-gray-100 rounded-lg px-3 py-2.5 text-gray-800 outline-none resize-none" +
                    " placeholder:text-gray-400 focus:ring-2 focus:ring-primary-200"}
                {...props}
            />
            {error && <p className={"text-xs text-red-500"}>{error}</p>}
        </div>
    )
}

export function FormSelect({label, required, options = [], error, ...props}) {
    return (
        <div className={"flex flex-col space-y-1.5"}>
            {label && <FormLabel label={label} required={required}/>}
            <select
                className={"w-full bg-gray-100 rounded-lg px-3 py-2.5 text-gray-800 outline-none cursor-pointer" +
                    " focus:ring-2 focus:ring-primary-200"}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            {error && <p className={"text-xs text-red-500"}>{error}</p>}
        </div>
    )
}

export function FormCheckbox({label, description, ...props}) {
    return (
        <label className={"flex flex-row items-start space-x-3 cursor-pointer"}>
            <input type={"checkbox"} className={"mt-1 h-4 w-4 accent-primary cursor-pointer"} {...props}/>
            <div className={"flex flex-col"}>
                <p className={"font-semibold text-gray-800"}>{label}</p>
                {description && <p className={"text-sm text-gray-500"}>{description}</p>}
            </div>
        </label>
    )
}

export function FormToggle({label, description, icon, checked, ...props}) {
    return (
        <label className={"flex flex-row items-center justify-between bg-gray-100 rounded-xl px-4 py-3 cursor-pointer"}>
            <div className={"flex flex-row items-center space-x-3"}>
                {icon && <span className={"text-primary"}>{icon}</span>}
                <div className={"flex flex-col"}>
                    <p className={"font-semibold text-gray-800 text-sm"}>{label}</p>
                    {description && <p className={"text-xs text-gray-500"}>{description}</p>}
                </div>
            </div>
            <input type={"checkbox"} className={"peer sr-only"} checked={checked} {...props}/>
            <span className={"relative h-6 w-11 shrink-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-primary" +
                " after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white" +
                " after:transition-transform peer-checked:after:translate-x-5"}/>
        </label>
    )
}

export function FormSection({title, icon, children}) {
    return (
        <div className={"flex flex-col space-y-4"}>
            <div className={"flex flex-row items-center space-x-2 text-primary"}>
                {icon}
                <h3 className={"text-lg font-semibold text-gray-800"}>{title}</h3>
            </div>
            {children}
        </div>
    )
}
