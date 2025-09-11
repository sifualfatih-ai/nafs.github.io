// Blok Hero (v1) — tampil sederhana, terisolasi di Shadow DOM.
class NfHero extends HTMLElement {
  constructor(){ super(); this.attachShadow({ mode:'open' }); }

  connectedCallback(){
    const cfg = window.__APP_CONFIG || {};
    const title = this.getAttribute('title') || cfg.siteName || 'NafsFlow';
    const subtitle = this.getAttribute('subtitle') || 'Solusi workflow AI untuk bisnis Anda.';
    const ctaText = this.getAttribute('cta-text') || 'Coba Sekarang';
    const ctaHref = this.getAttribute('cta-href') || (cfg.links && cfg.links.pelanggan) || '#';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; background:#17151f; color:#fff; }
        .wrap { max-width:1040px; margin:0 auto; padding:48px 16px; }
        h1 { font-size:40px; line-height:1.1; margin:0 0 12px; }
        p { opacity:.85; max-width:680px; margin:0 0 20px; }
        a.cta {
          display:inline-block; text-decoration:none; padding:10px 16px;
          border-radius:12px; background:#7c5cff; color:#fff;
        }
        a.cta:focus, a.cta:hover { filter:brightness(1.1); }
      </style>
      <section class="wrap">
        <h1>${title}</h1>
        <p>${subtitle}</p>
        <a class="cta" href="${ctaHref}">${ctaText}</a>
      </section>
    `;
  }
}
customElements.define('nf-hero', NfHero);
