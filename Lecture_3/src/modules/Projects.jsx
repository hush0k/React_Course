import { TbHexagonLetterMFilled } from "react-icons/tb"
import { GiPirateFlag } from "react-icons/gi"
import { FaHardHat } from "react-icons/fa"

export function Projects() {
    const projects = [
        {
            logo: <TbHexagonLetterMFilled size={24}/>,
            name: "Mergen",
            description: "Self-service query builder for the Nexign billing system via oracle_fdw, replacing manual engineer queries. Graph-based BFS resolver for table joins with SCD2 support, cutting data retrieval from 10 seconds to 1.",
            skills: ["Python", "FastAPI", "Asyncio", "Oracle", "PostgreSQL", "React"],
            link: "https://github.com/hush0k/Kcell_Mergen"
        },
        {
            logo: <GiPirateFlag size={24}/>,
            name: "Pirate Wars",
            description: "Pirate-themed web game built as independent Spring Boot services (players, battles, fleet, economy). Services communicate via OpenFeign and Kafka events, with JWT auth, PostgreSQL and Docker Compose.",
            skills: ["Java", "Spring Boot", "Kafka", "PostgreSQL", "Docker", "JUnit"],
            link: "https://github.com/hush0k/PirateTeam"
        },
        {
            logo: <FaHardHat size={24}/>,
            name: "Supervisor",
            description: "Task management SaaS for construction companies with four roles (Worker, Brigade Leader, Supervisor, Admin), task verification, and group tasks. Features a points-based KPI system, leaderboards, and an AI assistant, with RBAC, JWT and ~60 endpoints.",
            skills: ["Python", "FastAPI", "PostgreSQL", "JWT", "RBAC", "React"],
            link: "https://github.com/hush0k/Supervisor"
        },
    ]

    return (
        <div id="projects" className="bg-jade-back py-20 px-32 ">
            <p className={"text-jade-600 text-sm"}>03 / projects</p>

            <h2 className={"text-3xl font-bold pt-1"}>Featured Projects</h2>

            <div className="flex flex-row justify-between mt-10">
                {projects.map((project) => (
                    <div className={"bg-white border border-line text-sm rounded-md flex flex-col w-[20rem] p-5 space-y-4" +
                        " text-gray-500"}>
                        <div className={"bg-jade-back text-jade-600 p-3 w-fit rounded-sm"}>{project.logo}</div>
                        <h5 className={"font-bold text-xl text-gray-800"}>{project.name}</h5>
                        <p>{project.description}</p>
                        <div className={"flex flex-row flex-wrap gap-2"}>
                            {project.skills.map((skill) => (
                                <div className={"bg-jade-back text-jade-600 px-2 py-1 rounded-xl font-mono text-xs"}>{skill}</div>
                            ))}
                        </div>
                        <a href={project.link}
                           target="_blank"
                           rel="noopener noreferrer"
                           className={"text-jade-600 font-medium"}
                        >
                            Open in GitHub ⭢
                        </a>
                    </div>
                ))}
            </div>
        </div>
    )
}