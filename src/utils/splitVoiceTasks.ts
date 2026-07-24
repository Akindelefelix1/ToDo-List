const CONNECTOR_PATTERN =
  /\s+(?:and then|then|after that|also|plus)\s+|[;,]|\.(?:\s+|$)/gi;

const LEADING_PHRASE =
  /^(?:please\s+)?(?:add|create|remember to|remind me to|i need to|i have to|task(?: is)?|todo(?: is)?|to do)\s+/i;

function normalizeTask(value: string) {
  return value
    .replace(LEADING_PHRASE, '')
    .replace(/^(?:and|then)\s+/i, '')
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/, '')
    .trim();
}

export function splitVoiceTasks(transcript: string): string[] {
  const normalized = transcript.trim();
  if (!normalized) {
    return [];
  }

  const explicitParts = normalized
    .split(CONNECTOR_PATTERN)
    .map(normalizeTask)
    .filter(Boolean);

  if (explicitParts.length > 1) {
    return [...new Set(explicitParts)];
  }

  // A simple "X and Y" usually represents two dictated actions. Avoid splitting
  // common noun phrases such as "bread and milk" unless each side starts with a verb.
  const andParts = normalized.split(/\s+and\s+/i).map(normalizeTask).filter(Boolean);
  if (
    andParts.length > 1 &&
    andParts.every(part =>
      /^(?:buy|call|send|email|pay|pick|book|clean|finish|submit|visit|make|check|water|walk|read|write|schedule|collect|prepare|review|order)\b/i.test(
        part,
      ),
    )
  ) {
    return [...new Set(andParts)];
  }

  return [normalizeTask(normalized)];
}
