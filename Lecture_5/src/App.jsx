import { Route, Routes } from 'react-router-dom'
import '@/App.css'
import { Header } from '@/features/ui/Header.jsx'
import { HomePage } from '@/pages/HomePage.jsx'
import { SideBar } from "@/features/ui/SideBar.jsx";
import {NotFoundPage} from "@/pages/404NotFoundPage.jsx";
import {CreateUserPage} from "@/pages/CreateUserPage.jsx";
import {EditUserPage} from "@/pages/EditUserPage.jsx";
import {UserProfilePage} from "@/pages/UserProfilePage.jsx";

function App() {
  return (
    <div className={"flex flex-col min-h-screen"}>
        <Header />
        <div className={"flex flex-col md:flex-row flex-1 min-w-0"}>
            <SideBar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path={"/users/new"} element={<CreateUserPage />} />
                <Route path={"/users/:id"} element={<UserProfilePage />} />
                <Route path={"/users/:id/edit"} element={<EditUserPage />} />
                <Route path={"*"} element={<NotFoundPage />} />
            </Routes>
        </div>
    </div>
  )
}

export default App
