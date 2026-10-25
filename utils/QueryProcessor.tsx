export default function QueryProcessor(query: string): string {
  const lower = query.toLowerCase();

  if (lower.includes("shakespeare")) {
    return (
      "William Shakespeare (26 April 1564 - 23 April 1616) was an " +
      "English poet, playwright, and actor, widely regarded as the greatest " +
      "writer in the English language and the world's pre-eminent dramatist."
    );
  }

  if (lower.includes("andrew id")) {
    return "asyahput";
  }

  // e.g. "What is 89 plus 87?"
  const plusMatch = lower.match(/(-?\d+)\s+plus\s+(-?\d+)/);
  if (plusMatch) {
    return String(parseInt(plusMatch[1]) + parseInt(plusMatch[2]));
  }

  // e.g. "Which of the following numbers is the largest: 54, 47, 90?"
  if (lower.includes("largest")) {
    const numbers = (lower.match(/-?\d+/g) || []).map(Number);
    if (numbers.length > 0) {
      return String(Math.max(...numbers));
    }
  }

  if (lower.includes("name")) {
    return "Diki Tiki";
  }

  if (lower.includes("age")) {
    return "67";
  }

  return "";
}
