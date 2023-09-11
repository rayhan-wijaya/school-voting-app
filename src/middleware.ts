import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;

    const isAdminPage = url.pathname.startsWith("/admin");

    if (isAdminPage && !request.cookies.get("admin_session_token")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const newTab = isAdminPage ? "admin" : "voting";
    url.searchParams.set("tab", newTab);

    return NextResponse.rewrite(url);
}
