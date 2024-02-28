// http://localhost:3000/api/cards

export default function handler(req, res) {
  const API_KEY = process.env.API_KEY;
  const requestApiKey = req.headers["x-api-key"];

  console.log(requestApiKey);

  if (API_KEY && requestApiKey === API_KEY) {
    if (req.method === "POST") {
      res.setHeader("Access-Control-Allow-Credentials", true);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,OPTIONS,PATCH,DELETE,POST,PUT"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
      );

      // TODO: カード保存処理の実装

      res.status(200).json({ success: true, message: "Card created" });
    } else {
      // 他のHTTPメソッドの処理
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } else {
    // APIキーが不正
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
}
