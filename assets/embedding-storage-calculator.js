// Embedding storage calculator.

const TOKENS_PER_WORD = 1.33;
const BYTES_PER_TOKEN = 4;      // UTF-8 English text
const HNSW_UPPER_LAYERS = 1.15; // multiplier over layer zero
const LINK_BYTES = 4;           // 32-bit node ids
const REPORT_DELAY = 2500;

const $ = id => document.getElementById(id);

let config = {};

/* ---------- template helpers ---------- */

function fromTemplate(id) {
  const tpl = $(id);
  if (!tpl) throw new Error(`missing template: ${id}`);
  return tpl.content.firstElementChild.cloneNode(true);
}

function setFields(node, values) {
  for (const [field, value] of Object.entries(values)) {
    node.querySelectorAll(`[data-field="${field}"]`).forEach(el => {
      el.textContent = value;
    });
    if (node.dataset && node.dataset.field === field) node.textContent = value;
  }
  return node;
}

function replaceChildren(parent, nodes) {
  parent.replaceChildren(...nodes);
}

/* ---------- formatting ---------- */

function human(bytes) {
  if (!isFinite(bytes)) return '--';
  if (bytes < 1024) return bytes.toFixed(0) + ' B';
  const units = ['KB', 'MB', 'GB', 'TB', 'PB'];
  let v = bytes / 1024, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return v.toFixed(v >= 100 ? 0 : v >= 10 ? 1 : 2) + ' ' + units[i];
}

const count = n => Math.round(n).toLocaleString();

/* ---------- arithmetic ---------- */

/**
 * Vectors produced by one document. The max(1, ...) is load-bearing: documents
 * shorter than a chunk still produce a vector each, which is the difference
 * between 17,000 and 200,000 on a corpus of short tickets.
 */
export function chunksPerDoc(docTokens, chunkTokens, overlap) {
  const stride = Math.max(1, chunkTokens - overlap);
  return Math.max(1, Math.ceil((docTokens - overlap) / stride));
}

/**
 * Size a vector store. Exported separately from the DOM code so the same
 * arithmetic can back a CLI or an API.
 */
export function sizeVectorStore({ items, vectorsPerItem = 1, dims, precisionBytes,
                                  indexType, m, metaBytes, payloadBytes,
                                  storePayload, copies = 1 }) {
  const vectorCount = items * vectorsPerItem;
  const vectors = vectorCount * dims * precisionBytes;

  let index = 0;
  if (indexType === 'hnsw') {
    index = vectorCount * 2 * m * LINK_BYTES * HNSW_UPPER_LAYERS;
  } else if (indexType === 'ivf') {
    const lists = Math.max(1, Math.round(Math.sqrt(vectorCount)));
    index = lists * dims * 4 + vectorCount * LINK_BYTES;
  }

  // Payload attaches to the item. Metadata attaches to the stored row, which is
  // one per vector for single-vector models and one per item for late interaction.
  const payload = storePayload ? items * payloadBytes : 0;
  const rows = vectorsPerItem === 1 ? vectorCount : items;
  const meta = rows * metaBytes;

  const perCopy = vectors + index + payload + meta;
  return { vectorCount, rows, vectors, index, payload, meta,
           perCopy, total: perCopy * copies, resident: vectors + index };
}

/* ---------- input reading ---------- */

const currentMode = () =>
  document.querySelector('input[name="embMode"]:checked').value;

function readInputs() {
  const mode = currentMode();
  const select = mode === 'text' ? $('embModelText') : $('embModelImage');
  const opt = select.selectedOptions[0];
  const custom = opt.value === 'custom';

  const dims = custom ? Math.max(1, +$('embDims').value || 1) : +opt.dataset.d;
  const modelVpi = custom ? Math.max(1, +$('embVpi').value || 1) : +opt.dataset.vpi;
  const unit = custom ? (mode === 'text' ? 'chunk' : 'image') : opt.dataset.unit;

  const shared = {
    mode, dims, custom, unit,
    modelName: custom ? `Custom ${dims}d x${modelVpi}`
                      : opt.textContent.split('\u2014')[0].trim(),
    note: custom ? '' : (opt.dataset.note || ''),
    maxTokens: (mode === 'text' && !custom) ? +opt.dataset.mt : null,
    precisionBytes: +$('embPrec').value,
    indexType: $('embIndex').value,
    m: Math.max(4, +$('embM').value || 16),
    metaBytes: Math.max(0, +$('embMeta').value || 0),
    storePayload: $('embStorePayload').checked,
    copies: Math.max(1, +$('embCopies').value || 1)
  };

  if (mode === 'text') {
    const docs = Math.max(1, +$('embDocs').value || 1);
    const words = Math.max(1, +$('embWords').value || 1);
    const chunkTokens = Math.max(16, +$('embChunk').value || 16);
    const overlap = Math.max(0, Math.min(chunkTokens - 1, +$('embOverlap').value || 0));
    const docTokens = words * TOKENS_PER_WORD;
    const cpd = chunksPerDoc(docTokens, chunkTokens, overlap);
    return {
      ...shared,
      items: docs, chunkTokens, overlap, docTokens,
      // A late-interaction text model emits modelVpi vectors per chunk.
      vectorsPerItem: cpd * modelVpi,
      chunksPerItem: cpd,
      payloadBytes: cpd * chunkTokens * BYTES_PER_TOKEN
    };
  }

  return {
    ...shared,
    items: Math.max(1, +$('embItems').value || 1),
    vectorsPerItem: modelVpi,
    chunksPerItem: 1,
    payloadBytes: Math.max(0, +$('embPayloadKb').value || 0) * 1024
  };
}

/* ---------- rendering ---------- */

function applyMode(mode) {
  document.querySelectorAll('[data-mode]').forEach(el => {
    el.hidden = el.dataset.mode !== mode;
  });
  $('embVaryHeading').textContent = mode === 'text'
    ? 'Same corpus, different chunking'
    : 'Same corpus, different vectors per item';
  $('embVaryNote').textContent = mode === 'text'
    ? 'Vector count and total at the current dimensions and precision. Halving the chunk size roughly doubles everything.'
    : 'What late interaction costs. One vector per item is standard retrieval; a thousand is one per image patch.';
  $('embVaryTable').querySelector('[data-field="head"]').textContent =
    mode === 'text' ? 'Chunk size' : 'Vectors per item';
}

function renderBar(el, parts) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  replaceChildren(el, parts.map(p => {
    const seg = fromTemplate('tplBarSegment');
    seg.className = p.cls;
    seg.style.width = (100 * p.value / total).toFixed(2) + '%';
    return seg;
  }));
}

function renderWarnings(el, messages) {
  replaceChildren(el, messages.map(text =>
    setFields(fromTemplate('tplWarning'), {}) && Object.assign(
      fromTemplate('tplWarning'), { textContent: text })
  ));
}

function renderDimTable(base, currentDims) {
  const rows = config.comparisonDims.map(d => {
    const row = fromTemplate('tplDimRow');
    row.dataset.dims = d;
    setFields(row, {
      label: d,
      b4: human(sizeVectorStore({ ...base, dims: d, precisionBytes: 4 }).total),
      b2: human(sizeVectorStore({ ...base, dims: d, precisionBytes: 2 }).total),
      b1: human(sizeVectorStore({ ...base, dims: d, precisionBytes: 1 }).total),
      b0: human(sizeVectorStore({ ...base, dims: d, precisionBytes: 0.125 }).total)
    });
    row.classList.toggle('calc-here', d === currentDims);
    return row;
  });
  replaceChildren($('embDimTable').tBodies[0], rows);
}

function renderVaryTable(i, base) {
  const rows = [];

  if (i.mode === 'text') {
    const modelVpi = i.vectorsPerItem / i.chunksPerItem;
    for (const c of config.comparisonChunks) {
      const overlap = Math.min(i.overlap, c - 1);
      const cpd = chunksPerDoc(i.docTokens, c, overlap);
      const s = sizeVectorStore({
        ...base,
        vectorsPerItem: cpd * modelVpi,
        payloadBytes: cpd * c * BYTES_PER_TOKEN
      });
      const row = fromTemplate('tplVaryRow');
      row.dataset.vary = c;
      setFields(row, {
        label: `${c} tokens`,
        count: count(s.vectorCount),
        vectors: human(s.vectors * i.copies),
        total: human(s.total)
      });
      row.classList.toggle('calc-here', c === i.chunkTokens);
      rows.push(row);
    }
  } else {
    for (const v of config.comparisonVectors) {
      const s = sizeVectorStore({ ...base, vectorsPerItem: v });
      const row = fromTemplate('tplVaryRow');
      row.dataset.vary = v;
      setFields(row, {
        label: v === 1 ? '1 (single vector)' : count(v),
        count: count(s.vectorCount),
        vectors: human(s.vectors * i.copies),
        total: human(s.total)
      });
      row.classList.toggle('calc-here', v === i.vectorsPerItem);
      rows.push(row);
    }
  }

  replaceChildren($('embVaryTable').tBodies[0], rows);
}

function collectWarnings(i, r) {
  const w = [];
  if (i.maxTokens && i.chunkTokens > i.maxTokens) {
    w.push(`Chunk size exceeds this model's ${i.maxTokens}-token limit; input will be truncated.`);
  }
  if (i.mode === 'text' && i.docTokens < i.chunkTokens) {
    w.push('Documents are shorter than one chunk, so each produces a single vector regardless of chunk size.');
  }
  if (i.mode === 'text' && i.storePayload) {
    const inflation = i.chunkTokens / (i.chunkTokens - i.overlap);
    if (inflation > 1.05) {
      w.push(`Overlap inflates stored text to ${inflation.toFixed(2)}x the corpus size.`);
    }
  }
  if (i.vectorsPerItem / i.chunksPerItem > 1) {
    w.push('Late interaction needs a MaxSim pass over retrieved vectors, so query compute rises with vector count as well as storage.');
    w.push('Most vector databases handle multi-vector through a parent-child mapping, which adds a join this estimate does not model.');
  }
  if (i.precisionBytes === 0.125) {
    w.push('Binary quantisation normally needs a rescoring pass against full-precision vectors, which must also be stored.');
  }
  if (r.index > r.vectors) {
    w.push('The index is now larger than the vectors themselves; lowering HNSW M is the cheapest saving available.');
  }
  return w;
}

function render() {
  const i = readInputs();

  applyMode(i.mode);
  $('embCustom').classList.toggle('d-none', !i.custom);
  $('embMBox').style.visibility = i.indexType === 'hnsw' ? 'visible' : 'hidden';
  $('embModelNote').textContent = i.note || '\u00a0';

  const unitInfo = config.units[i.unit] || { payload_label: 'Payload' };
  $('embPayloadLabel').textContent = unitInfo.payload_label;

  const base = {
    items: i.items, vectorsPerItem: i.vectorsPerItem, dims: i.dims,
    precisionBytes: i.precisionBytes, indexType: i.indexType, m: i.m,
    metaBytes: i.metaBytes, payloadBytes: i.payloadBytes,
    storePayload: i.storePayload, copies: i.copies
  };
  const r = sizeVectorStore(base);

  $('embTotal').textContent = human(r.total);
  $('embCount').textContent =
    `${count(r.vectorCount)} vectors from ${count(i.items)} `
    + `${i.mode === 'text' ? 'documents' : i.unit + 's'}`
    + (i.copies > 1 ? `, across ${i.copies} copies.` : '.');

  $('embVec').textContent = human(r.vectors * i.copies);
  $('embIdx').textContent = human(r.index * i.copies);
  $('embPay').textContent = i.storePayload ? human(r.payload * i.copies) : 'not stored';
  $('embMet').textContent = human(r.meta * i.copies);
  $('embTot').textContent = human(r.total);

  renderBar($('embBar'), [
    { cls: 'cb1', value: r.vectors },
    { cls: 'cb2', value: r.index },
    { cls: 'cb3', value: r.payload },
    { cls: 'cb4', value: r.meta }
  ]);

  $('embRam').textContent = human(r.resident);
  $('embRamNote').textContent =
    `Vectors and index for one copy. Payload can stay on disk. `
    + `Index is ${(100 * r.index / (r.resident || 1)).toFixed(0)}% of it.`;

  renderWarnings($('embWarnings'), collectWarnings(i, r));
  renderDimTable(base, i.dims);
  renderVaryTable(i, base);

  report({
    mode: i.mode, model: i.modelName, unit: i.unit,
    dims: i.dims, vectors_per_item: i.vectorsPerItem,
    precision_bytes: i.precisionBytes, index_type: i.indexType,
    items: i.items, chunk_tokens: i.chunkTokens || null,
    overlap: i.overlap || null, vector_count: r.vectorCount,
    store_payload: i.storePayload, copies: i.copies,
    total_bytes: r.total, resident_bytes: r.resident
  });
}

/* ---------- reporting ---------- */

let reportTimer;
function report(payload) {
  clearTimeout(reportTimer);
  reportTimer = setTimeout(() => {
    try {
      if (typeof logger !== 'undefined' && logger && typeof logger.event === 'function') {
        logger.event('embedding_storage_calc', payload);
      }
    } catch (e) { /* logging must never break the tool */ }
  }, REPORT_DELAY);
}

/* ---------- setup ---------- */

export function init(pageConfig) {
  config = {
    comparisonDims: [384, 768, 1024, 1536, 3072, 4096],
    comparisonChunks: [128, 256, 512, 1024, 2048],
    comparisonVectors: [1, 130, 256, 1030, 4096],
    units: {},
    ...pageConfig
  };

  [
    'embModeText', 'embModeImage',
    'embModelText', 'embModelImage', 'embDims', 'embVpi',
    'embPrec', 'embIndex', 'embM', 'embMeta', 'embStorePayload', 'embCopies',
    'embDocs', 'embWords', 'embChunk', 'embOverlap',
    'embItems', 'embPayloadKb'
  ].forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });

  render();
}
