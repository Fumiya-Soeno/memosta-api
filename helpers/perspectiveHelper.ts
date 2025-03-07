// helpers/perspectiveHelper.ts
export async function checkToxicity(text: string): Promise<number> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Perspective API key is not set");
  }
  const response = await fetch(
    `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comment: { text },
        requestedAttributes: { TOXICITY: {} },
      }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to call Perspective API");
  }
  const data = await response.json();
  const toxicity = data.attributeScores?.TOXICITY?.summaryScore?.value;
  return toxicity;
}
