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