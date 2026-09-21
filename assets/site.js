/* Site chrome shared by every page: sidebar nav, mobile drawer, theme toggle,
   backdrop ornament. Pages opt in with:

     <body data-root="../" data-page="notes">
     <script src="../assets/site.js"></script>

   data-root  — relative path back to the site root ("" for top-level pages)
   data-page  — which nav item to highlight: home | publications | notes | contact
*/
(function(){
  var root = document.body.dataset.root || '';
  var page = document.body.dataset.page || '';

  var icons = {
    home:'<svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
    research:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg>',
    pubs:'<svg viewBox="0 0 24 24"><path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z"/><path d="M4 4v16a3 3 0 0 1 3-3h11"/><path d="M8 8h6M8 12h6"/></svg>',
    notes:'<svg viewBox="0 0 24 24"><path d="M17 3l4 4L8 20H4v-4z"/><path d="M14 6l4 4"/></svg>',
    contact:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    sun:'<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon:'<svg class="moon" viewBox="0 0 24 24" fill="currentColor"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>'
  };

  function item(key, href, label, icon){
    var cur = key === page ? ' class="is-current" aria-current="page"' : '';
    return '<a href="' + root + href + '"' + cur + '>' + icons[icon] + '<span>' + label + '</span></a>';
  }

  var sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.innerHTML =
    '<a class="brand" href="' + root + 'index.html">Vardhan Dongre</a>' +
    '<nav aria-label="Primary">' +
      item('home', 'index.html', 'Home', 'home') +
      item('research', 'index.html#research', 'Research', 'research') +
      item('publications', 'publications.html', 'Publications', 'pubs') +
      '<div class="sub"><a href="' + root + 'index.html#publications">Selected</a><a href="' + root + 'publications.html">All papers</a></div>' +
      item('notes', 'notes/index.html', 'Notes', 'notes') +
      item('contact', 'index.html#contact', 'Contact', 'contact') +
    '</nav>' +
    '<div class="divider"></div>' +
    '<div class="meta-links">' +
      '<a href="https://scholar.google.com/citations?user=sSt2OvIAAAAJ&hl=en">Google Scholar</a>' +
      '<a href="https://github.com/vardhandongre">GitHub</a>' +
      '<a href="https://x.com/Vardhan_Dongre">X / Twitter</a>' +
      '<a href="mailto:vdongre2@illinois.edu">Email</a>' +
    '</div>' +
    '<div class="bottom">' +
      '<button class="theme-toggle" data-theme-toggle type="button" aria-label="Toggle theme">' + icons.sun + icons.moon + '</button>' +
      '<span>&copy; 2026</span>' +
    '</div>';

  var topbar = document.createElement('div');
  topbar.className = 'topbar';
  topbar.innerHTML = '<a class="brand" href="' + root + 'index.html">Vardhan Dongre</a>' +
    '<button type="button" aria-label="Open menu" data-menu>&#9776;</button>';

  var scrim = document.createElement('div');
  scrim.className = 'scrim';

  var backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.innerHTML =
    '<svg viewBox="0 0 520 640" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round">' +
      '<path d="M420 20c-40 60-110 70-150 140s10 150-60 200-160 40-190 120"/>' +
      '<path d="M470 40c-30 80-120 90-160 160s0 140-70 190-150 50-180 130"/>' +
      '<path d="M500 90c-20 70-100 100-140 170s-10 130-80 180-130 60-160 140"/>' +
      '<path d="M380 10c-60 50-100 120-90 200s60 120 10 190-120 90-130 170"/>' +
      '<path d="M440 0c-70 40-120 110-100 190s70 110 30 180-110 100-120 180" opacity=".6"/>' +
      '<path d="M510 160c-40 40-110 60-140 130s20 120-40 170-120 60-150 140" opacity=".6"/>' +
      '<path d="M350 60c-30 90 20 150-20 220s-110 80-100 170" opacity=".5"/>' +
      '<path d="M480 240c-60 30-90 100-90 170s-60 100-110 150" opacity=".5"/>' +
      '<circle cx="404" cy="132" r="2.5" fill="currentColor" stroke="none" opacity=".7"/>' +
      '<circle cx="318" cy="342" r="2" fill="currentColor" stroke="none" opacity=".7"/>' +
      '<circle cx="452" cy="286" r="2" fill="currentColor" stroke="none" opacity=".7"/>' +
    '</svg>';

  var shell = document.querySelector('.shell');
  if (shell){
    shell.insertBefore(sidebar, shell.firstChild);
    document.body.insertBefore(topbar, shell);
    document.body.insertBefore(scrim, shell);
    document.body.insertBefore(backdrop, document.body.firstChild);
  }

  // Mobile drawer
  function closeMenu(){ sidebar.classList.remove('open'); scrim.classList.remove('show'); }
  topbar.querySelector('[data-menu]').addEventListener('click', function(){
    sidebar.classList.toggle('open'); scrim.classList.toggle('show');
  });
  scrim.addEventListener('click', closeMenu);
  sidebar.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });

  // Theme toggle
  function setTheme(t){
    document.documentElement.dataset.theme = t;
    try{ localStorage.setItem('vd-theme', t); }catch(e){}
    document.querySelectorAll('[data-theme-toggle]').forEach(function(b){
      b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }
  setTheme(document.documentElement.dataset.theme || 'light');
  document.querySelectorAll('[data-theme-toggle]').forEach(function(btn){
    btn.addEventListener('click', function(){
      setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  });
})();
