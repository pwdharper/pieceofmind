import type { ThemeId } from "../domain/types";

export type CakeTheme = {
  id: ThemeId;
  labelKo: string;
  labelEn: string;
  vars: {
    "--bg": string;
    "--chip": string;
    "--accent": string;
    "--card-border": string;
    "--login-fill": string;
    "--cake-selected": string;
  };
};

export const CAKES: CakeTheme[] = [
  {
    id: "cream",
    labelKo: "생크림",
    labelEn: "Cream",
    vars: {
      "--bg": "#fffdf9",
      "--chip": "#fff8ee",
      "--accent": "#9d80a6",
      "--card-border": "#c9c0b5",
      "--login-fill": "#ebe1d2",
      "--cake-selected": "#d2c3aa",
    },
  },
  {
    id: "cheese",
    labelKo: "치즈",
    labelEn: "Cheese",
    vars: {
      "--bg": "#fff8e1",
      "--chip": "#fff0c2",
      "--accent": "#c4a035",
      "--card-border": "#e0d4a0",
      "--login-fill": "#ffe082",
      "--cake-selected": "#e0c48a",
    },
  },
];

export function applyCake(id: ThemeId) {
  const cake = CAKES.find((item) => item.id === id) ?? CAKES[0];
  const root = document.documentElement;
  Object.entries(cake.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  root.dataset.cake = cake.id;
}
