import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";

const res = await fetch("./src/elements.json");
const elements = await res.json();
createRoot(document.getElementById("root")).render(
  React.createElement(App, { elements })
);
