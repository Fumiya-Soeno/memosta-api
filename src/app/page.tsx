"use client";

import { Template } from "./components/common/Template";
import { PixiCanvas } from "./components/PixiCanvas";

export default async function Home() {
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const response = await fetch(`${apiBaseUrl}/api/unit/show`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (response.ok) {
      const result = await response.json();
      const records = result.records;
      console.log(records);
    } else {
      const errorData = await response.json();
      console.log(errorData);
    }
  } catch (err) {
    console.log(err);
  }

  return (
    <Template>
      <PixiCanvas width={400} height={600} backgroundColor={0xffffff} />
    </Template>
  );
}
