import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const adminSessionToken = request.cookies.get("admin_session_token");

    if (!adminSessionToken) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
