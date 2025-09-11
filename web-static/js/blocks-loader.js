// Loader aman: hanya menyiapkan config & mendaftarkan blok.
// Tidak mengubah tampilan karena belum dipakai di HTML manapun.
(async () => {
  // 1) Muat konfigurasi publik
  let cfg = { siteName: 'NafsFlow' };
  try {
    const r = await fetch('/web-static/config/app-config.json', { cache: 'no-store' });
    if (r.ok) cfg = await r.json();
  } catch (e) {
    console.warn('[config] gagal memuat, pakai default', e);
  }
  window.__APP_CONFIG = Object.freeze(cfg);

  // 2) Daftarkan blok (masih “siaga”, belum tampil)
  try {
    await import('/web-static/blocks/hero.v1.js');
  } catch (e) {
    console.warn('[blocks] gagal daftar', e);
  }

  // 3) Tanda siap (untuk pengecekan devtools)
  document.documentElement.setAttribute('data-nf', 'ready');
})();
