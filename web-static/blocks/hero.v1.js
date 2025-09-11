// Blok contoh (Hero). Saat ini DISSEMBUNYIKAN supaya tidak mengubah UI.
class NfHero extends HTMLElement {
  constructor(){ super(); this.attachShadow({ mode:'open' }); }
  connectedCallback(){
    const cfg = window.__APP_CONFIG || {};
    const title = this.getAttribute('title') || cfg.siteName || 'NafsFlow';
    this.shadowRoot.innerHTML = `
      <style>:host{display:block}</style>
      <!-- hidden = tidak terlihat. Kita aktifkan nanti di Tahap 2 -->
      <section hidden aria-hidden="true"><h1>${title}</h1></section>
    `;
  }
}
customElements.define('nf-hero', NfHero);
