/* app.js — logika aplikasi Generator RPM
   - Dibuat terpisah dari halaman agar mudah diubah tanpa mengganggu HTML
   - Siap untuk integrasi API (Gemini) di masa mendatang melalui window.APP_CONFIG.API_KEY
*/

(function () {
  const $ = (sel) => document.querySelector(sel);

  // ----- Opsi bawaan -----
  const jenjangOptions = ["SD", "SMP", "SMA/SMK"];
  const kelasOptions = {
    "SD": ["1","2","3","4","5","6"],
    "SMP": ["7","8","9"],
    "SMA/SMK": ["10","11","12"]
  };
  const durasiOptions = ["2 x 35 menit", "3 x 35 menit", "90 menit", "2 x 45 menit"];

  // ----- Inisialisasi select -----
  function initSelects(){
    const jenjang = $("#jenjang");
    const kelas = $("#kelas");
    const durasi = $("#durasi");
    jenjangOptions.forEach(v=>jenjang.append(new Option(v, v)));
    durasiOptions.forEach(v=>durasi.append(new Option(v, v)));
    jenjang.addEventListener("change", ()=>{
      const list = kelasOptions[jenjang.value] || [];
      kelas.innerHTML = "";
      list.forEach(v=>kelas.append(new Option(v, v)));
    });
    jenjang.value = "SD";
    jenjang.dispatchEvent(new Event("change"));
  }

  // ----- Util -----
  function toArrayFromCSV(value){
    return (value || "")
      .split(",")
      .map(s=>s.trim())
      .filter(Boolean);
  }

  function collectForm(){
    return {
      satuanPendidikan: $("#satuanPendidikan").value.trim(),
      namaGuru: $("#namaGuru").value.trim(),
      nipGuru: $("#nipGuru").value.trim(),
      namaKepalaSekolah: $("#namaKepalaSekolah").value.trim(),
      nipKepalaSekolah: $("#nipKepalaSekolah").value.trim(),
      jenjang: $("#jenjang").value,
      kelas: $("#kelas").value,
      mapel: $("#mapel").value.trim(),
      cp: $("#cp").value.trim(),
      materi: $("#materi").value.trim(),
      jumlahPertemuan: parseInt($("#jumlahPertemuan").value,10) || 1,
      durasi: $("#durasi").value,
      praktikPedagogis: toArrayFromCSV($("#praktikPedagogis").value),
      dimensiLulusan: toArrayFromCSV($("#dimensiLulusan").value)
    };
  }

  // ----- Template lokal (fallback) -----
  function localTemplate(data){
    const { satuanPendidikan, jenjang, kelas, mapel, cp, materi, jumlahPertemuan, durasi, praktikPedagogis, dimensiLulusan } = data;

    return {
      identifikasi: {
        siswa: `Peserta didik pada jenjang ${jenjang} kelas ${kelas} di ${satuanPendidikan}.`,
        materiPelajaran: materi || mapel,
        capaianDimensiLulusan: dimensiLulusan.length ? dimensiLulusan : ["Bernalar kritis","Kreatif"]
      },
      desainPembelajaran: {
        capaianPembelajaran: cp || `Mengembangkan pemahaman konsep dasar ${mapel}.`,
        tujuanPembelajaran: [
          `Peserta didik mampu menjelaskan konsep utama ${materi || mapel}.`,
          `Peserta didik menunjukkan sikap dan keterampilan yang relevan dengan dimensi profil pelajar Pancasila.`
        ],
        strategiPembelajaran: praktikPedagogis.length ? praktikPedagogis : ["diskusi","inkuiri","project-based learning"],
        pemanfaatanDigital: "Pemanfaatan sumber belajar digital dan presentasi interaktif."
      },
      pengalamanBelajar: {
        awal: "Apersepsi singkat, memantik rasa ingin tahu, kontrak belajar.",
        inti: "Kegiatan eksplorasi, elaborasi materi, praktik atau proyek kecil berkelompok.",
        refleksi: "Jurnal/refleksi pribadi dan umpan balik teman sebaya.",
        penutup: "Rangkuman, tindak lanjut, dan informasi tugas rumah (jika ada)."
      },
      asesmenPembelajaran: {
        awal: "Kuesioner/diagnostik singkat untuk memetakan pengetahuan awal.",
        proses: "Observasi, rubrik performa, dan kuis formatif.",
        akhir: "Tes/karya/proyek yang menilai pengetahuan, keterampilan, dan sikap."
      },
      pengaturanWaktu: {
        jumlahPertemuan,
        durasi
      }
    };
  }

  // ----- Integrasi API (opsional) -----
  async function generateWithGemini(formData){
    const key = (window.APP_CONFIG && window.APP_CONFIG.API_KEY) || "";
    if(!key){
      // Tanpa API key, gunakan template lokal
      return localTemplate(formData);
    }

    // Contoh payload untuk Google Generative Language API (Gemini)
    // Catatan: Untuk dipakai di GitHub Pages, pastikan Anda memahami kebijakan keamanan API key.
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${window.APP_CONFIG.MODEL}:generateContent?key=${encodeURIComponent(key)}`;

    const prompt = `Buat Rencana Pelaksanaan Mengajar (RPM) terstruktur dalam format JSON valid.
Jenjang: ${formData.jenjang}, Kelas: ${formData.kelas}, Satuan Pendidikan: ${formData.satuanPendidikan}
Mapel: ${formData.mapel}
CP: ${formData.cp}
Materi: ${formData.materi}
Praktik pedagogis: ${formData.praktikPedagogis.join(", ") || "-"}
Dimensi profil pelajar pancasila: ${formData.dimensiLulusan.join(", ") || "-"}
Jumlah pertemuan: ${formData.jumlahPertemuan} @ ${formData.durasi}

Keluarkan hanya JSON dengan kunci:
identifikasi { siswa, materiPelajaran, capaianDimensiLulusan[] },
desainPembelajaran { capaianPembelajaran, tujuanPembelajaran[], strategiPembelajaran[], pemanfaatanDigital },
pengalamanBelajar { awal, inti, refleksi, penutup },
asesmenPembelajaran { awal, proses, akhir },
pengaturanWaktu { jumlahPertemuan, durasi }
`;

    const body = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    const res = await fetch(endpoint, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(body)
    });

    if(!res.ok){
      // Gagal API => fallback
      console.warn("Gemini API error:", res.status, await res.text());
      return localTemplate(formData);
    }

    const data = await res.json();
    const text = (((data||{}).candidates||[])[0]||{}).content?.parts?.map(p=>p.text).join("") || "";
    try{
      const parsed = JSON.parse(extractJson(text));
      // Pastikan data inti tidak hilang
      parsed.identifikasi = parsed.identifikasi || {};
      parsed.identifikasi.materiPelajaran = formData.materi || formData.mapel;
      parsed.desainPembelajaran = parsed.desainPembelajaran || {};
      parsed.desainPembelajaran.capaianPembelajaran = parsed.desainPembelajaran.capaianPembelajaran || formData.cp;
      return parsed;
    }catch(e){
      console.warn("Parsing JSON gagal, gunakan template lokal", e);
      return localTemplate(formData);
    }
  }

  // Ekstrak blok JSON pertama dari teks (jaga-jaga model mengembalikan teks lain)
  function extractJson(s){
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    return start>=0 && end>start ? s.slice(start, end+1) : "{}";
  }

  // ----- UI -----
  function setStatus(msg){ $("#status-hint").textContent = msg || ""; }
  function showOutput(obj){
    $("#output-pre").textContent = JSON.stringify(obj, null, 2);
  }

  function onReset(){
    $("#rpm-form").reset();
    setStatus("");
    showOutput({info:"Belum ada hasil. Isi formulir lalu klik \"Buat RPM\"."});
  }

  async function onSubmit(e){
    e.preventDefault();
    setStatus("Memproses…");
    $("#btn-generate").disabled = true;
    try{
      const formData = collectForm();
      const result = await generateWithGemini(formData);
      showOutput(result);
      setStatus("Selesai ✔");
    }catch(err){
      console.error(err);
      setStatus("Terjadi kesalahan. Coba lagi.");
    }finally{
      $("#btn-generate").disabled = false;
    }
  }

  // ----- Boot -----
  initSelects();
  $("#rpm-form").addEventListener("submit", onSubmit);
  $("#btn-reset").addEventListener("click", onReset);
  showOutput({info:"Belum ada hasil. Isi formulir lalu klik \"Buat RPM\"."});

})();

// ====== Tambahan: Validasi, Auto-Save, dan Ekspor ======
(function(){
  const REQUIRED = ["satuanPendidikan","mapel","jenjang","kelas"];

  // --- Validasi sederhana ---
  function validateForm(){
    const data = {
      satuanPendidikan: document.getElementById("satuanPendidikan").value.trim(),
      mapel: document.getElementById("mapel").value.trim(),
      jenjang: document.getElementById("jenjang").value,
      kelas: document.getElementById("kelas").value,
    };
    const missing = REQUIRED.filter(k => !data[k]);
    if(missing.length){
      const map = {
        satuanPendidikan: "Nama Satuan Pendidikan",
        mapel: "Mata Pelajaran",
        jenjang: "Jenjang Pendidikan",
        kelas: "Kelas"
      };
      alert("Harap lengkapi: " + missing.map(k=>map[k]).join(", "));
      return false;
    }
    return true;
  }

  // --- Auto-save LocalStorage ---
  const STORAGE_KEY = "rpm.form.draft.v1";
  function saveDraft(){
    const ids = ["satuanPendidikan","mapel","jenjang","kelas","namaGuru","nipGuru","namaKepalaSekolah","nipKepalaSekolah","cp","materi","jumlahPertemuan","durasi","praktikPedagogis","dimensiLulusan"];
    const obj = {};
    ids.forEach(id => obj[id] = (document.getElementById(id)||{}).value ?? "");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }
  function loadDraft(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return;
      const obj = JSON.parse(raw);
      for(const [k,v] of Object.entries(obj)){
        const el = document.getElementById(k);
        if(el){
          el.value = v;
        }
      }
      // jenjang/kelas dependency
      document.getElementById("jenjang").dispatchEvent(new Event("change"));
      if(obj.kelas){
        document.getElementById("kelas").value = obj.kelas;
      }
    }catch{}
  }
  function clearDraft(){ localStorage.removeItem(STORAGE_KEY); }

  // Simpan saat input berubah
  document.addEventListener("input", (e)=>{
    const target = e.target;
    if(target && target.id){ saveDraft(); }
  });

  loadDraft();

  // --- Hook validasi sebelum submit ---
  const form = document.getElementById("rpm-form");
  const origSubmit = form.onsubmit;
  form.addEventListener("submit", function(e){
    if(!validateForm()){
      e.preventDefault();
      return;
    }
  }, true);

  // Bersihkan draft ketika reset
  document.getElementById("btn-reset").addEventListener("click", clearDraft);

  // --- Ekspor JSON ---
  function download(name, blob){
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 2000);
  }
  document.getElementById("btn-export-json").addEventListener("click", ()=>{
    const out = document.getElementById("output-pre").textContent || "{}";
    download("rpm.json", new Blob([out], {type:"application/json"}));
  });

  // --- Ekspor Word (format .doc yang kompatibel) ---
  // Catatan: Word membuka HTML ini dengan baik. Jika Anda butuh .docx murni,
  // saya bisa menambahkan paket ringan (zip + OOXML) di iterasi berikutnya.
  document.getElementById("btn-export-doc").addEventListener("click", ()=>{
    const out = document.getElementById("output-pre").textContent || "{}";
    const data = JSON.parse(out);
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
      <h1>Rencana Pelaksanaan Mengajar (RPM)</h1>
      <pre style="font-family:Consolas,monospace">${out.replace(/[&<>]/g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[s]))}</pre>
    </body></html>`;
    download("rpm.doc", new Blob([html], {type:"application/msword"}));
  });

  // --- Cetak / Simpan ke PDF (via dialog print browser) ---
  document.getElementById("btn-export-pdf").addEventListener("click", ()=>{
    const out = document.getElementById("output-pre").textContent || "{}";
    const printHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>RPM</title>
      <style>
        body{font:14px/1.6 system-ui,Segoe UI,Roboto,Inter,sans-serif;padding:28px;color:#111}
        h1{font-size:20px;margin:0 0 12px}
        pre{white-space:pre-wrap;border:1px solid #ddd;border-radius:8px;padding:12px;background:#f8fafc}
        @page { size: A4; margin: 18mm }
      </style></head>
      <body>
        <h1>Rencana Pelaksanaan Mengajar (RPM)</h1>
        <pre>${out.replace(/[&<>]/g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[s]))}</pre>
        <script>setTimeout(()=>window.print(),100);</script>
      </body></html>`;
    const w = window.open("", "_blank");
    w.document.write(printHtml);
    w.document.close();
  });

})();