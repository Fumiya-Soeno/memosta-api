import { verifyToken, refreshTokens } from "./token";

export async function authenticate(req) {
  const accessToken = req.headers["authorization"]?.split(" ")[1];
  const refreshToken = req.headers["x-refresh-token"];

  const {
    valid: accessValid,
    expired: accessExpired,
    decoded,
  } = verifyToken(accessToken, "access");

  if (accessValid && decoded?.userId) {
    // アクセストークンが有効で、userIdを取得できた場合
    return { userId: decoded.userId, accessToken, valid: true };
  } else if (accessExpired && refreshToken) {
    // アクセストークンの有効期限が切れており、リフレッシュトークンが提供されている場合
    const refreshResult = await refreshTokens(refreshToken);
    if (refreshResult.userUpdated) {
      return {
        userId: refreshResult.decoded.userId,
        accessToken: refreshResult.accessToken,
        valid: true,
      };
    }
  }

  // トークンが無効またはリフレッシュに失敗した場合
  return { valid: false };
}
