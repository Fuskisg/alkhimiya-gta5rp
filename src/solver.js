export function ruName(elements, name) {
  return elements[name]?.ru || name;
}

export function searchElements(elements, query) {
  const q = query.trim().toLowerCase();
  const list = Object.values(elements);
  if (!q) return list.sort((a, b) => a.ru.localeCompare(b.ru, "ru"));
  return list
    .filter(
      (el) =>
        el.ru.toLowerCase().includes(q) ||
        el.en.toLowerCase().includes(q)
    )
    .sort((a, b) => {
      const ar = a.ru.toLowerCase().startsWith(q) ? 0 : 1;
      const br = b.ru.toLowerCase().startsWith(q) ? 0 : 1;
      if (ar !== br) return ar - br;
      return a.ru.localeCompare(b.ru, "ru");
    });
}

const STARTERS = ["Air", "Earth", "Fire", "Water"];

export function buildGuide(elements, target) {
  const el = elements[target];
  if (!el) return { kind: "missing", steps: [], recipes: [] };
  if (el.base) {
    return {
      kind: "base",
      steps: [],
      recipes: [],
      note: `${el.ru} — базовый элемент. Есть с самого начала.`,
    };
  }
  if (el.special === "time") {
    return {
      kind: "time",
      steps: [],
      recipes: el.recipes,
      note: "Время появляется само, когда открыто 100 элементов (включая воздух, землю, огонь и воду).",
    };
  }

  function expand(useTime) {
    const known = new Set(STARTERS);
    if (useTime) known.add("Time");
    const chosen = {};
    let added = true;
    while (added && !known.has(target)) {
      added = false;
      for (const [name, item] of Object.entries(elements)) {
        if (known.has(name) || item.special === "time") continue;
        const recipe = (item.recipes || []).find(
          ([a, b]) => known.has(a) && known.has(b)
        );
        if (recipe) {
          chosen[name] = recipe;
          known.add(name);
          added = true;
        }
      }
    }
    return { known, chosen };
  }

  let { known, chosen } = expand(false);
  let usedTimeFallback = false;
  if (!known.has(target)) {
    ({ known, chosen } = expand(true));
    usedTimeFallback = true;
  }

  if (!known.has(target)) {
    return {
      kind: "blocked",
      steps: [],
      recipes: el.recipes,
      note: "Не удалось собрать путь только из базовых элементов. Смотри прямые рецепты ниже.",
    };
  }

  const steps = [];
  const seen = new Set();

  function walk(name) {
    if (STARTERS.includes(name) || name === "Time" || seen.has(name)) return;
    const recipe = chosen[name];
    if (!recipe) return;
    seen.add(name);
    walk(recipe[0]);
    walk(recipe[1]);
    steps.push({ result: name, a: recipe[0], b: recipe[1] });
  }

  walk(target);

  return {
    kind: "path",
    steps,
    recipes: el.recipes,
    usesTime:
      usedTimeFallback ||
      steps.some((s) => s.a === "Time" || s.b === "Time"),
  };
}
