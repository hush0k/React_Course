import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout.jsx";
import { HomePage } from "@/pages/HomePage.jsx";
import { getToken } from "@/services/token.js";


function lazyPage(load, name) {
    return lazy(() => load().then(module => ({default: module[name]})));
}

const TeamPage = lazyPage(() => import("@/pages/TeamPage.jsx"), "TeamPage");
const AcademyPage = lazyPage(() => import("@/pages/AcademyPage.jsx"), "AcademyPage");
const StadiumPage = lazyPage(() => import("@/pages/StadiumPage.jsx"), "StadiumPage");
const MarketPage = lazyPage(() => import("@/pages/MarketPage.jsx"), "MarketPage");
const PlayerPage = lazyPage(() => import("@/pages/PlayerPage.jsx"), "PlayerPage");
const HistoryPage = lazyPage(() => import("@/pages/HistoryPage.jsx"), "HistoryPage");
const LoginPage = lazyPage(() => import("@/pages/LoginPage.jsx"), "LoginPage");
const RegisterPage = lazyPage(() => import("@/pages/RegisterPage.jsx"), "RegisterPage");
const NotFoundPage = lazyPage(() => import("@/pages/NotFoundPage.jsx"), "NotFoundPage");

function RequireAuth({children}) {
    return getToken() ? children : <Navigate to={"/login"} replace />;
}

function App() {
    return (
        <Routes>
            <Route path="login" element={<Suspense fallback={null}><LoginPage /></Suspense>} />
            <Route path="register" element={<Suspense fallback={null}><RegisterPage /></Suspense>} />
            <Route element={<RequireAuth><RootLayout /></RequireAuth>}>
                <Route index element={<HomePage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="academy" element={<AcademyPage />} />
                <Route path="stadium" element={<StadiumPage />} />
                <Route path="market" element={<MarketPage />} />
                <Route path="player/:id" element={<PlayerPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default App;
