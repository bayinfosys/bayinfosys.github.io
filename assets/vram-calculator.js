// Inference VRAM calculator.
//
// Model and GPU data are rendered into the page by Jekyll from
// _data/inference_hardware.yml, so the entity names are present in the served
// HTML. This module reads them back off the DOM rather than holding its own
// copy; there is one source of truth and it is the data file.

const GIB = 1073741824;
const UTIL = 0.9;            // vLLM gpu_memory_utilization default
const OVERHEAD_BASE = 1;     // GB, CUDA context and allocator
const OVERHEAD_RATE = 0.06;  // fraction of weights, activations and workspace
const REPORT_DELAY = 2500;   // debounce before logging an event

const $ = id => document.getElementById(id);

/**
 * Size a deployment. Exported separately from the DOM code so the same
 * arithmetic can back a CLI or an API without this file being loaded in a page.
 */
export function sizeDeployment({ params, layers, kvHeads, headDim,
                                 weightBytes, kvBytes, context, concurrency }) {
  const weights  = (params * 1e9 * weightBytes) / GIB;
  const perToken = 2 * layers * kvHeads * headDim * kvBytes;
  const kvCache  = (perToken * context * concurrency) / GIB;
  const overhead = OVERHEAD_BASE + weights * OVERHEAD_RATE;
  return { weights, kvCache, overhead, perToken, total: weights + kvCache + overhead };
}

function modelSpec() {
  const opt = $('calcModel').selectedOptions[0];
  if (opt.value === 'custom') {
    return {
      name: 'Custom',
      params: +$('calcParams').value,
      layers: +$('calcLayers').value,
      kvHeads: +$('calcKvHeads').value,
      headDim: +$('calcHeadDim').value
    };
  }
  return {
    name: opt.textContent.trim(),
    params: +opt.dataset.p,
    layers: +opt.dataset.l,
    kvHeads: +opt.dataset.kv,
    headDim: +opt.dataset.d
  };
}

function gpuSpec() {
  const opt = $('calcGpu').selectedOptions[0];
  return { name: opt.textContent.replace(/\s*\(.*\)$/, '').trim(), vram: +opt.dataset.v };
}

let reportTimer;
function report(payload) {
  clearTimeout(reportTimer);
  reportTimer = setTimeout(() => {
    try {
      if (typeof logger !== 'undefined' && logger && typeof logger.event === 'function') {
        logger.event('vram_calc', payload);
      }
    } catch (e) { /* logging must never break the tool */ }
  }, REPORT_DELAY);
}

function render() {
  const isCustom = $('calcModel').value === 'custom';
  $('calcCustom').classList.toggle('d-none', !isCustom);

  const m    = modelSpec();
  const gpu  = gpuSpec();
  const ctx  = Math.max(1, +$('calcCtx').value  || 0);
  const conc = Math.max(1, +$('calcConc').value || 0);

  const r = sizeDeployment({
    params: m.params, layers: m.layers, kvHeads: m.kvHeads, headDim: m.headDim,
    weightBytes: +$('calcQuant').value, kvBytes: +$('calcKvQuant').value,
    context: ctx, concurrency: conc
  });

  const usable = gpu.vram * UTIL;
  const fits   = r.total <= usable;

  $('calcTotal').textContent = r.total.toFixed(1) + ' GB';
  $('calcTotal').className   = 'calc-total' + (fits ? '' : ' over');
  $('calcVerdict').textContent = fits
    ? `Fits on a ${gpu.name} with ${(usable - r.total).toFixed(1)} GB spare.`
    : `Exceeds a ${gpu.name} by ${(r.total - usable).toFixed(1)} GB `
      + `(usable ${usable.toFixed(1)} GB of ${gpu.vram}).`;

  $('calcW').textContent = r.weights.toFixed(1);
  $('calcK').textContent = r.kvCache.toFixed(1);
  $('calcO').textContent = r.overhead.toFixed(1);
  $('calcT').innerHTML   = `<strong>${r.total.toFixed(1)}</strong>`;

  const pct = x => (100 * x / r.total).toFixed(2) + '%';
  $('calcBar').innerHTML =
      `<span class="cb1" style="width:${pct(r.weights)}"></span>`
    + `<span class="cb2" style="width:${pct(r.kvCache)}"></span>`
    + `<span class="cb3" style="width:${pct(r.overhead)}"></span>`;

  const mbPerRequest = (r.perToken * ctx) / 1048576;
  $('calcPerReq').innerHTML =
      `Each concurrent request holds <strong>${mbPerRequest.toFixed(0)} MB</strong> at `
    + `${ctx.toLocaleString()} tokens. Doubling concurrency adds `
    + `${r.kvCache.toFixed(1)} GB.`;

  const gbPerRequest = (r.perToken * ctx) / GIB;
  document.querySelectorAll('#calcFit tbody tr').forEach(row => {
    const spare = (+row.dataset.vram * UTIL) - r.weights - r.overhead;
    const maxC  = Math.floor(spare / gbPerRequest);
    const cells = row.querySelectorAll('.calc-maxc, .calc-result');
    cells[0].textContent = maxC >= 1 ? maxC : '\u2014';
    cells[1].textContent = maxC >= conc ? 'fits' : (maxC >= 1 ? 'too few' : 'no');
    cells[1].className = 'calc-num calc-result ' + (maxC >= conc ? 'calc-fit' : 'calc-nofit');
  });

  report({
    model: m.name,
    params: m.params,
    weight_bytes: +$('calcQuant').value,
    kv_bytes: +$('calcKvQuant').value,
    context: ctx,
    concurrency: conc,
    gpu: gpu.name,
    total_gb: +r.total.toFixed(1),
    fits
  });
}

export function init() {
  const controls = [
    'calcModel', 'calcGpu', 'calcQuant', 'calcKvQuant', 'calcCtx', 'calcConc',
    'calcParams', 'calcLayers', 'calcKvHeads', 'calcHeadDim'
  ];
  controls.forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  });
  render();
}
