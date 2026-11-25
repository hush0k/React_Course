import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.jsx'
import {HashRouter} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store/store.js";
import { AuthProvider } from "@/context/AuthContext.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <HashRouter>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </HashRouter>
        </Provider>
    </StrictMode>,
)
