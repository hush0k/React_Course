import { FaLinkedin, FaGithub, FaSteam } from "react-icons/fa"
import { SiLeetcode } from "react-icons/si"

export function Footer() {
    const contacts = [
        {
            logo: <FaLinkedin size={24}/>,
            name: "LinkedIn",
            description: "Professional profile, experience and recommendations.",
            action: "Open LinkedIn",
            link: "https://www.linkedin.com/in/kanysh-omirzak/"
        },
        {
            logo: <FaGithub size={24}/>,
            name: "GitHub",
            description: "Source code of my projects and experiments.",
            action: "Open GitHub",
            link: "https://github.com/hush0k"
        },
        {
            logo: <SiLeetcode size={24}/>,
            name: "LeetCode",
            description: "Algorithm and data structure problem solving.",
            action: "Open LeetCode",
            link: "https://leetcode.com/u/hush0k/"
        },
        {
            logo: <FaSteam size={24}/>,
            name: "Steam",
            description: "Add me as a friend and let's play together.",
            action: "Open Steam",
            link: "https://steamcommunity.com/profiles/76561198970631389/"
        },
    ]

    const address = ["Milky Way Galaxy", "Solar System", "Planet Earth", "Eurasia", "Kazakhstan"]

    return (
        <footer id="contacts" className="py-20 px-32">
            <p className={"text-jade-600 text-sm uppercase"}>04 / Contacts</p>

            <h2 className={"text-3xl font-bold pt-1"}>Get in touch</h2>

            <div className={"flex flex-row flex-wrap items-center gap-2 pt-6 text-sm text-gray-500"}>
                <span className={"text-gray-800 font-bold"}>Address:</span>
                {address.map((place, index) => (
                    <span key={place}>
                        {place}
                        {index < address.length - 1 && <span className={"text-jade-600 pl-2"}>⭢</span>}
                    </span>
                ))}
            </div>

            <div className={"grid grid-cols-4 gap-6 mt-10"}>
                {contacts.map((contact) => (
                    <div className={"bg-white border border-line text-sm rounded-md flex flex-col p-5 space-y-4" +
                        " text-gray-500"} key={contact.name}>
                        <div className={"bg-jade-back text-jade-600 p-3 w-fit rounded-sm"}>{contact.logo}</div>
                        <h5 className={"font-bold text-xl text-gray-800"}>{contact.name}</h5>
                        <p className={"grow"}>{contact.description}</p>
                        <a href={contact.link}
                           target="_blank"
                           rel="noopener noreferrer"
                           className={"text-jade-600 font-medium hover:text-jade-700"}
                        >
                            {contact.action} ⭢
                        </a>
                    </div>
                ))}
            </div>

            <div className={"border-b border-line mt-16"}></div>
            <p className={"text-sm text-gray-500 pt-6"}>© {new Date().getFullYear()} Kanysh Omirzak</p>
        </footer>
    )
}
