// research-playground.js — Vanilla ES module
// MVP: 3 puzzles (Bellman, Cross-Entropy, Swiss Roll) → unlock gorgeous visualizations
// Drop-in on a dark site. External deps expected: KaTeX (optional, for rendering) + Plotly.js

// Public API
export function initPlayground(container, options = {}) {
  if (!container) throw new Error("initPlayground: container is required");
  const theme = makeTheme(options.theme);

  // Root
  const root = document.createElement('div');
  root.className = 'rp-root';
  container.appendChild(root);

  injectStylesOnce();

  // Layout
  root.innerHTML = `
    <div class="rp-wrap">
      <div class="rp-header">
        <div class="rp-title">Research Playground</div>
        <div class="rp-sub">Solve the formula to unlock the visualization</div>
      </div>
      <div class="rp-main">
        <div class="rp-puzzle">
          <div class="rp-equation" id="rp-equation"></div>
          <div class="rp-input-row">
            <input id="rp-answer" class="rp-input" placeholder="Type the missing part (supports LaTeX like \\gamma)"/>
            <button id="rp-submit" class="rp-btn">Check</button>
            <button id="rp-hint" class="rp-btn rp-ghost">Hint</button>
            <div class="rp-status">
              <span id="rp-feedback"></span>
              <span class="rp-dot">•</span>
              <span>Streak: <b id="rp-streak">0</b></span>
            </div>
          </div>
        </div>
        <div class="rp-viz">
          <div id="rp-viz-locked" class="rp-viz-locked">🔒 Solve the puzzle to reveal the visualization</div>
          <div id="rp-viz-area" class="rp-viz-area"></div>
          <div id="rp-controls" class="rp-controls rp-hidden"></div>
        </div>
      </div>
      <div class="rp-footer">
        <button id="rp-prev" class="rp-btn rp-ghost">◀ Prev</button>
        <div class="rp-step" id="rp-step"></div>
        <button id="rp-next" class="rp-btn rp-ghost">Next ▶</button>
      </div>
    </div>
  `;

  // Theme variables
  Object.entries(theme).forEach(([k,v])=>root.style.setProperty(`--${k}`, v));

  const eqEl = root.querySelector('#rp-equation');
  const ansEl = root.querySelector('#rp-answer');
  const subBtn = root.querySelector('#rp-submit');
  const hintBtn = root.querySelector('#rp-hint');
  const fbEl = root.querySelector('#rp-feedback');
  const streakEl = root.querySelector('#rp-streak');
  const stepEl = root.querySelector('#rp-step');
  const prevBtn = root.querySelector('#rp-prev');
  const nextBtn = root.querySelector('#rp-next');
  const vizLocked = root.querySelector('#rp-viz-locked');
  const vizArea = root.querySelector('#rp-viz-area');
  const controls = root.querySelector('#rp-controls');

  const puzzles = makePuzzles(vizArea, controls);
  let idx = 0;
  let streak = 0;
  let unlocked = false;
  let usedHints = 0;

  function renderPuzzle() {
    unlocked = false; usedHints = 0;
    fbEl.textContent = '';
    controls.innerHTML = '';
    controls.classList.add('rp-hidden');
    vizArea.innerHTML = '';
    vizLocked.classList.remove('rp-hidden');
    ansEl.value = '';
    const p = puzzles[idx];
    stepEl.textContent = `Puzzle ${idx+1} / ${puzzles.length}`;
    renderEquation(eqEl, p.displayTex);
  }

  function checkAnswer() {
    const p = puzzles[idx];
    const ok = matchesAnswer(ansEl.value, p.accept);
    if (ok) {
      streak++; streakEl.textContent = String(streak);
      feedback("Correct! Visualization unlocked.", true);
      unlockViz();
    } else {
      streak = 0; streakEl.textContent = '0';
      feedback("Not quite. Try again or hit Hint.", false);
      pulse(eqEl);
    }
  }

  function unlockViz() {
    if (unlocked) return;
    unlocked = true;
    vizLocked.classList.add('rp-hidden');
    const p = puzzles[idx];
    p.vizFactory();
    controls.classList.remove('rp-hidden');
  }

  function feedback(text, good) {
    fbEl.textContent = text;
    fbEl.classList.remove('rp-good','rp-bad');
    fbEl.classList.add(good? 'rp-good':'rp-bad');
  }

  function onHint() {
    const p = puzzles[idx];
    const hint = p.hints[Math.min(usedHints, p.hints.length-1)];
    fbEl.textContent = `Hint: ${hint}`;
    fbEl.classList.remove('rp-good');
    fbEl.classList.add('rp-hint');
    usedHints++;
  }

  function onPrev(){
    idx = (idx - 1 + puzzles.length) % puzzles.length;
    renderPuzzle();
  }
  function onNext(){
    idx = (idx + 1) % puzzles.length;
    renderPuzzle();
  }

  subBtn.addEventListener('click', checkAnswer);
  ansEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); checkAnswer(); }});
  hintBtn.addEventListener('click', onHint);
  prevBtn.addEventListener('click', onPrev);
  nextBtn.addEventListener('click', onNext);

  renderPuzzle();
}

// ————————————————————————————————————————————————
// Puzzles
function makePuzzles(vizArea, controls){
  return [
    // 1) Bellman (gamma)
    {
      key: 'bellman',
      displayTex: String.raw`V^{*}(s)=\max_{a}\left[ R(s,a) + <span class="rp-blank">___</span>\sum_{s'} P(s'|s,a) V^{*}(s') \right]`,
      accept: ['\\gamma','gamma','Γ','discount'],
      hints: ['Discount factor symbol', 'Greek letter, lower-case gamma'],
      vizFactory: ()=> createBellmanViz(vizArea, controls),
    },
    // 2) Cross-entropy (log yhat)
    {
      key: 'xent',
      displayTex: String.raw`\mathcal{L} = - \sum_i y_i \\; <span class="rp-blank">___</span>`,
      accept: [
        String.raw`\log \hat{y}_i`, String.raw`\log \hat y_i`,
        'log yhat_i','log yhat','log p_i','log \hat p_i'
      ],
      hints: ['Log of predicted probability', 'Try \\log \\hat{y}_i'],
      vizFactory: ()=> createClassificationViz(vizArea, controls),
    },
    // 3) Swiss roll (t sin t)
    {
      key: 'swiss',
      displayTex: String.raw`(x,y,z) = (t\\cos t, \\; y, \\; <span class="rp-blank">___</span>)`,
      accept: [String.raw`t\\sin t`, 't sin t', 't*sint', 't*sin(t)'],
      hints: ['Sine twin of t cos t', 'Format: t\\sin t'],
      vizFactory: ()=> createSwissRollViz(vizArea, controls),
    }
  ];
}

// ————————————————————————————————————————————————
// Visualization: Bellman value iteration on a grid using Plotly surface
function createBellmanViz(vizArea, controls){
  requirePlotly();
  const W = 26, H = 26;
  const gammaInput = slider(controls, 'Discount γ', 0.90, 0.5, 0.99, 0.01);
  const noiseInput  = slider(controls, 'Transition noise', 0.10, 0.0, 0.4, 0.01);
  const playBtn = playButton(controls);

  // Rewards: gentle hill with a peak + small noise
  const R = Array.from({length:H}, (_,y)=>Array.from({length:W},(_,x)=>{
    const cx=W/2, cy=H/2; const dx=x-cx, dy=y-cy; const r=Math.hypot(dx,dy);
    return 2*Math.exp(-(r*r)/(2*50)) + 0.1*(Math.random()-0.5);
  }));
  let V = zeros(H,W);

  function stepVI(){
    const g = +gammaInput.value;
    const nz = +noiseInput.value; // prob of moving random dir instead of greedy
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    const Vn = zeros(H,W);
    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        let best = -1e9;
        for(const [dx,dy] of dirs){
          const nx=clamp(x+dx,0,W-1), ny=clamp(y+dy,0,H-1);
          // stochastic next: mix of intended and random neighbor
          let expNext = (1-nz)*V[ny][nx];
          for(const [rdx,rdy] of dirs){
            const rx=clamp(x+rdx,0,W-1), ry=clamp(y+rdy,0,H-1);
            expNext += (nz/dirs.length)*V[ry][rx];
          }
          const q = R[y][x] + g*expNext;
          if (q>best) best=q;
        }
        Vn[y][x]=best;
      }
    }
    V = Vn;
  }

  // Plotly surface
  const data = [{ z: V, type:'surface', showscale:false, colorscale: darkSurfaceScale(), contours: {z:{show:false}} }];
  const layout = surfaceLayout('Value Function Surface');
  Plotly.newPlot(vizArea, data, layout, {displayModeBar:false});

  let animId = null;
  function animate(){
    stepVI();
    Plotly.update(vizArea, {z:[V]});
    animId = requestAnimationFrame(animate);
  }

  playBtn.onclick = () => {
    if (playBtn.dataset.state!=='playing'){
      playBtn.dataset.state='playing'; playBtn.textContent='Pause';
      animate();
    } else {
      playBtn.dataset.state='paused'; playBtn.textContent='Play';
      if (animId) cancelAnimationFrame(animId);
    }
  };
}

// ————————————————————————————————————————————————
// Visualization: Simple logistic regression decision boundary animation
function createClassificationViz(vizArea, controls){
  requirePlotly();
  const playBtn = playButton(controls);
  const lrInput = slider(controls, 'Learning rate η', 0.3, 0.05, 1.0, 0.05);
  const regInput = slider(controls, 'L2 λ', 0.0, 0.0, 1.0, 0.05);

  const {X, y} = makeGaussians();
  let w = [0,0], b = 0; // 2D logistic

  function sigmoid(z){ return 1/(1+Math.exp(-z)); }

  function step(){
    let dw=[0,0], db=0; const n=X.length; const lr = +lrInput.value; const lam=+regInput.value;
    for(let i=0;i<n;i++){
      const z = w[0]*X[i][0] + w[1]*X[i][1] + b;
      const p = sigmoid(z);
      const e = p - y[i];
      dw[0]+= e*X[i][0]; dw[1]+= e*X[i][1]; db+= e;
    }
    // regularization
    dw[0]=dw[0]/n + lam*w[0]; dw[1]=dw[1]/n + lam*w[1]; db=db/n;
    w[0]-= lr*dw[0]; w[1]-= lr*dw[1]; b-= lr*db;
  }

  function boundaryLine(){
    // w0 x + w1 y + b = 0 → y = -(w0/w1) x - b/w1
    const xs=[-4,4];
    const ys = (Math.abs(w[1])<1e-6) ? [0,0] : xs.map(x=>-(w[0]/w[1])*x - b/w[1]);
    return {x: xs, y: ys};
  }

  // Plotly setup
  const class0 = {x:[],y:[]}; const class1 = {x:[],y:[]};
  X.forEach((pt,i)=>{ (y[i]===0?class0:class1).x.push(pt[0]); (y[i]===0?class0:class1).y.push(pt[1]); });
  const line = boundaryLine();
  const traces = [
    {x: class0.x, y: class0.y, mode:'markers', type:'scatter', name:'Class 0', marker:{size:6, opacity:0.85}},
    {x: class1.x, y: class1.y, mode:'markers', type:'scatter', name:'Class 1', marker:{size:6, opacity:0.85}},
    {x: line.x, y: line.y, mode:'lines', type:'scatter', name:'Boundary', line:{width:3}}
  ];
  const layout = {
    paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)',
    margin:{l:40,r:20,t:30,b:40},
    xaxis:{range:[-4,4], gridcolor:'rgba(255,255,255,0.08)', zeroline:false, color:'rgba(232,241,248,0.85)'},
    yaxis:{range:[-4,4], gridcolor:'rgba(255,255,255,0.08)', zeroline:false, color:'rgba(232,241,248,0.85)'},
    showlegend:false,
    title:{text:'Logistic Regression on Gaussians', font:{size:14, color:'var(--fg)'}}
  };
  Plotly.newPlot(vizArea, traces, layout, {displayModeBar:false});

  let animId = null;
  function animate(){
    step();
    const l = boundaryLine();
    Plotly.update(vizArea, {x:[null,null,l.x], y:[null,null,l.y]});
    animId = requestAnimationFrame(animate);
  }

  playBtn.onclick = () => {
    if (playBtn.dataset.state!=='playing'){
      playBtn.dataset.state='playing'; playBtn.textContent='Pause';
      animate();
    } else {
      playBtn.dataset.state='paused'; playBtn.textContent='Play';
      if (animId) cancelAnimationFrame(animId);
    }
  };
}

// ————————————————————————————————————————————————
// Visualization: Swiss Roll scatter3d
function createSwissRollViz(vizArea, controls){
  requirePlotly();
  const turns = slider(controls, 'Turns', 1.5, 0.5, 4.0, 0.1);
  const noise = slider(controls, 'Noise', 0.05, 0.0, 0.3, 0.01);
  const nPts  = slider(controls, 'Samples', 1200, 200, 4000, 100, true);

  function genData(){
    const N = Math.floor(+nPts.value);
    const T = +turns.value * 2*Math.PI; // total angle span
    const pts = {x:[],y:[],z:[], c:[]};
    for(let i=0;i<N;i++){
      const t = Math.random()*T + 1.5; // avoid near-zero
      const y = (Math.random()-0.5)*10;
      const eps = +noise.value;
      pts.x.push( t*Math.cos(t) + eps*randn() );
      pts.y.push( y + eps*randn() );
      pts.z.push( t*Math.sin(t) + eps*randn() );
      pts.c.push(t);
    }
    return pts;
  }

  function render(){
    const d = genData();
    const trace = { type:'scatter3d', mode:'markers', x:d.x,y:d.y,z:d.z,
      marker:{ size:2, opacity:0.9, color:d.c, colorscale: darkPointScale(), showscale:false }
    };
    const layout = {
      paper_bgcolor:'rgba(0,0,0,0)', scene:{
        xaxis:{showgrid:true, gridcolor:'rgba(255,255,255,0.06)', color:'rgba(232,241,248,0.75)', zeroline:false},
        yaxis:{showgrid:true, gridcolor:'rgba(255,255,255,0.06)', color:'rgba(232,241,248,0.75)', zeroline:false},
        zaxis:{showgrid:true, gridcolor:'rgba(255,255,255,0.06)', color:'rgba(232,241,248,0.75)', zeroline:false},
        bgcolor:'rgba(0,0,0,0)'
      }, margin:{l:0,r:0,b:0,t:30}, title:{text:'Swiss Roll', font:{color:'var(--fg)', size:14}}
    };
    Plotly.newPlot(vizArea, [trace], layout, {displayModeBar:false});
  }

  // re-render on control change
  [turns, noise, nPts].forEach(inp=> inp.addEventListener('input', render));
  render();
}

// ————————————————————————————————————————————————
// Utilities
function makeTheme(overrides={}){
  return Object.assign({
    bg:'#0B0F14', panel:'#0F141A', fg:'#E8F1F8', grid:'rgba(255,255,255,0.08)',
    accent:'#7AE6FF', accent2:'#A990FF', good:'#6BEFA3', bad:'#FF708D', amber:'#FFB86B'
  }, overrides);
}

function injectStylesOnce(){
  if (document.getElementById('rp-styles')) return;
  const css = `
  :root { --bg:#0B0F14; --panel:#0F141A; --fg:#E8F1F8; --grid:rgba(255,255,255,0.08); --accent:#7AE6FF; --accent2:#A990FF; --good:#6BEFA3; --bad:#FF708D; --amber:#FFB86B; }
  .rp-root { font-family: ui-sans-serif, Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; color: var(--fg); background: transparent; }
  .rp-wrap { background: linear-gradient(180deg, rgba(10,14,20,0.6), rgba(10,14,20,0.2)); padding: 16px; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.35); }
  .rp-header { margin-bottom: 12px; }
  .rp-title { font-weight: 650; letter-spacing: 0.3px; font-size: 18px; color: var(--accent); }
  .rp-sub { opacity: 0.8; font-size: 13px; }
  .rp-main { display: grid; grid-template-columns: 1.1fr 1.6fr; gap: 16px; align-items: stretch; }
  @media (max-width: 980px){ .rp-main { grid-template-columns: 1fr; } }
  .rp-puzzle { background: var(--panel); border-radius: 14px; padding: 14px; border: 1px solid rgba(255,255,255,0.06); }
  .rp-equation { min-height: 68px; display:flex; align-items:center; justify-content:center; font-size: 20px; padding: 8px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.08); }
  .rp-input-row { display:flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 10px; }
  .rp-input { flex: 1 1 260px; background: #0B1016; border: 1px solid rgba(255,255,255,0.08); color: var(--fg); padding: 10px 12px; border-radius: 10px; outline: none; }
  .rp-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(122,230,255,0.15); }
  .rp-btn { background: var(--accent); color: #051018; border: none; padding: 10px 12px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: transform 0.06s ease; }
  .rp-btn:hover { transform: translateY(-1px); }
  .rp-ghost { background: rgba(255,255,255,0.06); color: var(--fg); border: 1px solid rgba(255,255,255,0.12); }
  .rp-status { margin-left:auto; display:flex; gap:8px; align-items:center; font-size: 12px; opacity: 0.85; }
  .rp-dot { opacity: 0.5; }
  .rp-viz { background: var(--panel); border-radius: 14px; padding: 10px; border: 1px solid rgba(255,255,255,0.06); position: relative; }
  .rp-viz-locked { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size: 14px; color: rgba(232,241,248,0.8); backdrop-filter: blur(2px); background: radial-gradient(circle at 50% 40%, rgba(122,230,255,0.08), rgba(0,0,0,0.2)); border-radius: 12px; border:1px dashed rgba(255,255,255,0.1); }
  .rp-hidden { display:none !important; }
  .rp-viz-area { min-height: 340px; }
  .rp-controls { display:flex; gap:10px; flex-wrap: wrap; padding: 8px; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 8px; }
  .rp-footer { margin-top: 12px; display:flex; align-items:center; justify-content:space-between; }
  .rp-step { opacity: 0.7; }
  .rp-good { color: var(--good); }
  .rp-bad { color: var(--bad); }
  .rp-hint { color: var(--amber); }
  .rp-blank { color: var(--good); filter: drop-shadow(0 0 6px rgba(107,239,163,0.35)); }
  .rp-chip { display:flex; flex-direction:column; gap:4px; padding:8px 10px; background:#0B1016; border:1px solid rgba(255,255,255,0.08); border-radius:10px; min-width: 160px; }
  .rp-chip label { font-size:11px; opacity:0.8; }
  .rp-chip input[type=range] { width: 160px; }
  .rp-play { padding:10px 14px; font-weight:700; }
  `;
  const style = document.createElement('style');
  style.id = 'rp-styles';
  style.textContent = css;
  document.head.appendChild(style);
}

function renderEquation(el, tex){
  if (window.katex && window.katex.render) {
    try {
      const cleanTex = tex.replace(new RegExp('<span class="rp-blank">___</span>', 'g'), '\\_\\_\\_');
      window.katex.render(cleanTex, el, {throwOnError:false});
      return;
    } catch(e){}
  }
  el.innerHTML = tex;
}

function matchesAnswer(input, acceptable){
  const norm = normalizeMath(input);
  return acceptable.some(a => normalizeMath(a) === norm);
}

function normalizeMath(s){
  return String(s||'')
    .trim()
    .replace(/\\\s+/g,'') // remove LaTeX backslash spacing
    .replace(/\s+/g,'')
    .replace(/[{}()]/g,'')
    .replace(/\\hat/g,'^')
    .toLowerCase();
}

function pulse(el){
  el.animate([{boxShadow:'0 0 0 0 rgba(255,112,141,0.0)'},{boxShadow:'0 0 0 6px rgba(255,112,141,0.25)'},{boxShadow:'0 0 0 0 rgba(255,112,141,0.0)'}], {duration:500, easing:'ease-out'});
}

function zeros(h,w){ return Array.from({length:h},()=>Array.from({length:w},()=>0)); }
function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }
function randn(){
  // Box–Muller
  let u=0, v=0; while(u===0)u=Math.random(); while(v===0)v=Math.random();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
}

function requirePlotly(){
  if (!(window.Plotly && typeof window.Plotly.newPlot === 'function')){
    console.warn('[research-playground] Plotly.js not found. Include it before initPlayground.');
  }
}

function darkSurfaceScale(){
  // Teal → violet palette for dark backgrounds
  return [
    [0.0, '#0e1a22'], [0.2, '#123243'], [0.35, '#145b72'], [0.5, '#1c8aa3'],
    [0.65,'#5cc7d9'], [0.8,'#9dd9ff'], [1.0,'#cbb6ff']
  ];
}
function darkPointScale(){
  return [
    [0.0, '#1a1e27'], [0.2, '#2a3848'], [0.4, '#2d6a73'], [0.6, '#4aa4a8'], [0.8, '#8fd9e2'], [1.0, '#f2c6ff']
  ];
}
function surfaceLayout(title){
  return {
    paper_bgcolor:'rgba(0,0,0,0)',
    scene:{
      xaxis:{ gridcolor:'rgba(255,255,255,0.08)', zeroline:false, color:'rgba(232,241,248,0.75)'},
      yaxis:{ gridcolor:'rgba(255,255,255,0.08)', zeroline:false, color:'rgba(232,241,248,0.75)'},
      zaxis:{ gridcolor:'rgba(255,255,255,0.08)', zeroline:false, color:'rgba(232,241,248,0.75)'},
      bgcolor:'rgba(0,0,0,0)'
    },
    margin:{l:0,r:0,b:0,t:30},
    title:{text:title, font:{size:14, color:'var(--fg)'}}
  };
}

// UI helpers
function slider(parent, labelText, value, min, max, step, integer=false){
  const chip = document.createElement('div'); chip.className='rp-chip';
  const label = document.createElement('label'); label.textContent = `${labelText}: ${value}`;
  const input = document.createElement('input'); input.type='range'; input.min=min; input.max=max; input.step=step; input.value=value;
  input.addEventListener('input', ()=>{ label.textContent = `${labelText}: ${integer? Math.floor(input.value): input.value}`; });
  chip.appendChild(label); chip.appendChild(input); parent.appendChild(chip);
  return input;
}
function playButton(parent){
  const btn = document.createElement('button'); btn.className='rp-btn rp-play'; btn.textContent='Play'; btn.dataset.state='paused'; parent.appendChild(btn); return btn;
}

// Data for classification viz
function makeGaussians(){
  const n=220; const X=[]; const y=[];
  for(let i=0;i<n;i++){
    const cls = i<n/2?0:1; y.push(cls);
    const cx = cls? 1.2 : -1.2; const cy = cls? 1.0 : -1.0;
    const px = cx + 0.9*randn(); const py = cy + 0.7*randn();
    X.push([px,py]);
  }
  return {X,y};
}
