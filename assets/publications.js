/* Single source of truth for publications.
   - `selected: true` puts the entry on the home page.
   - `type` is one of: conference | journal | workshop | preprint
   - `thumb` is optional; drop an image in imgs/pubs/ and reference it here.
     Without one, the tile shows `venueShort` (or the first word of `venue`).
   - `note` shows as a small badge next to the venue (e.g. "Oral", "Spotlight").
   Ordered newest first within a year; the renderer groups by `year`. */
window.PUBLICATIONS = [
  {
    title: "Trajectory-Level Redirection Attacks on Vision-Language-Action Models",
    authors: ["Gokul Puthumanaillam", "Vardhan Dongre", "Pranay Thangeda", "Hooshang Nayyeri", "Dilek Hakkani-Tür", "Melkior Ornik"],
    venue: "CoRL 2026", venueShort: "CoRL", year: 2026, type: "conference", selected: true,
    thumb: "imgs/pubs/vla-redirection.gif",
    links: { paper: "https://arxiv.org/abs/2606.12978" }
  },
  {
    title: "Embodied Multi-Agent Coordination by Aligning World Models Through Dialogue",
    authors: ["Vardhan Dongre", "Dilek Hakkani-Tür"],
    venue: "SIGDIAL", year: 2026, type: "conference", selected: true,
    thumb: "imgs/pubs/embodied-coordination.jpg",
    links: { paper: "https://arxiv.org/abs/2605.12920" }
  },
  {
    title: "When Attention Closes: How LLMs Lose the Thread in Multi-Turn Interaction",
    authors: ["Vardhan Dongre", "Joseph Hsieh", "Viet Dac Lai", "Seunghyun Yoon", "Trung Bui", "Dilek Hakkani-Tür"],
    venue: "arXiv preprint", year: 2026, type: "preprint", selected: true,
    thumb: "imgs/pubs/attention-closes.jpg",
    links: { paper: "https://arxiv.org/abs/2605.12922" }
  },
  {
    title: "Drift No More? Context Equilibria in Multi-Turn LLM Interactions",
    authors: ["Vardhan Dongre", "Ryan A. Rossi", "Viet Dac Lai", "David Seunghyun Yoon", "Dilek Hakkani-Tür", "Trung Bui"],
    venue: "AAAI 2026 Workshops — Trustworthy Agents; Personalization for Foundation Models", year: 2025, type: "workshop", note: "Oral Spotlight",
    thumb: "imgs/pubs/drift-no-more.jpg",
    links: { paper: "https://arxiv.org/abs/2510.07777" }
  },
  {
    title: "Plan Verification for LLM-Based Embodied Task Completion Agents",
    authors: ["Ananth Hariharan", "Vardhan Dongre", "Dilek Hakkani-Tür", "Gokhan Tur"],
    venue: "NeurIPS 2025 Workshop on Embodied World Models for Decision Making", year: 2025, type: "workshop",
    thumb: "imgs/pubs/plan-verification.jpg",
    links: { paper: "https://arxiv.org/abs/2509.02761" }
  },
  {
    title: "MIRAGE: A Benchmark for Multimodal Information-Seeking and Reasoning in Agricultural Expert-Guided Conversations",
    authors: ["Vardhan Dongre", "Chi Gui", "Shubham Garg", "Hooshang Nayyeri", "Gokhan Tur", "Dilek Hakkani-Tür", "Vikram S. Adve"],
    venue: "NeurIPS 2025, Datasets & Benchmarks", venueShort: "NeurIPS", year: 2025, type: "conference", selected: true,
    thumb: "imgs/pubs/mirage.jpg",
    links: { paper: "https://arxiv.org/abs/2506.20100", code: "https://github.com/MIRAGE-Benchmark/MIRAGE-Benchmark", leaderboard: "https://mirage-benchmark.github.io/" }
  },
  {
    title: "A Desideratum for Conversational Agents: Capabilities, Challenges, and Future Directions",
    authors: ["Emre Can Acikgoz", "Cheng Qian", "Hongru Wang", "Vardhan Dongre", "Xiusi Chen", "Heng Ji", "Dilek Hakkani-Tür", "Gokhan Tur"],
    venue: "arXiv preprint", year: 2025, type: "preprint",
    thumb: "imgs/pubs/desideratum.jpg",
    links: { paper: "https://arxiv.org/abs/2504.16939" }
  },
  {
    title: "Better Slow than Sorry: Introducing Positive Friction for Reliable Dialogue Systems",
    authors: ["Mert İnan", "Anthony Sicilia", "Suvodip Dey", "Vardhan Dongre", "Tejas Srinivasan", "Jesse Thomason", "Gokhan Tur", "Dilek Hakkani-Tür", "Malihe Alikhani"],
    venue: "Transactions of the Association for Computational Linguistics (TACL)", venueShort: "TACL", year: 2025, type: "journal", selected: true,
    thumb: "imgs/pubs/positive-friction.jpg",
    links: { paper: "https://arxiv.org/abs/2501.17348", code: "https://github.com/Merterm/Positive-Friction-Dialogue" }
  },
  {
    title: "ReSpAct: Harmonizing Reasoning, Speaking, and Acting Towards Building Large Language Model-Based Conversational AI Agents",
    authors: ["Vardhan Dongre", "Xiaocheng Yang", "Emre Can Acikgoz", "Suvodip Dey", "Gokhan Tur", "Dilek Hakkani-Tür"],
    venue: "IWSDS 2024", year: 2024, type: "conference", note: "Oral", selected: true,
    thumb: "imgs/pubs/respact.jpg",
    links: { paper: "https://arxiv.org/abs/2411.00927", code: "https://github.com/vardhandongre/Respact" }
  },
  {
    title: "Simulating User Agents for Embodied Conversational AI",
    authors: ["Daniel Philipov", "Vardhan Dongre", "Gokhan Tur", "Dilek Hakkani-Tür"],
    venue: "NeurIPS 2024 Workshop on Open-World Agents", year: 2024, type: "workshop",
    thumb: "imgs/pubs/user-agents.jpg",
    links: { paper: "https://arxiv.org/abs/2410.23535" }
  },
  {
    title: "From Context to Action: Analysis of the Impact of State Representation and Context on the Generalization of Multi-Turn Web Navigation Agents",
    authors: ["Nalin Tiwary", "Vardhan Dongre", "Sanil Arun Chawla", "Ashwin Lamani", "Dilek Hakkani-Tür"],
    venue: "NeurIPS 2024 Workshop on Open-World Agents", year: 2024, type: "workshop",
    thumb: "imgs/pubs/context-to-action.jpg",
    links: { paper: "https://arxiv.org/abs/2410.23555" }
  },
  {
    title: "Evaluating Uncertainty Quantification Approaches for Neural PDEs in Scientific Applications",
    authors: ["Vardhan Dongre", "Gurpreet Singh Hora"],
    venue: "NeurIPS 2023 AI for Science Workshop", year: 2023, type: "workshop",
    thumb: "imgs/pubs/neural-pde-uq.jpg",
    links: { paper: "https://arxiv.org/abs/2311.04457" }
  },
  {
    title: "Adaptive Re-calibration of Channel-wise Features for Adversarial Audio Classification",
    authors: ["Vardhan Dongre", "Abhinav Thimma Reddy", "Nikhitha Reddeddy"],
    venue: "arXiv preprint", year: 2022, type: "preprint",
    thumb: "imgs/pubs/adversarial-audio.jpg",
    links: { paper: "https://arxiv.org/abs/2210.11722" }
  }
];

/* Renders publication entries into a container.
   opts: { selectedOnly, groupByYear, thumbs, compact } */
window.renderPublications = function(container, opts){
  opts = opts || {};
  var ME = "Vardhan Dongre";
  var pubs = window.PUBLICATIONS.filter(function(p){ return !opts.selectedOnly || p.selected; });
  var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };

  function entry(p){
    var authors = p.authors.map(function(a){ return a === ME ? '<span class="me">' + esc(a) + '</span>' : esc(a); }).join(', ');
    var links = Object.keys(p.links || {}).map(function(k){
      return '<a href="' + esc(p.links[k]) + '" target="_blank" rel="noopener">' + esc(k) + '</a>';
    }).join('');
    var badge = p.note ? '<span class="badge">' + esc(p.note) + '</span>' : '';
    var thumb = '';
    if (opts.thumbs){
      var root = document.body.dataset.root || '';
      thumb = '<div class="thumb">' + (p.thumb
        ? '<img src="' + root + esc(p.thumb) + '" alt="" loading="lazy">'
        : '<span class="mono">' + esc(p.venueShort || p.venue.split(/[ ,]/)[0]) + '</span>') + '</div>';
    }
    var titleHtml = p.links && p.links.paper ? '<a href="' + esc(p.links.paper) + '" target="_blank" rel="noopener">' + esc(p.title) + '</a>' : esc(p.title);
    return '<article class="pub" data-type="' + esc(p.type) + '" data-year="' + p.year + '">' + thumb +
      '<div>' +
        '<h3 class="title">' + titleHtml + '</h3>' +
        '<p class="authors">' + authors + '</p>' +
        '<p class="venue"><em>' + esc(p.venue) + '</em>' + (p.venue.indexOf(String(p.year)) < 0 ? ', ' + p.year : '') + badge + '</p>' +
        (links ? '<div class="links">' + links + '</div>' : '') +
      '</div></article>';
  }

  var html = '';
  if (opts.groupByYear){
    var years = [];
    pubs.forEach(function(p){ if (years.indexOf(p.year) < 0) years.push(p.year); });
    years.sort(function(a,b){ return b - a; });
    html = years.map(function(y){
      return '<section class="year-group" data-year="' + y + '"><h2 class="year-head">' + y + '</h2>' +
        '<div class="pub-list' + (opts.compact ? ' compact' : '') + '">' +
        pubs.filter(function(p){ return p.year === y; }).map(entry).join('') + '</div></section>';
    }).join('');
  } else {
    html = '<div class="pub-list' + (opts.compact ? ' compact' : '') + '">' + pubs.map(entry).join('') + '</div>';
  }
  container.innerHTML = html;
  return pubs;
};
