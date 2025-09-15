/* hotfix-nafsflow-20250915.js */
(function(){
  const $ = (s,root=document)=>root.querySelector(s);
  const $$ = (s,root=document)=>Array.from(root.querySelectorAll(s));
  const on = (el,ev,fn,opt)=>el&&el.addEventListener(ev,fn,opt);

  // Cache bust
  (()=>{
    const ver='20250915';
    $$('link[rel="stylesheet"], script[src]').forEach(n=>{
      const attr = n.tagName==='LINK'?'href':'src';
      try{
        const u=new URL(n.getAttribute(attr), location.origin);
        if(!u.searchParams.has('v')){u.searchParams.set('v',ver); n.setAttribute(attr, u.toString());}
      }catch{}
    });
  })();

  // Rebind Login/Logout/Home
  document.addEventListener('click',(ev)=>{
    const t = ev.target.closest('a,button'); if(!t) return;
    const txt=(t.getAttribute('aria-label')||t.textContent||'').toLowerCase();
    if(/(^|\s)login(\s|$)/.test(txt)){ ev.preventDefault(); ev.stopPropagation(); window.__nafs_login__ && window.__nafs_login__(); }
    if(/keluar|logout/.test(txt)){ ev.preventDefault(); ev.stopPropagation(); window.__nafs_logout__ && window.__nafs_logout__(); }
    if(/halaman utama|home|beranda/.test(txt)){ ev.preventDefault(); ev.stopPropagation(); location.href='/'; }
  }, {capture:true});

  // Safe generate helper on window
  window.nafsSafeGenerate = async function(payload={}){
    const token = (window.__nafs_getIdToken__ ? await window.__nafs_getIdToken__() : null);
    const res = await fetch('/api/generate.php', {
      method:'POST',
      headers: {'Content-Type':'application/json', ...(token?{'Authorization':'Bearer '+token}:{})},
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if(!res.ok){ throw new Error('Generate gagal '+res.status); }
    return res.json().catch(()=> ({}));
  };
})();
