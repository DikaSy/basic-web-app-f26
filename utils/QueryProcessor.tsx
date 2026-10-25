// Square-and-multiply, since tsconfig targets es5 and `**` isn't allowed on bigint
function bigPow(base: bigint, exponent: bigint): bigint {
  const zero = BigInt(0);
  const one = BigInt(1);
  const two = BigInt(2);
  let result = one;
  while (exponent > zero) {
    if (exponent % two === one) {
      result *= base;
    }
    base *= base;
    exponent /= two;
  }
  return result;
}

// Evaluates expressions like "81 plus 38 plus 66" or "90 to the power of 82".
// Uses BigInt so large powers stay exact. Returns null if it isn't arithmetic.
function evaluateArithmetic(expression: string): string | null {
  const normalized = expression
    .replace(/to the power of/g, "^")
    .replace(/multiplied by|times/g, "*")
    .replace(/divided by/g, "/")
    .replace(/plus/g, "+")
    .replace(/minus/g, "-");

  const tokens = normalized.match(/\d+|[+\-*/^]/g);
  if (!tokens || tokens.length < 3 || tokens.length % 2 === 0) {
    return null;
  }

  // Tokens must alternate: number, operator, number, ...
  for (let i = 0; i < tokens.length; i++) {
    const isNumber = /^\d+$/.test(tokens[i]);
    if (isNumber !== (i % 2 === 0)) {
      return null;
    }
  }

  let pos = 0;
  const parseNumber = (): bigint => BigInt(tokens[pos++]);

  // Power is right-associative and binds tightest
  const parsePower = (): bigint => {
    const base = parseNumber();
    if (tokens[pos] === "^") {
      pos++;
      return bigPow(base, parsePower());
    }
    return base;
  };

  const parseTerm = (): bigint => {
    let value = parsePower();
    while (tokens[pos] === "*" || tokens[pos] === "/") {
      const op = tokens[pos++];
      const right = parsePower();
      value = op === "*" ? value * right : value / right;
    }
    return value;
  };

  const parseExpression = (): bigint => {
    let value = parseTerm();
    while (tokens[pos] === "+" || tokens[pos] === "-") {
      const op = tokens[pos++];
      const right = parseTerm();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  };

  try {
    return parseExpression().toString();
  } catch {
    // e.g. division by zero
    return null;
  }
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

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

  // e.g. "What is 89 plus 87?", "What is 23 minus 75?", "What is 90 to the power of 82?"
  const whatIsMatch = lower.match(/what is (.+?)\??$/);
  if (whatIsMatch) {
    const result = evaluateArithmetic(whatIsMatch[1]);
    if (result !== null) {
      return result;
    }
  }

  // e.g. "Which of the following numbers is the largest: 54, 47, 90?"
  if (lower.includes("largest")) {
    const numbers = (lower.match(/-?\d+/g) || []).map(Number);
    if (numbers.length > 0) {
      return String(Math.max(...numbers));
    }
  }

  // e.g. "Which of the following numbers are primes: 41, 28, 52, 94, 96?"
  if (lower.includes("prime")) {
    const numbers = (lower.match(/\d+/g) || []).map(Number);
    return numbers.filter(isPrime).join(", ");
  }

  // e.g. "Which of the following is an anagram of listen: google, inlets, banana, enlists?"
  const anagramMatch = lower.match(/anagram of (\w+):\s*(.+?)\??$/);
  if (anagramMatch) {
    const sortLetters = (word: string) => word.split("").sort().join("");
    const target = sortLetters(anagramMatch[1]);
    return anagramMatch[2]
      .split(",")
      .map((word) => word.trim())
      .filter((word) => word !== anagramMatch[1] && sortLetters(word) === target)
      .join(", ");
  }

  if (lower.includes("name")) {
    return "Diki Tiki";
  }

  if (lower.includes("age")) {
    return "67";
  }

  return "";
}
