let pool = [];

function getColumnCount(width) {
  if (width < 700) return 2;
  if (width < 1100) return 3;
  return 4;
}

function computeLayout(pool, width) {
  const columnCount = getColumnCount(width);

  const GAP = 12;
  const colW = (width - GAP * (columnCount - 1)) / columnCount;

  const heights = Array(columnCount).fill(0);
  const layout = [];

  for (let i = 0; i < pool.length; i++) {
    const item = pool[i];

    // IMPORTANT: real ratio (fallback = 1)
    const ratio = item.ratio || 1;

    const h = colW * ratio;

    let col = 0;
    let min = heights[0];

    for (let c = 1; c < columnCount; c++) {
      if (heights[c] < min) {
        min = heights[c];
        col = c;
      }
    }

    const x = col * (colW + GAP);
    const y = heights[col];

    heights[col] += h + GAP;

    layout.push({
      i,
      src: item.src,
      x,
      y,
      w: colW,
      h
    });
  }

  return {
    layout,
    totalHeight: Math.max(...heights)
  };
}

self.onmessage = (e) => {
  const { type, data } = e.data;

  if (type === "INIT") {
    pool = data.pool || [];
  }

  if (type === "LAYOUT") {
    const result = computeLayout(pool, data.width);

    self.postMessage({
      type: "LAYOUT_RESULT",
      layout: result.layout,
      totalHeight: result.totalHeight
    });
  }
};