import { FiSearch } from "react-icons/fi";
import { MdSort } from "react-icons/md";

const cityOptions = [
    { value: "", label: "All cities" },
    { value: "Almaty", label: "Almaty" },
    { value: "Astana", label: "Astana" },
    { value: "Berlin", label: "Berlin" },
    { value: "Buenos Aires", label: "Buenos Aires" },
    { value: "Chicago", label: "Chicago" },
    { value: "Dubai", label: "Dubai" },
    { value: "Lisbon", label: "Lisbon" },
    { value: "London", label: "London" },
    { value: "Madrid", label: "Madrid" },
    { value: "Milan", label: "Milan" },
    { value: "Monaco", label: "Monaco" },
    { value: "Moscow", label: "Moscow" },
    { value: "New York", label: "New York" },
    { value: "Paris", label: "Paris" },
    { value: "Prague", label: "Prague" },
    { value: "Seoul", label: "Seoul" },
    { value: "Shymkent", label: "Shymkent" },
    { value: "Sydney", label: "Sydney" },
    { value: "Tokyo", label: "Tokyo" },
    { value: "Washington", label: "Washington" },
];

const professionOptions = [
    { value: "", label: "All professions" },
    { value: "Actor", label: "Actor" },
    { value: "Airline Captain", label: "Airline Captain" },
    { value: "Architect", label: "Architect" },
    { value: "Backend Developer", label: "Backend Developer" },
    { value: "Ballerina", label: "Ballerina" },
    { value: "Biologist", label: "Biologist" },
    { value: "Esports Player", label: "Esports Player" },
    { value: "Financial Analyst", label: "Financial Analyst" },
    { value: "Football Coach", label: "Football Coach" },
    { value: "Guitarist", label: "Guitarist" },
    { value: "Illustrator", label: "Illustrator" },
    { value: "Journalist", label: "Journalist" },
    { value: "Judge", label: "Judge" },
    { value: "Math Teacher", label: "Math Teacher" },
    { value: "Pastry Chef", label: "Pastry Chef" },
    { value: "Race Engineer", label: "Race Engineer" },
    { value: "Security Guard", label: "Security Guard" },
    { value: "Software Developer", label: "Software Developer" },
    { value: "Surgeon", label: "Surgeon" },
    { value: "Veterinarian", label: "Veterinarian" },
];

const sortOptions = [
    { value: "name", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "age", label: "Age (young first)" },
    { value: "age-desc", label: "Age (old first)" },
];

const statusOptions = [
    { value: "", label: "All users" },
    { value: "married", label: "Married" },
    { value: "single", label: "Not married" },
];

const selectClass = "h-12 bg-gray-100 rounded-xl px-4 font-semibold text-gray-800 outline-none cursor-pointer" +
    " focus:ring-2 focus:ring-primary-200";

export function UserFilters({search = "", city = "", profession = "", status = "", sort = "name", total = 0, onChange}) {
    function handleChange(event) {
        onChange?.(event.target.name, event.target.value);
    }

    return (
        <div className={"flex flex-col bg-white rounded-xl py-5 px-4 sm:px-6 space-y-4"}>
            <div className={"flex flex-row flex-wrap gap-3"}>
                <div className={"flex flex-row items-center flex-1 min-w-full sm:min-w-64 h-12 bg-gray-100 rounded-xl px-4" +
                    " space-x-3 text-gray-500 focus-within:ring-2 focus-within:ring-primary-200"}>
                    <FiSearch size={20}/>
                    <input
                        type={"text"}
                        name={"search"}
                        value={search}
                        onChange={handleChange}
                        placeholder={"Search by name or description..."}
                        className={"w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400"}
                    />
                </div>

                <select name={"profession"} value={profession} onChange={handleChange} className={selectClass + " flex-1 sm:flex-none"}>
                    {professionOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>

                <select name={"city"} value={city} onChange={handleChange} className={selectClass + " flex-1 sm:flex-none"}>
                    {cityOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>

                <div className={"flex flex-row items-center bg-gray-100 rounded-xl pr-4 text-gray-600"}>
                    <select name={"sort"} value={sort} onChange={handleChange} className={selectClass + " bg-transparent"}>
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                    <MdSort size={20}/>
                </div>
            </div>

            <div className={"flex flex-col sm:flex-row sm:items-center justify-between gap-3"}>
                <div className={"flex flex-row flex-wrap items-center gap-2"}>
                    <p className={"text-xs font-semibold tracking-wider text-gray-500 uppercase mr-1"}>Status:</p>
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            type={"button"}
                            onClick={() => onChange?.("status", option.value)}
                            className={`${status === option.value ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}` +
                                " px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer"}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <p className={"text-sm text-gray-500"}>
                    Found: <span className={"font-bold text-gray-800"}>{total} users</span>
                </p>
            </div>
        </div>
    )
}
