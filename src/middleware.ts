import { NextResponse, type NextRequest } from "next/server";
import { validateSessionToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
    const adminSessionToken = request.cookies.get("admin_auth_token");

    if (
        !adminSessionToken ||
        !(await validateSessionToken(adminSessionToken.value))
    ) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
