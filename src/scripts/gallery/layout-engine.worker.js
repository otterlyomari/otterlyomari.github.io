let pool = [];
let pendingSeq = 0;

function getColumnCount(width) {
  if (width < 700) return 2;
  if (width < 1100) return 3;
  return 4;
}

function computeLayout(pool, width) {
  if (!Array.isArray(pool) || pool.length === 0) {
    return { layout: [], totalHeight: 0 };
  }

  const columnCount = getColumnCount(width);
  const GAP = 14;

  const colW = (width - GAP * (columnCount - 1)) / columnCount;

  const heights = new Array(columnCount).fill(0);
  const layout = [];

  for (let i = 0; i < pool.length; i++) {
    const item = pool[i];

    // keep original behavior but safe
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
      type: item.type,
      artist: item.artist ?? null,

      x,
      y,
      w: colW,
      h
    });
  }

  const totalHeight = heights.reduce((a, b) => Math.max(a, b), 0);

  return { layout, totalHeight };
}

self.onmessage = (e) => {
  try {
    const { type, data, seq } = e.data;

    if (type === "INIT") {
      pool = Array.isArray(data?.pool) ? data.pool : [];
      return;
    }

    if (type === "LAYOUT") {
      if (seq !== undefined && seq < pendingSeq) return;
      pendingSeq = seq ?? pendingSeq;

      const width = data?.width;

      if (!width || !pool.length) {
        self.postMessage({
          type: "LAYOUT_RESULT",
          layout: [],
          totalHeight: 0,
          seq
        });
        return;
      }

      const result = computeLayout(pool, width);

      self.postMessage({
        type: "LAYOUT_RESULT",
        layout: result.layout,
        totalHeight: result.totalHeight,
        seq
      });
    }

  } catch (err) {
    self.postMessage({
      type: "LAYOUT_ERROR",
      message: err?.message || "Unknown error"
    });
  }
};