<!-- ini file JS biasa, bukan module -->
<script>
(function (global) {
  /**
   * Panggil proxy backend di Hostinger (fallback Gemini→Groq→OpenRouter).
   * @param {string} prompt - prompt yang sudah kamu susun dari form
   * @returns {Promise<any>} - JSON hasil generate (object)
   */
  async function generateViaProxy(prompt) {
    const res = await fetch('/api/generate.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) throw new Error('Proxy error ' + res.status);

    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Terjadi kesalahan');

    // Jika proxy berhasil parse JSON -> pakai json.data
    // Jika model mengirim teks JSON mentah -> parse dari json.text
    try {
      return json.data ?? JSON.parse(json.text);
    } catch (e) {
      console.warn('Tidak bisa parse JSON dari model. Mengembalikan teks mentah.', e);
      return json.text; // fallback terakhir
    }
  }

  // Ekspor ke global agar bisa dipakai di semua file tanpa import
  global.generateViaProxy = generateViaProxy;
})(window);
</script>
