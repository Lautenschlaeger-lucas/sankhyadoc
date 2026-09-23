(function () {
  var preference;
  try { preference = localStorage.getItem('magis5-theme'); } catch (_) {}
  var system = window.matchMedia('(prefers-color-scheme: dark)');
  function apply() {
    document.documentElement.dataset.theme = preference === 'dark' || preference === 'light' ? preference : system.matches ? 'dark' : 'light';
    window.dispatchEvent(new Event('magis-theme-change'));
  }
  apply();
  system.addEventListener('change', function () {
    try { preference = localStorage.getItem('magis5-theme'); } catch (_) {}
    apply();
  });
  window.addEventListener('storage', function (event) {
    if (event.key === 'magis5-theme' || event.key === null) { preference = event.newValue; apply(); }
  });
}());
