export function joinedCharactersName(rows) {
  const grouped = rows.reduce((acc, item) => {
    if (!acc[item.id]) {
      acc[item.id] = [];
    }
    acc[item.id].push(item);
    return acc;
  }, {});

  const joinedName = Object.entries(grouped).map(([id, group]) => ({
    id: parseInt(id, 10),
    name: group
      .sort((a, b) => a.position - b.position)
      .map((item) => item.name)
      .join(""),
  }));

  return joinedName;
}

export const charNameColorClasses = {
  火: "text-red-600",
  水: "text-blue-600",
  木: "text-green-600",
};
