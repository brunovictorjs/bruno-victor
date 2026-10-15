/** Listas guardadas como JSON numa coluna de texto (compatível com SQLite e Postgres). */
export function parseStringList(raw: string | null | undefined): string[] {
  try {
    const value: unknown = JSON.parse(raw ?? '[]');
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}
