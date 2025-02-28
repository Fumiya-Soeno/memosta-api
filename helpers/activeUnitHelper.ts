// activeUnitHelper.ts
export function getActiveUnitId(): number | null {
  const stored = localStorage.getItem("activeUnitId");
  return stored ? Number(stored) : null;
}

export function setActiveUnitIdClient(unitId: number): void {
  localStorage.setItem("activeUnitId", unitId.toString());
}
