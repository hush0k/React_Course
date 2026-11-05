import { FiLock } from "react-icons/fi";
import { Button } from "@/components/Button.jsx";

export function LoginPage() {
    return (
        <section className={"container flex flex-col items-center justify-center py-16 lg:py-24"}>
            <div className={"w-full max-w-sm flex flex-col gap-6 rounded-md border border-border bg-background p-6 shadow-sm"}>
                <div className={"flex flex-col items-center gap-2 text-center"}>
                    <span className={"flex items-center justify-center size-12 rounded-full bg-primary text-secondary text-xl"}>
                        <FiLock />
                    </span>
                    <h1 className={"font-display font-bold uppercase text-3xl text-primary"}>Вход</h1>
                    <p className={"text-text-muted text-sm"}>Авторизация пока в разработке — скоро здесь можно будет войти в аккаунт.</p>
                </div>

                <form className={"flex flex-col gap-4"} onSubmit={e => e.preventDefault()}>
                    <label className={"flex flex-col gap-1 text-sm font-semibold"}>
                        Email
                        <input type={"email"} disabled placeholder={"manager@realmadrid.com"}
                               className={"rounded-md border border-border px-3 py-2 font-normal disabled:opacity-60 disabled:cursor-not-allowed"} />
                    </label>
                    <label className={"flex flex-col gap-1 text-sm font-semibold"}>
                        Пароль
                        <input type={"password"} disabled placeholder={"••••••••"}
                               className={"rounded-md border border-border px-3 py-2 font-normal disabled:opacity-60 disabled:cursor-not-allowed"} />
                    </label>
                    <Button type={"submit"} text={"Войти"} variant={"secondary"} disabled className={"w-full justify-center"} />
                </form>
            </div>
        </section>
    );
}
