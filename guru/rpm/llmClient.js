/* NafsFlow LLM Client (fix 405) */
(function (global) {
  // ——————————————————————————————————————————————————
  // PAKAI URL ABSOLUT KE HOSTINGER (ganti jika domainmu beda)
  // ——————————————————————————————————————————————————
  const HOST = 'https://linen-chamois-717264.hostingersite.com';
  const CANDIDATE_ENDPOINTS = [
    `${HOST}/api/generate.php`,
    `${HOST}/api/generator.php`,
  ];

  // UI mini (loading + toast)
  const NafsUI = {
    _overlay:null,_toastWrap:null,
    ensureOverlay(){ if(this._overlay) return;
      const el=document.createElement('div');
      el.style.cssText='position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.35);z-index:9999';
      el.innerHTML=`<div style="min-width:240px;background:#fff;color:#111;border-radius:14px;padding:16px 18px;box-shadow:0 10px 30px rgba(0,0,0,.35);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;text-align:center;">
        <span style="width:18px;height:18px;border:2px solid #e2e8f0;border-top-color:#16a34a;border-radius:50%;display:inline-block;margin-right:8px;vertical-align:middle;animation:spin .9s linear infinite"></span>
        <span id="nafs-loading-text" style="font-weight:600;">Memproses…</span>
      </div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
      document.body.appendChild(el); this._overlay=el; },
    ensureToast(){ if(this._toastWrap) return;
      const w=document.createElement('div');
      w.style.cssText='position:fixed;right:16px;top:16px;z-index:10000;display:flex;flex-direction:column;gap:8px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial';
      document.body.appendChild(w); this._toastWrap=w; },
    showLoading(msg='Memproses…'){ this.ensureOverlay(); this._overlay.querySelector('#nafs-loading-text').textContent=msg; this._overlay.style.display='flex'; },
    hideLoading(){ if(this._overlay) this._overlay.style.display='none'; },
    toast(m,t='info',ms=3000){ this.ensureToast();
      const bg=t==='error'?'#fee2e2':t==='success'?'#dcfce7':'#e5e7eb';
      const bd=t==='error'?'#ef4444':t==='success'?'#16a34a':'#6b7280';
      const el=document.createElement('div');
      el.style.cssText=`background:${bg};border-left:4px solid ${bd};color:#111;padding:10px 12px;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,.15);min-width:240px;max-width:60vw`;
      el.textContent=m; this._toastWrap.appendChild(el); setTimeout(()=>el.remove(),ms); }
  };
  global.NafsUI = NafsUI;

  async function tryPostJSON(url, body, timeoutMs) {
    const ctrl = new AbortController();
    const id = setTimeout(()=>ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal
      });
      return res;
    } finally {
      clearTimeout(id);
    }
  }

  async function generateViaProxy(prompt, options = {}) {
    const { loadingText='Memproses…', onDone, onError, timeoutMs=60000 } = options;
    if (!prompt || typeof prompt!=='string'){ const e=new Error('Prompt kosong'); onError?.(e); throw e; }

    NafsUI.showLoading(loadingText);
    let lastErr = null;

    try {
      for (const url of CANDIDATE_ENDPOINTS) {
        try {
          const res = await tryPostJSON(url, { prompt }, timeoutMs);

          // Handle preflight/blocked cases: 405/404/500 dsb → coba endpoint berikutnya
          if (!res.ok) {
            lastErr = new Error(`Proxy error ${res.status} @ ${url}`);
            continue;
          }

          const json = await res.json();
          if (!json.ok) {
            lastErr = new Error(json.error || `Gagal @ ${url}`);
            continue;
          }

          // sukses
          let result = json.data || null;
          if (!result) {
            try { result = JSON.parse(json.text); } catch { result = json.text; }
          }
          onDone?.(result);
          return result;
        } catch (e) {
          // network/timeout
          lastErr = e;
          continue;
        }
      }

      // kalau sampai sini, semua candidate gagal
      throw lastErr || new Error('Semua endpoint gagal');
    } catch (e) {
      NafsUI.toast(e.message || 'Gagal memproses','error',4000);
      onError?.(e);
      throw e;
    } finally {
      NafsUI.hideLoading();
    }
  }

  global.generateViaProxy = generateViaProxy;
})(window);
