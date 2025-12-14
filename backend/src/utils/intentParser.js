exports.analyzeQuery = (query) => {
  const now = new Date();
  const lower = query.toLowerCase();

  // Very simple future detection
  const futureKeywords = ["next month", "next year", "2026", "future", "tomorrow", "next week", "next day", "next month", "next year"];

  const isFuture = futureKeywords.some(k => lower.includes(k));

  return {
    isFuture
  };
};
