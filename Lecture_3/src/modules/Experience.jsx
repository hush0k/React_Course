export function Experience() {
    const jobs = [
        {
            time: "June 2026 - September 2026",
            position: "Full Stack Developer",
            company: "AO 'Kcell'",
            description:"Full Stack Developer Intern in the Anti-Fraud Department. Built and shipped three production projects: migrated a task tracker to async FastAPI with WebSocket, developed a knowledge base app, and automated Oracle queries, reducing response time from 10 minutes to 11 seconds."
        },
        {
            time: "November 2025 - April 2026",
            position: "Full Stack Developer",
            company: "LLP 'Kosma'",
            description: "Designed a modular database and backend architecture from scratch for ~200 users using FastAPI and async SQLAlchemy. Implemented JWT authentication with access/refresh tokens, Pydantic schemas with three-level validation, and complex business logic."
        },
        {
            time: "September 2025 - January 2026",
            position: "Teaching Assistant, Algorithms and Data Structures",
            company: "KBTU",
            description: "Helped around 50 students master course material, graded lab assignments for a group of 25, and proctored exams."
        },
        {
            time: "August 2025 - November 2025",
            position: "Developer Intern",
            company: "Biometric.Vision",
            description: "Studied the backend architecture and reviewed ~48 API endpoints, identifying improvements for 5 of them and implementing an optimized FastAPI solution under senior developers' guidance. Gained hands-on experience with Grafana monitoring."
        },
    ]

    return (
        <div id="experience" className="py-20 px-32 ">
            <p className={"text-jade-600 text-sm uppercase"}>02 / Experience</p>

            <h2 className={"text-3xl font-bold pt-1 pb-16"}>Professional Experience</h2>

            {jobs.map(job => (
                <div className={"flex flex-col space-y-8 mb-8"}>
                    <div className={"border-b border-line"}></div>
                    <div className={"flex flex-row items-start text-sm text-gray-500"}>
                        <p className={"w-[30%]"}>{job.time}</p>
                        <div className={"flex flex-col items-start w-[70%]"}>
                            <h4 className={"text-xl  font-bold"}>{job.position}</h4>
                            <p className={"text-jade-600 font-bold"}>{job.company}</p>
                            <p className={"pt-4"}>{job.description}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}