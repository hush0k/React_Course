import { Button } from "@/modules/Button.jsx";

export function WelcomeComponent() {
    return (
        <div className={"flex flex-row justify-between items-start px-32"}>
            <div className={"flex flex-col max-w-[50%] space-y-8"}>
                <div className={"bg-jade-700 flex flex-row justify-center" +
                    " w-fit" +
                    " items-center space-x-2 px-4 py-1 rounded-lg"}>
                    <div className={"w-2 h-2 rounded-full bg-white"} />
                    <p className={"font-mono text-sm text-white"}>Hello World!</p>
                </div>
                <div className={"flex flex-col space-y-2"}>
                    <h1 className={"text-7xl font-black"}>Hello, my name is <span className={"text-jade-600"}>Kanysh</span></h1>

                    <p className={"text-3xl font-semibold text-gray-400"}>Backend [Java, Python] developer</p>
                </div>

                <p className={"text-gray-600"}>I develop backend systems. I work with various tech stacks such as FastAPI, Django and Spring Boot. I’m ready to get started :)</p>

                <div className={"flex flex-row space-x-4"}>
                    <Button
                        content={"Write to me"}
                    />

                    <Button
                        content={"Download CV"}
                        className={"bg-surface text-jade-600 border" +
                            " border-jade-600 hover:bg-jade-600" +
                            " hover:text-white"}
                    />
                </div>
            </div>

            <div className={"bg-amber-200 h-[30rem] w-[25rem] rounded-t-[12.5rem]" +
                " rounded-b-4xl border-24 border-jade-600 overflow-hidden"}>
                <img src="src/assets/avatar.jpg" alt="avatar" className="w-full h-full object-cover "/>
            </div>
        </div>
    )
}