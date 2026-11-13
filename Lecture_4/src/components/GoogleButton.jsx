import { useEffect, useRef } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_SCRIPT = "https://accounts.google.com/gsi/client";

function loadGoogleScript() {
    if (window.google?.accounts?.id) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT}"]`);
        const script = existing ?? document.createElement("script");
        script.addEventListener("load", resolve);
        script.addEventListener("error", reject);
        if (!existing) {
            script.src = GOOGLE_SCRIPT;
            script.async = true;
            document.head.appendChild(script);
        }
    });
}

export function GoogleButton({ onCredential, disabled }) {
    const containerRef = useRef(null);
    const callbackRef = useRef(onCredential);

    useEffect(() => {
        callbackRef.current = onCredential;
    }, [onCredential]);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;
        let cancelled = false;
        loadGoogleScript().then(() => {
            if (cancelled || !containerRef.current) return;
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: response => callbackRef.current(response.credential),
            });
            window.google.accounts.id.renderButton(containerRef.current, {
                theme: "outline",
                size: "large",
                text: "continue_with",
                locale: "ru",
                width: containerRef.current.offsetWidth,
            });
        }).catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    if (!GOOGLE_CLIENT_ID) return null;

    return (
        <>
            <div className={"flex items-center gap-3 text-sm text-text-muted"}>
                <span className={"h-px flex-1 bg-border"} />
                или
                <span className={"h-px flex-1 bg-border"} />
            </div>
            <div
                ref={containerRef}
                className={`flex w-full justify-center ${disabled ? "pointer-events-none opacity-50" : ""}`}
            />
        </>
    );
}
