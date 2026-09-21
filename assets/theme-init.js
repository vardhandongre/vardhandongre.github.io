/* Theme bootstrap — runs in <head> before first paint to avoid a flash. */
(function(){
  try{
    var saved = localStorage.getItem('vd-theme');
    var prefDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = saved || (prefDark ? 'dark' : 'light');
  }catch(e){
    document.documentElement.dataset.theme = 'light';
  }
})();
