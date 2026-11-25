# Football Club Manager
Веб игра для управления футбольным клубом. Пользователь играет за клуб: управляет составом, покупает и продаёт игроков, развивает академию и стадион, проводит сезон в Ла Лиге и Лиге чемпионов.

Демо: https://hush0k.github.io/React_Course/lecture4/

## Возможности

- Главная страница: следующий матч и шансы на победу, последние результаты, турнирные таблицы Ла Лиги и Лиги чемпионов, сетка плей-офф, задачи сезона, трофеи.
- Команда: состав с фильтрами по статусу и позиции, сортировкой, продажей игроков и сменой статуса; тренерский штаб.
- Страница игрока (`/player/:id`): подробная информация, характеристики, действия с игроком.
- Трансферный рынок: поиск, фильтры, сортировка и пагинация на стороне сервера.
- Академия: создание воспитанника через форму, выбор тренировок с учётом лимита нагрузки, перевод в основной состав.
- Стадион: улучшения инфраструктуры.
- История: итоги прошлых сезонов.
- Смена недель и сезонов, увольнение при провале задач сезона, перезапуск игры.

## Стек

- React 19
- React Router 7 (HashRouter)
- Redux Toolkit + React Redux
- Vite
- Tailwind CSS 4
- ESLint

## Запуск

Требуется Node.js 20 или новее.

```
npm install
npm run dev
```

По умолчанию приложение обращается к API по адресу `http://localhost:8000`. Другой адрес задаётся переменной окружения `VITE_API_URL`, например в файле `.env.local`:

```
VITE_API_URL=http://localhost:8000
```

Для production-сборки адрес берётся из `.env.production`.

## Сборка и деплой

```
npm run build     # сборка в папку dist
npm run preview   # локальный просмотр сборки
npm run lint      # проверка ESLint
npm run deploy    # сборка и публикация на GitHub Pages
```

## Структура

```
src/
  services/     запросы к серверу и преобразование данных
  store/        Redux: слайсы, селекторы, store.js
  hooks/        useGame — состояние игры и действия
  context/      AuthContext — авторизация
  components/   переиспользуемые компоненты
  lib/          справочники и вспомогательные функции
  pages/        страницы приложения
  App.jsx       маршруты и общее состояние игры
  main.jsx      точка входа
```

## Сервер

Бэкенд написан на FastAPI и находится в отдельном репозитории. Production API: https://football-club-backend-livo.onrender.com

Бесплатный сервер на Render засыпает без запросов, поэтому первая загрузка может занять до минуты.

## Аутентификация

Вместо Firebase используется собственный бэкенд (JWT + Google OAuth) — замена согласована с преподавателем.

- `src/context/AuthContext.jsx` — `AuthProvider` и `useAuth()`: `user` (`uid`, `username`), `loading`, `error`, `login`, `signup`, `loginWithGoogle`, `logout`. Сессия восстанавливается из JWT при загрузке и переживает перезагрузку страницы; просроченный токен сбрасывается.
- Маршруты: `/login`, `/signup`, `/profile` (защищённый, показывает логин и UID из JWT, кнопка выхода). Неавторизованных `RequireAuth` перенаправляет на `/login`.
- NavBar: гость видит «Войти» / «Регистрация», авторизованный — «Профиль» / «Выйти».
- При входе, регистрации и выходе Redux-стор сбрасывается (`resetStore`), чтобы данные одного пользователя не попали к другому.

## Переменные окружения

Скопируйте `.env.example` в `.env.local` и заполните:

| Переменная | Назначение |
| --- | --- |
| `VITE_API_URL` | адрес бэкенда |
| `VITE_GOOGLE_CLIENT_ID` | публичный Google OAuth client ID |

## Redux Toolkit

Состояние хранится в Redux (`configureStore` + `Provider` в `src/main.jsx`), UI-компоненты используют `useSelector` / `useDispatch` и не делают `fetch` напрямую.

### Слайсы (`src/store/`)

| Слайс | Файл | Состояние |
| --- | --- | --- |
| `game` | `gameSlice.js` | данные игры (`finance`, `squad`, `market`, `staff`, `upgrades`, `upcoming`, `matches`, `standings`, `stats`, `season`, `objectives`, `power`, `trophies`), `status`, `currentRequestId`, `loadError`, `actionError`, `weekLoading`, `seasonLoading` |
| `history` | `historySlice.js` | `seasons`, `status`, `currentRequestId` |
| `publicData` | `publicDataSlice.js` | `data` (таблица и рынок из кэша), `status` |
| `player` | `playerSlice.js` | `id`, `player`, `status` |
| `market` | `marketSlice.js` | `players`, `total`, `params`, `status` |
| `academy` | `academySlice.js` | `academy`, `status`, `currentRequestId`, `mutationStatus`, `mutationError` |

Локальный UI-стейт (диалоги, поля форм, `restartConfirmOpen`, `seasonResultClosed`) остаётся в компонентах, авторизация — в `AuthContext`. Хук `useGame` — тонкая обёртка над `useSelector` / `useDispatch`.

### Thunks (`createAsyncThunk`)

| Thunk | Тип | Назначение |
| --- | --- | --- |
| `loadGame` | список | все данные игры; после успеха диспатчит `refreshAll` |
| `loadMarket` | список | рынок: поиск, фильтры, сортировка, страница |
| `loadAcademy` | список | воспитанники академии |
| `loadHistory` | список | итоги прошлых сезонов |
| `loadPublicData` | список | сохранённые данные для офлайна |
| `loadPlayer` | детали | игрок по `id` |
| `promoteYouth` | мутация | перевод воспитанника в основной состав |
| `changeTraining` | мутация | смена тренировки воспитанника |
| `runQueuedAction` | мутация | покупка/продажа/повышение/улучшение стадиона: очередь запросов, синхронизация один раз после очереди |
| `nextWeek`, `nextSeason`, `restartGame` | мутация | ход недели, новый сезон, перезапуск игры |
| `refreshAll` | обновление | перезагрузка открытых `market`, `player`, `academy`, `history` |

Оптимистичные изменения (`optimisticSell`, `optimisticBuy`, `optimisticPromote`, `optimisticUpgrade`) применяются в reducers сразу; при ошибке данные откатываются повторным `loadGame`.

Каждый thunk обрабатывается в `extraReducers` (`pending` / `fulfilled` / `rejected`): для `loadGame`, `loadMarket` и т. п. — статус и данные, для мутаций — `mutationStatus` / `mutationError` (`academy`) или `actionError`, `weekLoading`, `seasonLoading` (`game`). `refreshAll` — составной thunk без собственного состояния, он диспатчит перечисленные load-thunks.

### Селекторы (`src/store/selectors.js`)

| Селектор | Мемоизация | Назначение |
| --- | --- | --- |
| `selectMarketStatus` | нет | статус загрузки рынка |
| `selectGame` | нет | состояние слайса `game` |
| `selectMarketView` | `createSelector` | игроки, страницы и признак «пусто» для рынка |
| `selectSimilarPlayers` | `createSelector` | похожие игроки на странице игрока |
| `selectSeasonOver` | `createSelector` | сезон завершён |
| `selectSeasonResult` | `createSelector` | итог сезона (`win` / `lose` / ...) |
| `selectGameDate` | `createSelector` | дата ближайшего тура |
| `selectUpcomingMatches` | `createSelector` | матчи ближайшего тура |

### Защита от устаревших ответов

В `pending` слайс запоминает `currentRequestId`; `fulfilled` / `rejected` с другим `requestId` игнорируются. Запросы рынка и игрока дополнительно получают `AbortSignal` и отменяются при новом запросе или уходе со страницы.

### Состояния и обновление данных

- На каждой странице обрабатываются loading / error / empty; при ошибке кнопка «Повторить» заново вызывает thunk.
- После любой мутации (покупка/продажа, повышение из академии, создание игрока, тренировки, улучшение стадиона, следующая неделя, новый сезон, перезапуск) диспатчится `loadGame`: он один раз перезагружает данные игры и затем через `refreshAll` — только уже открытые срезы (без дублирующих запросов).
- При входе и выходе диспатчится `resetStore`, и все слайсы возвращаются в начальное состояние.

## Деплой

- Демо: https://hush0k.github.io/React_Course/lecture4/

Параметры поиска и фильтров рынка, debounce, сортировка, пагинация, авторизация, защищённые маршруты, PWA и офлайн-режим сохранены.
