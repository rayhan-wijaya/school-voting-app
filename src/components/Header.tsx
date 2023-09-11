import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function Header() {
    const router = useRouter();
    const [currentTab, setCurrentTab] = useState<"voting" | "admin">();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(function () {
        setIsAdmin(document.cookie.indexOf("admin_session_token=") !== -1);
        setCurrentTab(router.pathname.startsWith("/admin") ? "admin" : "voting");
    }, [router]);

    return (
        <>
            <div className="flex items-center justify-center">
                <div className="font-semibold p-3 m-3 rounded-lg bg-sky-600 shadow-md text-white">
                    <img
                        className="rounded-lg h-40"
                        src="/backgrounds/header.png"
                    />
                </div>
            </div>

            {isAdmin && currentTab ? (
                <>
                    <div className="p-3" />

                    <div className="flex items-center justify-center">
                    <div className="inline-flex rounded-xl gap-3 items-center justify-center p-2 bg-gray-50">
                        <Link
                            className={`${
                                currentTab === "voting" ? "bg-sky-100 shadow-md" : "hover:bg-gray-100"
                            } py-3 px-5 rounded-xl`}
                            href="/"
                        >
                            Voting Page
                        </Link>
                        <Link
                            className={`${
                                currentTab === "admin" ? "bg-sky-100 shadow-md" : "hover:bg-gray-100"
                            } py-3 px-5 rounded-xl`}
                            href="/admin"
                        >
                            Admin Dashboard
                        </Link>
                    </div>
                    </div>

                    <div className="p-3" />
                </>
            ) : null}
        </>
    );
}

export default Header;
