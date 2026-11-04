import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout.jsx";
import { HomePage } from "@/pages/HomePage.jsx";

// Главная грузится сразу (её видят первой), остальные страницы — лениво,
// отдельными чанками. Страницы экспортируются по имени, поэтому
// оборачиваем модуль в { default: ... }, как требует React.lazy.
function lazyPage(load, name) {
    return lazy(() => load().then(module => ({default: module[name]})));
}

const TeamPage = lazyPage(() => import("@/pages/TeamPage.jsx"), "TeamPage");
const AcademyPage = lazyPage(() => import("@/pages/AcademyPage.jsx"), "AcademyPage");
const StadiumPage = lazyPage(() => import("@/pages/StadiumPage.jsx"), "StadiumPage");
const MarketPage = lazyPage(() => import("@/pages/MarketPage.jsx"), "MarketPage");
const PlayerPage = lazyPage(() => import("@/pages/PlayerPage.jsx"), "PlayerPage");
const HistoryPage = lazyPage(() => import("@/pages/HistoryPage.jsx"), "HistoryPage");
const NotFoundPage = lazyPage(() => import("@/pages/NotFoundPage.jsx"), "NotFoundPage");

// Только маршрутизация: вся логика — в hooks/useGame.js и layouts/RootLayout.jsx.
// <Suspense> для ленивых страниц стоит в RootLayout вокруг <Outlet />,
// чтобы шапка не пропадала, пока грузится чанк страницы.
function App() {
    return (
        <Routes>
            <Route element={<RootLayout />}>
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
