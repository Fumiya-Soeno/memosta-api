// helpers/api.js
export async function fetchApi(
  endpoint,
  method = "GET",
  onSuccess,
  onError,
  body = null
) {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const response = await fetch(`${apiBaseUrl}/api${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: body ? JSON.stringify(body) : null,
    });

    if (response.ok) {
      const result = await response.json();
      onSuccess(result);
    } else {
      const errorData = await response.json();
      if (onError) {
        onError(errorData);
      } else {
        console.error("APIエラー:", errorData);
      }
    }
  } catch (error) {
    if (onError) {
      onError(error);
    } else {
      console.error("ネットワークエラー:", error);
    }
  }
}
