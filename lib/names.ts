export function normalizeName(name: string) {
  return name
    .normalize("NFKC")
    .replace(/\u3000/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getNameMatchKey(name: string) {
  return normalizeName(name).replace(/\s+/g, "").toLocaleLowerCase("zh-CN");
}

export function buildNameMatchExpression(column: string) {
  return `LOWER(REPLACE(REPLACE(TRIM(${column}), '　', ''), ' ', ''))`;
}
