import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { z } from "zod";

function Header() {
    const router = useRouter();
    const [currentTab, setCurrentTab] = useState<"voting" | "admin">();

    useEffect(function () {
        const { tab } = router.query;

        const tabResult = z
            .enum(["voting", "admin"])
            .safeParse(tab);

        if (tabResult.success) {
            setCurrentTab(tabResult.data);
        }
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

            {currentTab ? (
                <>
                    <div className="flex gap-3 items-center justify-center p-8">
                        <Link
                            className={`${
                                currentTab === "voting" ? "bg-sky-100" : ""
                            } p-3 rounded-xl border-2 border-sky-100`}
                            href="/"
                        >
                            Voting Page
                        </Link>
                        <Link
                            className={`${
                                currentTab === "admin" ? "bg-sky-100" : ""
                            } p-3 rounded-xl border-2 border-sky-100`}
                            href="/admin"
                        >
                            Admin Dashboard
                        </Link>
                    </div>
                </>
            ) : null}
        </>
    );
}

export default Header;
