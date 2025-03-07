// pages/api/perspective-check.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { checkToxicity } from "../../helpers/perspectiveHelper";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { text } = req.body;
  if (typeof text !== "string") {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  try {
    const toxicity = await checkToxicity(text);
    res.status(200).json({ toxicity });
  } catch (error) {
    console.error("Perspective API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
