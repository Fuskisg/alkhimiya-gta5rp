import React, { useEffect, useMemo, useState } from "react";
import { buildGuide, ruName, searchElements } from "./solver.js";

export default function App({ elements }) {
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("el") || "";
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(
    elements[initial] ? initial : ""
  );
  const [copied, setCopied] = useState(false);
  const cardNumber = "2202208228029584";

  async function copyCard() {
    try {
      await navigator.clipboard.writeText(cardNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Скопируйте номер карты:", "2202 2082 2802 9584");
    }
  }

  const list = useMemo(
    () => searchElements(elements, query),
    [elements, query]
  );

  const guide = selected ? buildGuide(elements, selected) : null;
  const current = selected ? elements[selected] : null;

  useEffect(() => {
    if (!selected) return;
    const url = new URL(window.location.href);
    url.searchParams.set("el", selected);
    window.history.replaceState({}, "", url);
  }, [selected]);

  return (
    React.createElement(
      "div",
      { className: "app" },
      React.createElement("header", { className: "hero" },
        React.createElement("p", { className: "eyebrow" }, "ГТА5 РП"),
        React.createElement("h1", null, "Химия GTA5RP"),
        React.createElement("p", { className: "lead" },
          "Все элементы по-русски. Найди нужный и получи пошаговый рецепт от воздуха, земли, огня и воды."
        ),
        React.createElement("aside", { className: "donation", "aria-label": "Поддержать сайт" },
          React.createElement("div", null,
            React.createElement("strong", null, "Поддержать проект"),
            React.createElement("p", null, "Если сайт оказался полезным, можно отправить любую сумму."),
            React.createElement("span", { className: "card-number" }, "2202 2082 2802 9584")
          ),
          React.createElement("button", { className: "copy-card", onClick: copyCard }, copied ? "Скопировано" : "Скопировать карту")
        ),
        React.createElement("label", { className: "search" },
          React.createElement("span", null, "Поиск"),
          React.createElement("input", {
            value: query,
            placeholder: "Жизнь, human, вулкан…",
            onChange: (e) => setQuery(e.target.value),
            autoFocus: true,
          })
        ),
        React.createElement("p", { className: "count" }, `${Object.keys(elements).length} элементов`)
      ),
      React.createElement("main", { className: "layout" },
        React.createElement("section", { className: "list-panel" },
          React.createElement("h2", null, "Элементы"),
          React.createElement("div", { className: "grid" },
            list.map((el) =>
              React.createElement(
                "button",
                {
                  key: el.en,
                  className: "chip" + (selected === el.en ? " active" : ""),
                  onClick: () => setSelected(el.en),
                },
                React.createElement("strong", null, el.ru),
                React.createElement("span", null, el.en)
              )
            )
          )
        ),
        React.createElement("section", { className: "detail" },
          !current && React.createElement("div", { className: "empty" },
            "Выбери элемент слева — справа появится кратчайший путь от базовых."
          ),
          current && React.createElement(React.Fragment, null,
            React.createElement("h2", null, current.ru),
            React.createElement("p", { className: "en" }, current.en),
            guide.kind === "base" && React.createElement("p", { className: "note" }, guide.note),
            guide.kind === "time" && React.createElement("p", { className: "note" }, guide.note),
            guide.kind === "blocked" && React.createElement("p", { className: "note warn" }, guide.note),
            guide.kind === "path" && React.createElement("div", { className: "steps" },
              React.createElement("h3", null, `Как сделать: ${guide.steps.length} шагов`),
              guide.usesTime && React.createElement("p", { className: "note" },
                "В пути используется Время — оно открывается само после 100 элементов."
              ),
              React.createElement("ol", null,
                guide.steps.map((step, i) =>
                  React.createElement("li", { key: step.result + i },
                    React.createElement("button", { className: "inline", onClick: () => setSelected(step.a) }, ruName(elements, step.a)),
                    " + ",
                    React.createElement("button", { className: "inline", onClick: () => setSelected(step.b) }, ruName(elements, step.b)),
                    " → ",
                    React.createElement("strong", null, ruName(elements, step.result))
                  )
                )
              )
            ),
            current.recipes.length > 0 && React.createElement("div", { className: "recipes" },
              React.createElement("h3", null, "Все прямые комбинации"),
              React.createElement("ul", null,
                current.recipes.map((pair, i) =>
                  React.createElement("li", { key: i },
                    React.createElement("button", { className: "inline", onClick: () => setSelected(pair[0]) }, ruName(elements, pair[0])),
                    " + ",
                    React.createElement("button", { className: "inline", onClick: () => setSelected(pair[1]) }, ruName(elements, pair[1]))
                  )
                )
              )
            )
          )
        )
      )
    )
  );
}
