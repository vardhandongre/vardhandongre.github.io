/* Theme toggle button + state propagation.
   Loaded after DOM. Looks for a [data-theme-toggle] button and wires it up. */
(function(){
  function setTheme(t){
    document.documentElement.dataset.theme = t;
    try{ localStorage.setItem('vd-theme', t); }catch(e){}
    document.querySelectorAll('[data-theme-toggle]').forEach(function(b){
      b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
      b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }
  function init(){
    var current = document.documentElement.dataset.theme || 'light';
    document.querySelectorAll('[data-theme-toggle]').forEach(function(btn){
      btn.setAttribute('aria-pressed', current === 'dark' ? 'true' : 'false');
      btn.setAttribute('aria-label', current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.addEventListener('click', function(){
        var next = (document.documentElement.dataset.theme === 'dark') ? 'light' : 'dark';
        setTheme(next);
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
