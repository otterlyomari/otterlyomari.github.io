let pool = [];
let pendingSeq = 0; // sequence ID to discard stale layout requests

function getColumnCount(width) {
  if (width < 700) return 2;
  if (width < 1100) return 3;
  return 4;
}

function computeLayout(pool, width) {
  const columnCount = getColumnCount(width);
  const GAP = 14;
  const colW = (width - GAP * (columnCount - 1)) / columnCount;
  const heights = new Array(columnCount).fill(0);
  const layout = [];

  for (let i = 0; i < pool.length; i++) {
    const item = pool[i];
    const ratio = item.ratio || 1;
    const h = colW * ratio;

    // Find shortest column
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
      x,
      y,
      w: colW,
      h
    });
  }

  // Safe alternative to Math.max(...heights) — avoids stack overflow on large pools
  const totalHeight = heights.reduce((a, b) => Math.max(a, b), 0);

  return { layout, totalHeight };
}

self.onmessage = (e) => {
  try {
    const { type, data, seq } = e.data;

    if (type === "INIT") {
      pool = data.pool || [];
    }

    if (type === "LAYOUT") {
      // If a newer request has already come in, discard this result
      if (seq !== undefined && seq < pendingSeq) return;
      pendingSeq = seq ?? pendingSeq;

      const result = computeLayout(pool, data.width);

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
      message: err.message
    });
  }
};