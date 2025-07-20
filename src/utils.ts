export function categorizeEvents(
  title: string,
  notes?: string
): "work" | "personal" | "other" {
  const workKeywords = ["meeting", "deadline", "project", "report"];
  const personalKeywords = [
    "birthday",
    "friend",
    "holiday",
    "anniversary",
    "personal",
    "family",
    "vacation",
    "appointment",
  ];
  const lowerTitle = title.toLowerCase();
  const lowerNotes = notes ? notes.toLowerCase() : "";

  for (const keyword of workKeywords) {
    if (lowerTitle.includes(keyword) || lowerNotes.includes(keyword)) {
      return "work";
    }
  }

  for (const keyword of personalKeywords) {
    if (lowerTitle.includes(keyword) || lowerNotes.includes(keyword)) {
      return "personal";
    }
  }
  return "other";
}
