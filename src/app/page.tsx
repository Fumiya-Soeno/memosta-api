"use client";

import { Template } from "./components/common/Template";
import { PixiCanvas } from "./components/PixiCanvas";

export default async function Home() {
  return (
    <Template>
      <PixiCanvas width={400} height={600} backgroundColor={0xffffff} />
    </Template>
  );
}
