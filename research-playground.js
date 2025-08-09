// research-playground.js — Vanilla ES module (MVP + polish)
// - Typed LaTeX answers, streak + hints
// - Visual accuracy tweaks, responsive equation sizing
// - Puzzles: Bellman, Cross-Entropy, Swiss Roll, Scaled Dot-Product Attention, KL divergence (2D Gaussians)
// External deps: Plotly.js (required), KaTeX (optional for pretty math)
// Usage:
//   <script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>
//   <script type="module">
//     import { initPlayground } from './research-playground.js';
//     initPlayground(document.getElementById('playground'));
//   </script>
//
export function initPlayground(container, options = {}) {
  if (!container) throw new Error("initPlayground: container is required");
  const theme = makeTheme(options.theme);

  // Root
  const root = document.createElement('div');
  root.className = 'rp-root';
  container.appendChild(root);

  // Add loading state
  root.innerHTML = `
    <div class="rp-loading">
      <div class="rp-loading-spinner"></div>
      <div class="rp-loading-text">Initializing Research Playground...</div>
    </div>
  `;

  injectStylesOnce();

  // Add a subtle animation entrance
  root.style.opacity = '0';
  root.style.transform = 'translateY(20px)';
  root.style.transition = 'all 0.6s ease';
  
  setTimeout(() => {
    root.style.opacity = '1';
    root.style.transform = 'translateY(0)';
  }, 100);

  // Add subtle floating particles effect
  addFloatingParticles(root);

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
          <div id="rp-hint-bubble" class="rp-hint-bubble rp-hidden"></div>
          <div id="rp-solution" class="rp-solution rp-hidden">
            <div class="rp-solution-header">
              <span class="rp-solution-label">✓ Solution:</span>
              <div id="rp-correct-answer" class="rp-correct-answer"></div>
            </div>
            <div id="rp-explanation-toggle" class="rp-explanation-toggle">
              <span> Show Explanation</span>
              <span class="rp-toggle-arrow">▼</span>
            </div>
            <div id="rp-explanation" class="rp-explanation rp-hidden"></div>
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
  const hintBubble = root.querySelector('#rp-hint-bubble');
  const solutionEl = root.querySelector('#rp-solution');
  const correctAnswerEl = root.querySelector('#rp-correct-answer');
  const explanationToggleEl = root.querySelector('#rp-explanation-toggle');
  const explanationEl = root.querySelector('#rp-explanation');

  const puzzles = makePuzzles(vizArea, controls);
  let idx = 0;
  let streak = 0;
  let unlocked = false;
  let usedHints = 0;

  // Resize-aware equation text sizing
  const ro = new ResizeObserver(()=> autoFitEquation(eqEl));
  ro.observe(eqEl);

  function renderPuzzle() {
    unlocked = false; usedHints = 0;
    fbEl.textContent = '';
    controls.innerHTML = '';
    controls.classList.add('rp-hidden');
    vizArea.innerHTML = '';
    vizLocked.classList.remove('rp-hidden');
    ansEl.value = '';
    hideHint();
    solutionEl.classList.add('rp-hidden');
    explanationEl.classList.add('rp-hidden');
    explanationToggleEl.querySelector('span:first-child').textContent = ' Show Explanation';
    explanationToggleEl.querySelector('.rp-toggle-arrow').textContent = '▼';
    const p = puzzles[idx];
    stepEl.textContent = `Puzzle ${idx+1} / ${puzzles.length}`;
    console.log('Rendering puzzle:', p.key, 'with LaTeX:', p.displayTex);
    
    // Add subtle animation to equation
    eqEl.style.opacity = '0';
    eqEl.style.transform = 'scale(0.95)';
    
    renderEquation(eqEl, p.displayTex);
    autoFitEquation(eqEl);
    
    setTimeout(() => {
      eqEl.style.transition = 'all 0.4s ease';
      eqEl.style.opacity = '1';
      eqEl.style.transform = 'scale(1)';
    }, 50);
  }

  function checkAnswer() {
    // Don't allow checking if already unlocked
    if (unlocked) return;
    
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
    
    // Add unlock animation
    vizLocked.style.transition = 'all 0.6s ease';
    vizLocked.style.opacity = '0';
    vizLocked.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      vizLocked.classList.add('rp-hidden');
      const p = puzzles[idx];
      
      // Show the solution
      showSolution(p);
      
      // Debug: check if Plotly is available
      if (!window.Plotly || typeof window.Plotly.newPlot !== 'function') {
        console.error('[research-playground] Plotly not found!');
        vizArea.innerHTML = '<div style="color: red; padding: 20px; text-align: center;">Error: Plotly.js not loaded. Please refresh the page.</div>';
        return;
      }
      
      try {
        p.vizFactory();
        controls.classList.remove('rp-hidden');
        
        // Animate controls in
        controls.style.opacity = '0';
        controls.style.transform = 'translateY(20px)';
        controls.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
          controls.style.opacity = '1';
          controls.style.transform = 'translateY(0)';
        }, 100);
        
      } catch (error) {
        console.error('[research-playground] Visualization error:', error);
        vizArea.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">Error creating visualization: ${error.message}</div>`;
      }
    }, 300);
  }

  function feedback(text, good) {
    fbEl.textContent = text;
    fbEl.classList.remove('rp-good','rp-bad','rp-hint');
    fbEl.classList.add(good? 'rp-good':'rp-bad');
    
    // Add animation feedback
    fbEl.style.transform = 'scale(1.05)';
    fbEl.style.transition = 'all 0.2s ease';
    
    setTimeout(() => {
      fbEl.style.transform = 'scale(1)';
    }, 200);
    
    // Add success celebration for correct answers
    if (good) {
      fbEl.style.animation = 'celebration 0.6s ease';
      
      // Add confetti effect for major achievements
      if (streak >= 3) {
        createConfetti();
      }
    }
  }

  function onHint() {
    const p = puzzles[idx];
    const hint = p.hints[Math.min(usedHints, p.hints.length-1)];
    showHint(`Hint: ${hint}`);
    fbEl.textContent = '';
    usedHints++;
  }

  function onPrev(){ idx = (idx - 1 + puzzles.length) % puzzles.length; renderPuzzle(); }
  function onNext(){ idx = (idx + 1) % puzzles.length; renderPuzzle(); }

  subBtn.addEventListener('click', checkAnswer);
  ansEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); checkAnswer(); }});
  hintBtn.addEventListener('click', onHint);
  prevBtn.addEventListener('click', onPrev);
  nextBtn.addEventListener('click', onNext);
  explanationToggleEl.addEventListener('click', toggleExplanation);

  renderPuzzle();

  // Hint bubble controls
  function showHint(text){
    hintBubble.textContent = text;
    hintBubble.classList.remove('rp-hidden');
    hintBubble.animate([{opacity:0, transform:'translateY(6px)'},{opacity:1, transform:'translateY(0)'}], {duration:180, easing:'ease-out'});
    clearTimeout(showHint._t);
    showHint._t = setTimeout(()=> hideHint(), 2800);
  }
  function hideHint(){
    hintBubble.classList.add('rp-hidden');
  }
  
  function toggleExplanation() {
    const isHidden = explanationEl.classList.contains('rp-hidden');
    if (isHidden) {
      explanationEl.classList.remove('rp-hidden');
      explanationToggleEl.querySelector('span:first-child').textContent = ' Hide Explanation';
      explanationToggleEl.querySelector('.rp-toggle-arrow').textContent = '▲';
    } else {
      explanationEl.classList.add('rp-hidden');
      explanationToggleEl.querySelector('span:first-child').textContent = ' Show Explanation';
      explanationToggleEl.querySelector('.rp-toggle-arrow').textContent = '▼';
    }
  }
  
  function showSolution(puzzle) {
    // Show the solution section
    solutionEl.classList.remove('rp-hidden');
    
    // Display the correct answer in golden color
    const correctAnswer = puzzle.accept[0]; // Use the first accepted answer
    correctAnswerEl.innerHTML = correctAnswer;
    
    // Display explanation if available
    if (puzzle.explanation) {
      explanationEl.innerHTML = puzzle.explanation;
    } else {
      explanationEl.innerHTML = '<em>No explanation available for this puzzle.</em>';
    }
  }
}

// ————————————————————————————————————————————————
// Puzzles
function makePuzzles(vizArea, controls){
  return [
    // 1) Bellman (gamma)
    {
      key: 'bellman',
      displayTex: `V^{*}(s)=\\max_{a}\\left[ R(s,a) + <span class="rp-blank">___</span>\\sum_{s'} P(s'|s,a) V^{*}(s') \\right]`,
      accept: ['\\gamma','gamma','Γ','discount'],
      hints: ['Discount factor symbol', 'Greek letter, lower-case gamma'],
      explanation: 'The Bellman equation defines the optimal value function V*(s) as the maximum expected reward plus discounted future value. The discount factor γ (gamma) ensures that future rewards are weighted less than immediate ones, typically 0 < γ < 1.',
      vizFactory: ()=> createBellmanViz(vizArea, controls),
    },
    // 2) Cross-entropy (log yhat)
    {
      key: 'xent',
      displayTex: `\\mathcal{L} = - \\sum_i y_i \\; <span class="rp-blank">___</span>`,
      accept: [
        `\\log \\hat{y}_i`, `\\log \\hat y_i`,
        'log yhat_i','log yhat','log p_i','log \\hat p_i'
      ],
      hints: ['Log of predicted probability', 'Try \\log \\hat{y}_i'],
      explanation: 'Cross-entropy loss measures the difference between predicted probabilities and true labels. The log term ensures numerical stability and penalizes confident wrong predictions more heavily. This loss function is commonly used in classification tasks.',
      vizFactory: ()=> createClassificationViz(vizArea, controls),
    },
    // 3) Swiss roll (t sin t)
    {
      key: 'swiss',
      displayTex: `(x,y,z) = (t\\cos t, \\; y, \\; <span class="rp-blank">___</span>)`,
      accept: [`t\\sin t`, 't sin t', 't*sint', 't*sin(t)'],
      hints: ['Sine twin of t cos t', 'Format: t\\sin t'],
      explanation: 'The Swiss Roll is a classic manifold learning dataset that forms a spiral in 3D space. The parameter t controls the angle, creating a continuous surface that appears locally 2D but is globally curved. This dataset is often used to test dimensionality reduction algorithms.',
      vizFactory: ()=> createSwissRollViz(vizArea, controls),
    },
    // 4) Scaled dot-product attention (missing sqrt(d_k))
    {
      key: 'attention',
      displayTex: `\\text{softmax}\\!\\left( \\dfrac{QK^T}{<span class="rp-blank">___</span>} \\right) V`,
      accept: ['\\sqrt{d_k}','sqrt(d_k)','d_k^{1/2}', 'sqrt(dk)'],
      hints: ['variance scaling','think: dimension of keys'],
      explanation: 'Scaled dot-product attention divides the query-key dot product by √d_k to prevent the softmax from entering regions with extremely small gradients. This scaling factor helps maintain stable gradients during training of Transformer models.',
      vizFactory: ()=> createAttentionViz(vizArea, controls),
    },
    // 5) KL divergence (missing log ratio)
    {
      key: 'kl',
      displayTex: `D_{KL}(P\\|Q) = \\sum_x P(x) \\; <span class="rp-blank">___</span>`,
      accept: [`\\log \\frac{P(x)}{Q(x)}`, 'log P(x)/Q(x)', 'log(P/Q)'],
      hints: ['log of ratio','P over Q'],
      explanation: 'KL divergence measures the difference between two probability distributions P and Q. It quantifies how much information is lost when Q is used to approximate P. The log ratio term ensures the measure is asymmetric and always non-negative.',
      vizFactory: ()=> createKLViz(vizArea, controls),
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

  const data = [{ z: V, type:'surface', showscale:false, colorscale: darkSurfaceScale(), contours: {z:{show:false}} }];
  const layout = surfaceLayout('Value Function Surface');
  Plotly.newPlot(vizArea, data, layout, {displayModeBar:false});

  let animId = null;
  function animate(){ stepVI(); Plotly.update(vizArea, {z:[V]}); animId = requestAnimationFrame(animate); }

  const btn = playBtn; btn.onclick = () => {
    if (btn.dataset.state!=='playing'){ btn.dataset.state='playing'; btn.textContent='Pause'; animate(); }
    else { btn.dataset.state='paused'; btn.textContent='Play'; if (animId) cancelAnimationFrame(animId); }
  };
}

// ————————————————————————————————————————————————
// Visualization: Logistic regression decision boundary
function createClassificationViz(vizArea, controls){
  requirePlotly();
  const playBtn = playButton(controls);
  const lrInput = slider(controls, 'Learning rate η', 0.3, 0.05, 1.0, 0.05);
  const regInput = slider(controls, 'L2 λ', 0.0, 0.0, 1.0, 0.05);

  const {X, y} = makeGaussians();
  let w = [0,0], b = 0; // 2D logistic
  const n = X.length;
  function sigmoid(z){ return 1/(1+Math.exp(-z)); }
  function step(){
    let dw=[0,0], db=0; const lr = +lrInput.value; const lam=+regInput.value;
    for(let i=0;i<n;i++){
      const z = w[0]*X[i][0] + w[1]*X[i][1] + b;
      const p = sigmoid(z);
      const e = p - y[i];
      dw[0]+= e*X[i][0]; dw[1]+= e*X[i][1]; db+= e;
    }
    // gradient of NLL + (λ/2)||w||^2 → add λ w
    w[0]-= lr*(dw[0]/n + lam*w[0]);
    w[1]-= lr*(dw[1]/n + lam*w[1]);
    b   -= lr*(db/n);
  }
  function boundaryLine(){
    const xs=[-4,4];
    const ys = (Math.abs(w[1])<1e-6) ? [0,0] : xs.map(x=>-(w[0]/w[1])*x - b/w[1]);
    return {x: xs, y: ys};
  }

  const class0 = {x:[],y:[]}; const class1 = {x:[],y:[]};
  X.forEach((pt,i)=>{ (y[i]===0?class0:class1).x.push(pt[0]); (y[i]===0?class0:class1).y.push(pt[1]); });
  const l = boundaryLine();
  const traces = [
    {x: class0.x, y: class0.y, mode:'markers', type:'scatter', marker:{size:6, opacity:0.85}},
    {x: class1.x, y: class1.y, mode:'markers', type:'scatter', marker:{size:6, opacity:0.85}},
    {x: l.x, y: l.y, mode:'lines', type:'scatter', line:{width:3}}
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
    const ln = boundaryLine(); 
    // Update only the boundary line (3rd trace), preserve data points (1st and 2nd traces)
    Plotly.update(vizArea, {
      x: [class0.x, class1.x, ln.x], 
      y: [class0.y, class1.y, ln.y]
    }); 
    animId = requestAnimationFrame(animate); 
  }
  playBtn.onclick = () => {
    if (playBtn.dataset.state!=='playing'){ playBtn.dataset.state='playing'; playBtn.textContent='Pause'; animate(); }
    else { playBtn.dataset.state='paused'; playBtn.textContent='Play'; if (animId) cancelAnimationFrame(animId); }
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
  [turns, noise, nPts].forEach(inp=> inp.addEventListener('input', render));
  render();
}

// ————————————————————————————————————————————————
// Visualization: Attention heatmap
function createAttentionViz(vizArea, controls){
  requirePlotly();
  const dk = slider(controls, 'd_k', 16, 2, 128, 1, true);
  const temp = slider(controls, 'Temperature τ', 1.0, 0.5, 2.0, 0.05);

  function compute(){
    const L=8; const D = Math.max(2, Math.floor(+dk.value));
    const Q = randMat(L,D), K = randMat(L,D);
    const scale = 1/Math.sqrt(D);
    const logits = mul(Q, transpose(K));
    scaleMat(logits, scale/Math.max(0.25,+temp.value)); // temperature scaling
    const weights = softmaxRows(logits);
    return weights;
  }
  function render(){
    const W = compute();
    const trace = {z:W, type:'heatmap', colorscale: attnScale(), showscale:false};
    const layout = { paper_bgcolor:'rgba(0,0,0,0)', margin:{l:40,r:10,t:30,b:40},
      xaxis:{color:'rgba(232,241,248,0.8)', showgrid:false},
      yaxis:{color:'rgba(232,241,248,0.8)', autorange:'reversed', showgrid:false},
      title:{text:'Attention Weights', font:{color:'var(--fg)', size:14}} };
    Plotly.newPlot(vizArea, [trace], layout, {displayModeBar:false});
  }
  [dk, temp].forEach(i=> i.addEventListener('input', render));
  render();
}

// ————————————————————————————————————————————————
// Visualization: KL divergence between two 2D Gaussians with diagonal covariances
function createKLViz(vizArea, controls){
  requirePlotly();
  const muQx = slider(controls, 'μ_Qx', 1.0, -3.0, 3.0, 0.1);
  const muQy = slider(controls, 'μ_Qy', 0.0, -3.0, 3.0, 0.1);
  const sPx  = slider(controls, 'σ_Px', 1.0, 0.3, 2.5, 0.1);
  const sPy  = slider(controls, 'σ_Py', 1.0, 0.3, 2.5, 0.1);
  const sQx  = slider(controls, 'σ_Qx', 1.4, 0.3, 2.5, 0.1);
  const sQy  = slider(controls, 'σ_Qy', 0.8, 0.3, 2.5, 0.1);

  function KL_diag(muP, muQ, sP, sQ){
    // diag covariances; d=2
    const d=2;
    const term1 = Math.log((sQ[0]*sQ[1])/(sP[0]*sP[1]));
    const tr = (sP[0]*sP[0])/(sQ[0]*sQ[0]) + (sP[1]*sP[1])/(sQ[1]*sQ[1]);
    const dm0 = (muQ[0]-muP[0])/(sQ[0]);
    const dm1 = (muQ[1]-muP[1])/(sQ[1]);
    const quad = dm0*dm0 + dm1*dm1;
    return 0.5*(tr + quad - d + 2*term1);
  }

  function render(){
    const muP=[0,0], muQ=[+muQx.value, +muQy.value];
    const sP=[+sPx.value, +sPy.value];
    const sQ=[+sQx.value, +sQy.value];
    const kl = KL_diag(muP,muQ,sP,sQ);

    const grid = linspace(-4,4,120);
    const Zp = gridMap2D(grid, (x,y)=> gauss2D(x,y, muP[0],muP[1], sP[0],sP[1]));
    const Zq = gridMap2D(grid, (x,y)=> gauss2D(x,y, muQ[0],muQ[1], sQ[0],sQ[1]));

    const p = {z:Zp, x:grid, y:grid, type:'contour', showscale:false, contours:{showlines:false}, colorscale: [[0,'rgba(122,230,255,0.0)'],[1,'rgba(122,230,255,0.85)']] };
    const q = {z:Zq, x:grid, y:grid, type:'contour', showscale:false, contours:{showlines:false}, colorscale: [[0,'rgba(169,144,255,0.0)'],[1,'rgba(169,144,255,0.85)']] };

            // Add distance arrow between means
        const distanceArrow = {
          x: [muP[0], muQ[0]],
          y: [muP[1], muQ[1]],
          mode: 'lines',
          type: 'scatter',
          name: 'Distance',
          line: { color: 'purple', width: 1, dash: 'dash' }
        };

        // Add distance label
        const distanceLabel = {
          x: [(muP[0] + muQ[0]) / 2],
          y: [(muP[1] + muQ[1]) / 2 + 0.2],
          mode: 'text',
          type: 'scatter',
          text: [`${Math.sqrt((muQ[0] - muP[0])**2 + (muQ[1] - muP[1])**2).toFixed(2)}`],
          textposition: 'top center',
          textfont: { color: 'purple', size: 10 }
        };

    const layout = { paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)', margin:{l:30,r:10,t:30,b:30},
      xaxis:{color:'rgba(232,241,248,0.8)', gridcolor:'rgba(255,255,255,0.06)'},
      yaxis:{color:'rgba(232,241,248,0.8)', gridcolor:'rgba(255,255,255,0.06)'},
      title:{text:`KL(P‖Q) ≈ ${kl.toFixed(3)}`, font:{color:'var(--fg)', size:14}} };

    Plotly.newPlot(vizArea, [p,q,distanceArrow,distanceLabel], layout, {displayModeBar:false});
  }
  [muQx,muQy,sPx,sPy,sQx,sQy].forEach(i=> i.addEventListener('input', render));
  render();
}

// ————————————————————————————————————————————————
// Utilities
function makeTheme(overrides={}){
  return Object.assign({ bg:'#0B0F14', panel:'#0F141A', fg:'#E8F1F8', grid:'rgba(255,255,255,0.08)', accent:'#7AE6FF', accent2:'#A990FF', good:'#6BEFA3', bad:'#FF708D', amber:'#FFB86B' }, overrides);
}

function injectStylesOnce(){
  if (document.getElementById('rp-styles')) return;
  const css = `
  :root { --bg:#0B0F14; --panel:#0F141A; --fg:#E8F1F8; --grid:rgba(255,255,255,0.08); --accent:#7AE6FF; --accent2:#A990FF; --good:#6BEFA3; --bad:#FF708D; --amber:#FFB86B; }
  .rp-root { font-family: ui-sans-serif, Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; color: var(--fg); background: transparent; }
  .rp-wrap { background: linear-gradient(180deg, rgba(10,14,20,0.6), rgba(10,14,20,0.2)); padding: 16px; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.35), 0 0 30px rgba(122,230,255,0.1); }
  .rp-header { margin-bottom: 12px; }
  .rp-title { font-weight: 650; letter-spacing: 0.3px; font-size: 18px; background: linear-gradient(135deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .rp-sub { opacity: 0.8; font-size: 13px; }
  .rp-main { display: grid; grid-template-columns: 1.1fr 1.6fr; gap: 16px; align-items: stretch; }
  @media (max-width: 980px){ .rp-main { grid-template-columns: 1fr; } }
  .rp-puzzle { position: relative; background: var(--panel); border-radius: 14px; padding: 14px; border: 1px solid rgba(255,255,255,0.06); transition: all 0.3s ease; }
  .rp-puzzle:hover { border-color: rgba(122,230,255,0.2); box-shadow: 0 8px 25px rgba(0,0,0,0.2); }
  .rp-equation { min-height: 68px; display:flex; align-items:center; justify-content:center; font-size: 20px; padding: 8px; border-radius: 12px; background: linear-gradient(135deg, rgba(122,230,255,0.05), rgba(169,144,255,0.05)); border: 1px solid rgba(122,230,255,0.2); overflow:hidden; box-shadow: inset 0 2px 10px rgba(0,0,0,0.2); }
  .rp-input-row { display:flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 10px; }
  .rp-input { flex: 1 1 260px; background: rgba(10,16,22,0.8); border: 1px solid rgba(122,230,255,0.3); color: var(--fg); padding: 10px 12px; border-radius: 10px; outline: none; transition: all 0.3s ease; }
  .rp-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(122,230,255,0.2), 0 0 20px rgba(122,230,255,0.1); transform: translateY(-2px); }
  .rp-btn { background: linear-gradient(135deg, var(--accent), #5CC7D9); color: #051018; border: none; padding: 10px 12px; border-radius: 10px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(122,230,255,0.3); }
  .rp-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(122,230,255,0.4); }
  .rp-ghost { background: rgba(122,230,255,0.1); color: var(--fg); border: 1px solid rgba(122,230,255,0.3); transition: all 0.3s ease; }
  .rp-ghost:hover { background: rgba(122,230,255,0.2); border-color: var(--accent); }
  .rp-status { margin-left:auto; display:flex; gap:8px; align-items:center; font-size: 12px; opacity: 0.85; }
  .rp-dot { opacity: 0.5; }
  .rp-viz { background: linear-gradient(135deg, rgba(15,20,26,0.8), rgba(10,14,20,0.9)); border-radius: 14px; padding: 10px; border: 1px solid rgba(122,230,255,0.15); position: relative; }
  .rp-viz-locked { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size: 14px; color: rgba(232,241,248,0.8); backdrop-filter: blur(5px); background: radial-gradient(circle at 50% 40%, rgba(122,230,255,0.1), rgba(0,0,0,0.3)); border-radius: 12px; border:2px dashed rgba(122,230,255,0.3); animation: lockedPulse 3s ease-in-out infinite; }
  .rp-hidden { display:none !important; }
  .rp-viz-area { min-height: 340px; }
  .rp-controls { display:flex; gap:10px; flex-wrap: wrap; padding: 8px; border-top: 1px solid rgba(122,230,255,0.15); margin-top: 8px; }
  .rp-footer { margin-top: 12px; display:flex; align-items:center; justify-content:space-between; }
  .rp-step { opacity: 0.7; }
  .rp-good { color: var(--good); }
  .rp-bad { color: var(--bad); }
  .rp-hint { color: var(--amber); }
  .rp-blank { color: var(--good); filter: drop-shadow(0 0 6px rgba(107,239,163,0.35)); }
  .rp-chip { display:flex; flex-direction:column; gap:4px; padding:8px 10px; background:rgba(10,16,22,0.8); border:1px solid rgba(122,230,255,0.2); border-radius:10px; min-width: 160px; backdrop-filter: blur(5px); }
  .rp-chip label { font-size:11px; opacity:0.8; }
  .rp-chip input[type=range] { width: 160px; }
  .rp-play { padding:10px 14px; font-weight:700; background: linear-gradient(135deg, #6BEFA3, #4AA4A8) !important; box-shadow: 0 4px 15px rgba(107,239,163,0.3) !important; }
  .rp-play:hover { box-shadow: 0 8px 25px rgba(107,239,163,0.4) !important; }
  
  .rp-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; color: var(--accent); }
  .rp-loading-spinner { width: 40px; height: 40px; border: 3px solid rgba(122,230,255,0.2); border-top: 3px solid var(--accent); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
  .rp-loading-text { font-size: 14px; opacity: 0.8; }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .rp-hint-bubble { position:absolute; right:10px; bottom:10px; max-width: 70%; padding:10px 12px; border-radius: 10px; background: #121923; border: 1px solid rgba(255,255,255,0.14); color: var(--amber); box-shadow: 0 8px 24px rgba(0,0,0,0.35); font-size: 12px; }
  .rp-solution { margin-top: 16px; padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; }
  .rp-solution-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .rp-solution-label { font-weight: 600; color: var(--amber); font-size: 14px; }
  .rp-correct-answer { font-family: 'KaTeX_Main', 'Times New Roman', serif; font-size: 18px; color: var(--amber); font-weight: 600; }
  .rp-explanation-toggle { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.2s ease; }
  .rp-explanation-toggle:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); }
  .rp-explanation-toggle span:first-child { color: var(--accent); font-weight: 500; }
  .rp-toggle-arrow { color: var(--fg); opacity: 0.7; font-size: 12px; transition: transform 0.2s ease; }
  .rp-explanation { margin-top: 12px; padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; line-height: 1.5; color: rgba(232,241,248,0.9); font-size: 13px; }
  
  @keyframes celebration {
    0% { transform: scale(1); }
    25% { transform: scale(1.1) rotate(2deg); }
    50% { transform: scale(1.05) rotate(-1deg); }
    75% { transform: scale(1.08) rotate(1deg); }
    100% { transform: scale(1); }
  }
  
  @keyframes lockedPulse {
    0%, 100% { border-color: rgba(122,230,255,0.3); opacity: 1; }
    50% { border-color: rgba(122,230,255,0.6); opacity: 0.8; }
  }
  
  .rp-good {
    animation: celebration 0.6s ease;
  }
  `;
  const style = document.createElement('style'); style.id = 'rp-styles'; style.textContent = css; document.head.appendChild(style);
}

function renderEquation(el, tex){
  if (window.katex && window.katex.render) {
    try {
      // Replace the HTML span with a LaTeX placeholder that KaTeX can render
      // Use a subtle color that matches the theme instead of bright green
      const cleanTex = tex.replace(/<span class="rp-blank">___<\/span>/g, '\\color{#6BEFA3}{\\_\\_\\_}');
      console.log('Rendering LaTeX:', cleanTex);
      
      // Use displayMode: true for block math rendering
      window.katex.render(cleanTex, el, {
        throwOnError: false,
        displayMode: true,
        fleqn: false
      });
      return;
    } catch(e){
      console.warn('KaTeX render failed, falling back to HTML:', e);
      el.innerHTML = tex;
    }
  } else {
    console.warn('KaTeX not available, falling back to HTML');
    // Fallback: render as HTML directly
    el.innerHTML = tex;
  }
}

// Auto-fit equation font-size to avoid overflow
function autoFitEquation(el){
  const maxPx = 22, minPx = 14; // bounds for readability
  let size = maxPx;
  el.style.fontSize = size + 'px';
  // If overflow, shrink until it fits or min
  const guard = 20; let c=0;
  while(c++<guard && (el.scrollWidth > el.clientWidth - 12) && size > minPx){
    size -= 1; el.style.fontSize = size + 'px';
  }
}

function matchesAnswer(input, acceptable){
  const norm = normalizeMath(input);
  return acceptable.some(a => normalizeMath(a) === norm);
}
function normalizeMath(s){
  return String(s||'').trim().replace(/\\s+/g,'').replace(/[{}()]/g,'').replace(/\\hat/g,'^').toLowerCase();
}
function pulse(el){ el.animate([{boxShadow:'0 0 0 0 rgba(255,112,141,0.0)'},{boxShadow:'0 0 0 6px rgba(255,112,141,0.25)'},{boxShadow:'0 0 0 0 rgba(255,112,141,0.0)'}], {duration:500, easing:'ease-out'}); }
function zeros(h,w){ return Array.from({length:h},()=>Array.from({length:w},()=>0)); }
function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }
function randn(){ let u=0, v=0; while(u===0)u=Math.random(); while(v===0)v=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
function requirePlotly(){ if (!(window.Plotly && typeof window.Plotly.newPlot === 'function')){ console.warn('[research-playground] Plotly.js not found. Include it before initPlayground.'); } }
function darkSurfaceScale(){ return [ [0.0, '#0e1a22'], [0.2, '#123243'], [0.35, '#145b72'], [0.5, '#1c8aa3'], [0.65,'#5cc7d9'], [0.8,'#9dd9ff'], [1.0,'#cbb6ff'] ]; }
function darkPointScale(){ return [ [0.0, '#1a1e27'], [0.2, '#2a3848'], [0.4, '#2d6a73'], [0.6, '#4aa4a8'], [0.8, '#8fd9e2'], [1.0, '#f2c6ff'] ]; }
function attnScale(){ return [ [0,'#0B0F14'], [0.25,'#123243'], [0.5,'#1c8aa3'], [0.75,'#6BEFA3'], [1,'#FFB86B'] ]; }
function surfaceLayout(title){ return { paper_bgcolor:'rgba(0,0,0,0)', scene:{ xaxis:{ gridcolor:'rgba(255,255,255,0.08)', zeroline:false, color:'rgba(232,241,248,0.75)'}, yaxis:{ gridcolor:'rgba(255,255,255,0.08)', zeroline:false, color:'rgba(232,241,248,0.75)'}, zaxis:{ gridcolor:'rgba(255,255,255,0.08)', zeroline:false, color:'rgba(232,241,248,0.75)'}, bgcolor:'rgba(0,0,0,0)' }, margin:{l:0,r:0,b:0,t:30}, title:{text:title, font:{size:14, color:'var(--fg)'}} }; }

// Math helpers for attention
function randMat(r,c){ const A = Array.from({length:r},()=>Array.from({length:c},()=> randn())); return A; }
function transpose(A){ return A[0].map((_,j)=> A.map(row=> row[j])); }
function mul(A,B){ const r=A.length, c=B[0].length, k=A[0].length; const C=zeros(r,c); for(let i=0;i<r;i++){ for(let j=0;j<c;j++){ let s=0; for(let t=0;t<k;t++) s+=A[i][t]*B[t][j]; C[i][j]=s; } } return C; }
function scaleMat(A, s){ for(let i=0;i<A.length;i++){ for(let j=0;j<A[0].length;j++){ A[i][j]*=s; } } }
function softmaxRows(A){ const R=A.length, C=A[0].length; const out=zeros(R,C); for(let i=0;i<R;i++){ const row=A[i]; const m=Math.max(...row); const ex=row.map(v=>Math.exp(v-m)); const sum=ex.reduce((a,b)=>a+b,0); for(let j=0;j<C;j++) out[i][j]=ex[j]/sum; } return out; }

// Helpers for KL viz
function linspace(a,b,n){ const step=(b-a)/(n-1); return Array.from({length:n}, (_,i)=> a+i*step); }
function gridMap2D(grid, fn){ const n=grid.length; const Z=Array.from({length:n},()=>Array.from({length:n},()=>0)); for(let i=0;i<n;i++){ for(let j=0;j<n;j++){ Z[i][j]=fn(grid[j], grid[i]); } } return Z; }
function gauss2D(x,y, mx,my, sx,sy){ const nx=(x-mx)/sx, ny=(y-my)/sy; return Math.exp(-0.5*(nx*nx+ny*ny))/(2*Math.PI*sx*sy); }

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
  const btn = document.createElement('button'); 
  btn.className='rp-btn rp-play'; 
  btn.textContent='Play'; 
  btn.dataset.state='paused'; 
  parent.appendChild(btn); 
  return btn;
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

// Add subtle floating particles effect
function addFloatingParticles(container) {
  const particleCount = 8;
  const particles = [];
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: 2px;
      height: 2px;
      background: rgba(122, 230, 255, 0.3);
      border-radius: 50%;
      pointer-events: none;
      z-index: 1;
      opacity: 0;
      animation: float 8s infinite linear;
      animation-delay: ${i * 1}s;
    `;
    
    container.appendChild(particle);
    particles.push(particle);
  }
  
  // Add floating animation CSS
  if (!document.getElementById('particle-animations')) {
    const style = document.createElement('style');
    style.id = 'particle-animations';
    style.textContent = `
      @keyframes float {
        0% {
          opacity: 0;
          transform: translateY(100px) translateX(-50px);
        }
        10% {
          opacity: 0.6;
        }
        90% {
          opacity: 0.6;
        }
        100% {
          opacity: 0;
          transform: translateY(-100px) translateX(50px);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Create confetti effect for achievements
function createConfetti() {
  const colors = ['#7AE6FF', '#A990FF', '#6BEFA3', '#FFB86B', '#FF708D'];
  const confettiCount = 50;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      top: -10px;
      left: ${Math.random() * window.innerWidth}px;
      pointer-events: none;
      z-index: 9999;
      animation: confettiFall 3s linear forwards;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    
    document.body.appendChild(confetti);
    
    // Remove confetti after animation
    setTimeout(() => {
      if (confetti.parentNode) {
        confetti.parentNode.removeChild(confetti);
      }
    }, 3000);
  }
  
  // Add confetti animation CSS
  if (!document.getElementById('confetti-animations')) {
    const style = document.createElement('style');
    style.id = 'confetti-animations';
    style.textContent = `
      @keyframes confettiFall {
        0% {
          transform: translateY(-10px) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// End of module
