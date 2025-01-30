import jwt from "jsonwebtoken";

/**
 * JWT を検証し、ユーザーIDを取得する関数
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {Object} res - レスポンスオブジェクト（リフレッシュ時にクッキーをセット）
 * @returns {number | null} userId
 */
export async function authenticateUser(accessToken, refreshToken, res) {
  if (!accessToken) {
    throw { status: 401, message: "認証エラー: トークンがありません" };
  }

  try {
    // accessToken を検証
    const decoded = jwt.verify(accessToken, process.env.ACCESS_SECRET);
    return decoded.userId;
  } catch (error) {
    if (error.name === "TokenExpiredError" && refreshToken) {
      try {
        // refreshToken を検証
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.REFRESH_SECRET
        );
        const userId = decodedRefresh.userId;

        // 新しい accessToken を発行
        const newAccessToken = jwt.sign({ userId }, process.env.ACCESS_SECRET, {
          expiresIn: "1h",
        });

        // クッキーを更新
        res.setHeader(
          "Set-Cookie",
          `accessToken=${newAccessToken}; HttpOnly; Path=/; Secure; SameSite=Strict`
        );

        return userId;
      } catch (refreshError) {
        throw {
          status: 403,
          message: "認証エラー: リフレッシュトークンが無効",
        };
      }
    }
    throw { status: 401, message: "認証エラー: 無効なトークン" };
  }
}
