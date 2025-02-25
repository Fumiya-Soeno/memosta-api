// components/CanvasContainer.tsx
"use client";

import React, { forwardRef } from "react";

interface CanvasContainerProps {
  onStart: () => void;
}

const CanvasContainer = forwardRef<HTMLDivElement, CanvasContainerProps>(
  ({ onStart }, ref) => {
    return (
      <div className="flex flex-col items-center">
        <div ref={ref} className="mb-4" />
        <button
          onClick={onStart}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Start
        </button>
      </div>
    );
  }
);

CanvasContainer.displayName = "CanvasContainer";

export default CanvasContainer;
