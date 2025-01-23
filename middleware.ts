import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken");

  // 非ログイン時に /login にリダイレクト
  if (!token && request.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// 対象とするルートを設定
export const config = {
  matcher: ["/", "/protected/:path*"], // 保護するルート
};
