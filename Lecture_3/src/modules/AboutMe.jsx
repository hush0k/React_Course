export function AboutMe() {
    const cards = [
        {title: "6 Projects", content: "More than 6 full projects with backend and frontend"},
        {title: "Internships", content: "Completed internships at leading Kazakhstani companies such as Kcell and Biometric.Vision."},
        {title: "High GPA", content: "Candidate for a Diploma with Honors, cumulative GPA 3.56."},
        {title: "2 Prod projects", content: "2 production level projects with 30-40 users daily"},
    ]

    return (
        <div id="aboutMe" className="bg-jade-back py-20 px-32 ">
            <p className={"text-jade-600 text-sm"}>01 / ABOUT ME</p>

            <h2 className={"text-3xl font-bold pt-1"}>Who am I?</h2>
            <div className={"flex flex-row justify-between items-start"}>
                <p className={"w-[40%] pt-6"}>Backend developer and 4th-year Information Systems student at KBTU, focused on Java (Spring Boot) and Python (FastAPI). During my internship at Kcell's Anti-Fraud Department, I shipped three projects to production: migrated a task-tracking system from Flask to async FastAPI with WebSocket notifications, built a knowledge base app with document linking and a knowledge graph, and automated Oracle queries, cutting response time from about 10 minutes to 11 seconds. I work with PostgreSQL, Redis, Kafka and Docker, and I'm interested in high-load systems, performance and monitoring. <br /><br />Currently looking for a Junior backend role where I can grow and build reliable systems.</p>

                <div className={"grid grid-cols-2 grid-rows-2 gap-6 w-[60%] pl-20"}>
                    {cards.map((card) => (
                        <div className={"bg-white p-5 rounded-xl space-y-2"} key={card.title}>
                            <h4 className={"text-jade-700 font-bold text-lg"}>{card.title}</h4>
                            <p className={"text-sm text-gray-600"}>{card.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}