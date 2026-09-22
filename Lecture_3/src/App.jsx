import { useState } from 'react'
import '@/App.css'
import { Header } from '@/modules/Header.jsx'
import { WelcomeComponent } from "@/modules/WelcomeComponent.jsx";
import { AboutMe } from "@/modules/AboutMe.jsx";
import { Experience } from "@/modules/Experience.jsx";
import { Projects } from "@/modules/Projects.jsx";
import { Footer } from "@/modules/Footer.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className={"flex flex-col space-y-24"}>
        <Header />
        <WelcomeComponent />
        <AboutMe />
        <Experience />
        <Projects />
        <Footer />
    </div>
  )
}

export default App
