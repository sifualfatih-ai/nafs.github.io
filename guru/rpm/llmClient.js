/* NafsFlow LLM Client (rpm) — unified endpoint */
(function (global) {
  const ENDPOINTS = ['/api/generate.php'];

  async function getIdToken() {
    try {
      const mod = await import('/firebase.js');
      return mod.getIdToken ? await mod.getIdToken() : null;
    } catch { return null; }
  }

  async function callGenerate(body) {
    let lastErr = null;
    const token = await getIdToken();
    for (const url of ENDPOINTS) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type':'application/json',
            ...(token ? {'Authorization':'Bearer '+token} : {}),
          },
          body: JSON.stringify(body),
          credentials:'include',
        });
        if(!res.ok){ lastErr = new Error('HTTP '+res.status+' @ '+url); continue; }
        const json = await res.json();
        if(json && (json.ok || json.data || json.text)) return json;
        lastErr = new Error('Bad response @ '+url);
      } catch(e){ lastErr = e; }
    }
    throw lastErr || new Error('All endpoints failed');
  }

  global.nafsGenerate = async function(prompt){
    const out = await callGenerate({ prompt });
    return out.data ?? out.text ?? out;
  };
})(window);
