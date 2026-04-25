/* Theme system — light (cream) and dark (sage)
   Loaded inline in <head> BEFORE first paint to avoid flash. */
(function(){
  try{
    var saved = localStorage.getItem('vd-theme');
    var prefDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved || (prefDark ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
  }catch(e){
    document.documentElement.dataset.theme = 'light';
  }
})();
