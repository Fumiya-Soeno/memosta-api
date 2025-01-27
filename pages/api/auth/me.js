// /pages/api/auth/me.js
export default function handler(req, res) {
  // クッキーからトークンを確認 (例: 'accessToken' クッキー)
  const token = req.cookies.accessToken;

  if (token) {
    return res.status(200).json({ loggedIn: true });
  } else {
    return res.status(200).json({ loggedIn: false });
  }
}
