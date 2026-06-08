export const categoryRegistry = {
  art: () => import("./art.js").then(m => m.default),
  vrchat: () => import("./vrchat.js").then(m => m.default),
};