/* NafsFlow LLM Client (vanilla JS) — siap pakai di banyak file
   - global API: 
     window.generateViaProxy(prompt, options?)
     window.NafsUI.showLoading(msg)
     window.NafsUI.hideLoading()
     window.NafsUI.toast(msg, type='info')
*/

(function (global) {
  const NafsUI = {
    _overlay: null,
    _toastWrap: null,
    ensureOverlay() {
      if (this._overlay) return;
      const el = document.createElement('div');
      el.id = 'nafs-overlay';
      el.style.cssText = `
        position:fixed; inset:0; display:none; align-items:center; justify-content:center;
        background:rgba(0,0,0,.35); z-index:9999;
      `;
      el.innerHTML = `
        <div style="
          min-width:240px; max-width:80vw; background:#fff; color:#111; 
          border-radius:14px; padding:16px 18px; box-shadow:0 10px 30px rgba(0,0,0,.35);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          text-align:center;">
          <div style="display:flex; gap:10px; align-items:center; justify-content:center;">
            <span class="nafs-spinner" style="
              width:18px;height:18px;border:2px solid #e2e8f0;border-top-color:#16a34a;
              border-radius:50%; display:inline-block; animation:nafs-spin 0.9s linear infinite;"></span>
            <span id="nafs-loading-text" style="font-weight:600;">Memproses…</span>
          </div>
        </div>
        <style>
          @keyframes nafs-spin {to{transform:rotate(360deg)}}
        </style>
      `;
      document.body.appendChild(el);
      this._overlay = el;
    },
    ensureToast() {
      if (this._toastWrap) return;
      const w = document.createElement('div');
      w.id = 'nafs-toast';
      w.style.cssText = `
        position:fixed; right:16px; top:16px; z-index:10000; display:flex; flex-direction:column; gap:8px;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
      `;
      document.body.appendChild(w);
      this._toastWrap = w;
    },
    showLoading(msg = 'Memproses…') {
      this.ensureOverlay();
      const t = this._overlay.querySelector('#nafs-loading-text');
      if (t) t.textContent = msg;
      this._overlay.style.display = 'flex';
    },
    hideLoading() {
      if (this._overlay) this._overlay.style.display = 'none';
    },
    toast(message, type = 'info', ms = 3000) {
      this.ensureToast();
      const bg = type === 'error' ? '#fee2e2' : type === 'success' ? '#dcfce7' : '#e5e7eb';
      const bd = type === 'error' ? '#ef4444' : type === 'success' ? '#16a34a' : '#6b7280';
      const el = document.createElement('div');
      el.style.cssText = `
        background:${bg}; border-left:4px solid ${bd}; color:#111; padding:10px 12px; border-radius:10px;
        box-shadow:0 6px 18px rgba(0,0,0,.15); min-width:240px; max-width:60vw;
      `;
      el.textContent = message;
      this._toastWrap.appendChild(el);
      setTimeout(() => el.remove(), ms);
    }
  };
  global.NafsUI = NafsUI;

  async function fetchWithTimeout(url, options = {}, timeoutMs = 60000) {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: ctrl.signal });
      return res;
    } finally {
      clearTimeout(id);
    }
  }

  async function generateViaProxy(prompt, options = {}) {
    const {
      onStart, onDone, onError, loadingText = 'Memproses…', timeoutMs = 60000
    } = options;

    if (!prompt || typeof prompt !== 'string') {
      const err = new Error('Prompt kosong/invalid');
      onError?.(err);
      throw err;
    }

    try {
      onStart?.();
      NafsUI.showLoading(loadingText);

      const res = await fetchWithTimeout('/api/generate.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      }, timeoutMs);

      if (!res.ok) throw new Error('Proxy error ' + res.status);

      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Terjadi kesalahan');

      let result = json.data;
      if (!result) {
        try { result = JSON.parse(json.text); }
        catch { result = json.text; }
      }

      onDone?.(result);
      return result;
    } catch (e) {
      NafsUI.toast(e.message || 'Gagal memproses', 'error', 4000);
      onError?.(e);
      throw e;
    } finally {
      NafsUI.hideLoading();
    }
  }

  global.generateViaProxy = generateViaProxy;
})(window);
