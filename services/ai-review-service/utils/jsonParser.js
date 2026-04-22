export function extractJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : null;
  } catch {
    return null;
  }
}