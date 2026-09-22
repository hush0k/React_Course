import {Button} from "@/modules/Button.jsx";

export function Header() {
    const links = [
        {id: "aboutMe", title: "About me"},
        {id: "experience", title: "Experience"},
        {id: "projects", title: "Projects"},
        {id: "contacts", title: "Contacts"},
    ]

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="sticky top-0 z-50 h-20 bg-white/70 backdrop-blur-md shadow-hover rounded-md flex flex-row items-center justify-between px-20">
            <h1 className={"font-logo text-2xl text-link cursor-pointer"}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>K. Omirzak</h1>

            <nav className={"space-x-4"}>
                {links.map((link) => (
                    <a className={"hover:text-jade-500 cursor-pointer"}
                       key={link.id}
                       onClick={() => scrollTo(link.id)}>{link.title}</a>
                ))}
            </nav>

            <Button
                className={"py-2"}
                content={"Contact me"}
                onClick={() => scrollTo("contacts")}
            />

        </div>
    )
}
