// Loader aman & portabel (jalan di GitHub Pages dan githack preview)
(async () => {
  // base akan menunjuk ke .../web-static/js/
  const thisScript = document.currentScript;
  const base = new URL('.', thisScript?.src || location.href);

  // Bangun URL relatif dari lokasi file ini
  const cfgURL  = new URL('../config/app-config.json', base).href;
  const heroURL = new URL('../blocks/hero.v1.js', base).href;

  // 1) Muat konfigurasi publik
  let cfg = { siteName: 'NafsFlow' };
  try {
    const r = await fetch(cfgURL, { cache: 'no-store' });
    if (r.ok) cfg = await r.json();
  } catch (e) {
    console.warn('[config] gagal memuat, pakai default', e);
  }
  window.__APP_CONFIG = Object.freeze(cfg);

  // 2) Daftarkan blok
  try {
    await import(heroURL);
  } catch (e) {
    console.warn('[blocks] gagal daftar', e);
  }

  // 3) Tanda siap
  document.documentElement.setAttribute('data-nf', 'ready');
})();
