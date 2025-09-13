// ====== Konfigurasi ======
// Jika ingin default API key, isi di sini (opsional). Lebih aman biarkan kosong dan isi lewat input.
const DEFAULT_GEMINI_API_KEY = "";

// ====== Util ======
function getFormData(form) {
  const fd = new FormData(form);
  const multi = (name) => Array.from(form.querySelector(`[name="${name}"]`).selectedOptions || []).map(o => o.value);
  return {
    schoolName: fd.get('schoolName')?.toString() || "",
    teacherName: fd.get('teacherName')?.toString() || "",
    teacherNip: fd.get('teacherNip')?.toString() || "",
    headmasterName: fd.get('headmasterName')?.toString() || "",
    headmasterNip: fd.get('headmasterNip')?.toString() || "",
    educationLevel: fd.get('educationLevel')?.toString() || "KOBER",
    className: fd.get('className')?.toString() || "",
    learningTheme: fd.get('learningTheme')?.toString() || "",
    learningOutcomes: fd.get('learningOutcomes')?.toString() || "",
    subjectMatter: fd.get('subjectMatter')?.toString() || "",
    numMeetings: Number(fd.get('numMeetings') || 1),
    meetingDuration: fd.get('meetingDuration')?.toString() || "2 x 35 menit",
    pedagogicalPractices: multi('pedagogicalPractices'),
    graduateDimensions: multi('graduateDimensions'),
  };
}

function renderRPM(rpm) {
  const out = document.getElementById('output');
  if (!rpm) { out.innerHTML = ''; return; }

  const esc = (s) => (s || '').toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',\"'\":'&#39;'}[m]));

  const list = (arr, type='ul') => Array.isArray(arr) ? `<${type} class="list-disc list-inside space-y-1">` + arr.map(x=>`<li>${esc(x)}</li>`).join('') + `</${type}>` : '';

  const pertemuan = (rpm.pengalamanBelajar?.pertemuan || []).map((p, i) => `
    <div class="border rounded p-3 mb-3">
      <h4 class="font-semibold mb-2">Pertemuan ${i+1}</h4>
      <p><strong>Awal:</strong> ${esc(p.awal)}</p>
      <p><strong>Inti:</strong> ${esc(p.inti)}</p>
      <p><strong>Refleksi:</strong> ${esc(p.refleksi)}</p>
      <p><strong>Penutup:</strong> ${esc(p.penutup)}</p>
    </div>
  `).join('');

  out.innerHTML = `
    <div>
      <h3 class="text-xl font-bold mb-2">1. Identifikasi</h3>
      <p><strong>Siswa:</strong> ${esc(rpm.identifikasi?.siswa)}</p>
      <p><strong>Materi Pelajaran:</strong> ${esc(rpm.identifikasi?.materiPelajaran)}</p>
      <p><strong>Dimensi Profil Pelajar Pancasila:</strong></p>
      ${list(rpm.identifikasi?.dimensiProfilPelajarPancasila || [])}

      <h3 class="text-xl font-bold mt-4 mb-2">2. Desain Pembelajaran</h3>
      <p><strong>Capaian Pembelajaran:</strong> ${esc(rpm.desainPembelajaran?.capaianPembelajaran)}</p>
      <p><strong>Lintas Disiplin Ilmu:</strong></p>
      ${list(rpm.desainPembelajaran?.lintasDisiplinIlmu || [])}
      <p class="mt-2"><strong>Tujuan Pembelajaran:</strong></p>
      ${list(rpm.desainPembelajaran?.tujuanPembelajaran || [], 'ol')}
      <p class="mt-2"><strong>Materi Ajar:</strong> ${esc(rpm.desainPembelajaran?.materiAjar)}</p>

      <h3 class="text-xl font-bold mt-4 mb-2">3. Pengalaman Belajar</h3>
      ${pertemuan}

      <h3 class="text-xl font-bold mt-4 mb-2">4. Asesmen Pembelajaran</h3>
      <p><strong>Asesmen Awal:</strong> ${esc(rpm.asesmenPembelajaran?.asesmenAwal)}</p>
      <p><strong>Asesmen Proses:</strong> ${esc(rpm.asesmenPembelajaran?.asesmenProses)}</p>
      <p><strong>Asesmen Akhir:</strong> ${esc(rpm.asesmenPembelajaran?.asesmenAkhir)}</p>
    </div>
  `;
}

// ====== Export DOCX ======
function exportDocx(rpm, form) {
  if (!window.docx || !window.saveAs) { alert("Library export belum dimuat."); return; }
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = window.docx;

  const H = (text, level=HeadingLevel.HEADING_2) => new Paragraph({ heading: level, children: [ new TextRun({ text, bold: true }) ], spacing: { before: 300, after: 150 }});
  const P = (text) => new Paragraph(String(text || ""));

  const list = (arr) => (arr||[]).map(item => new Paragraph({ children:[new TextRun({ text: "• " + item })]}));

  const pertemuanParas = (rpm.pengalamanBelajar?.pertemuan || []).flatMap((p, i) => [
    new Paragraph({ children:[new TextRun({ text:`Pertemuan ${i+1}`, bold: true })]}),
    P("Awal: " + (p.awal||"")),
    P("Inti: " + (p.inti||"")),
    P("Refleksi: " + (p.refleksi||"")),
    P("Penutup: " + (p.penutup||"")),
  ]);

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: "RENCANA PEMBELAJARAN MENDALAM (RPM)", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
        H("I. Identifikasi"),
        P("Siswa: " + (rpm.identifikasi?.siswa || "")),
        P("Materi Pelajaran: " + (rpm.identifikasi?.materiPelajaran || "")),
        ...list(rpm.identifikasi?.dimensiProfilPelajarPancasila || []),
        H("II. Desain Pembelajaran"),
        P("Capaian Pembelajaran: " + (rpm.desainPembelajaran?.capaianPembelajaran || "")),
        ...list(rpm.desainPembelajaran?.lintasDisiplinIlmu || []),
        ...list((rpm.desainPembelajaran?.tujuanPembelajaran || []).map((t,i)=>`${i+1}. ${t}`)),
        P("Materi Ajar: " + (rpm.desainPembelajaran?.materiAjar || "")),
        H("III. Pengalaman Belajar"),
        ...pertemuanParas,
        H("IV. Asesmen Pembelajaran"),
        P("Asesmen Awal: " + (rpm.asesmenPembelajaran?.asesmenAwal || "")),
        P("Asesmen Proses: " + (rpm.asesmenPembelajaran?.asesmenProses || "")),
        P("Asesmen Akhir: " + (rpm.asesmenPembelajaran?.asesmenAkhir || "")),
      ]
    }]
  });

  window.docx.Packer.toBlob(doc).then(blob => {
    const theme = form.learningTheme || "RPM";
    const kelas = form.className || "";
    window.saveAs(blob, `RPM - ${theme} - ${kelas}.docx`);
  });
}

// ====== Gemini Call (REST) ======
async function generateRpmContent(form, apiKey) {
  const prompt = `Anda adalah seorang ahli desainer kurikulum pendidikan anak usia dini di Indonesia.
Tugas Anda adalah membuat Rencana Pembelajaran Mendalam (RPM) yang terstruktur, kreatif, dan sesuai data.

Berikut data:
- Nama Satuan Pendidikan: ${form.schoolName}
- Jenjang Pendidikan: ${form.educationLevel}
- Nama Kelas: ${form.className}
- Tema Pembelajaran: ${form.learningTheme}
- Capaian Pembelajaran: ${form.learningOutcomes}
- Materi Pelajaran: ${form.subjectMatter}
- Jumlah Pertemuan: ${form.numMeetings}
- Durasi pertemuan: ${form.meetingDuration}
- Praktik Pedagogik: ${form.pedagogicalPractices.join(", ")}
- Dimensi Profil Pelajar Pancasila: ${form.graduateDimensions.join(", ")}

Kembalikan output JSON valid dgn struktur:
{
  "identifikasi": {
    "siswa": string,
    "materiPelajaran": string,
    "dimensiProfilPelajarPancasila": string[]
  },
  "desainPembelajaran": {
    "capaianPembelajaran": string,
    "lintasDisiplinIlmu": string[],
    "tujuanPembelajaran": string[],
    "materiAjar": string
  },
  "pengalamanBelajar": {
    "pertemuan": [
      { "awal": string, "inti": string, "refleksi": string, "penutup": string }
    ]
  },
  "asesmenPembelajaran": {
    "asesmenAwal": string,
    "asesmenProses": string,
    "asesmenAkhir": string
  }
}
JANGAN tulis apa pun di luar JSON.`;

  const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + encodeURIComponent(apiKey);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }]}],
      generationConfig: { response_mime_type: "application/json" }
    })
  });
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  try { return JSON.parse(text); } catch(e) {
    // Attempt to extract JSON block
    const match = text.match(/\{[\s\S]*\}$/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Model tidak mengembalikan JSON yang valid.");
  }
}

// ====== Wire-up ======
(function init(){
  const formEl = document.getElementById('rpmForm');
  const outEl = document.getElementById('output');
  const loading = document.getElementById('loading');
  const btnPrint = document.getElementById('btnPrint');
  const btnExport = document.getElementById('btnExport');
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = getFormData(formEl);
    const key = (document.getElementById('apiKey').value || DEFAULT_GEMINI_API_KEY).trim();
    if (!key) { alert("Masukkan API Key Gemini terlebih dahulu."); return; }
    loading.classList.remove('hidden'); outEl.innerHTML = "";
    try {
      const rpm = await generateRpmContent(form, key);
      window.__LAST_RPM__ = rpm;
      window.__LAST_FORM__ = form;
      renderRPM(rpm);
    } catch(err) {
      outEl.innerHTML = `<div class="text-red-600">Gagal generate: ${err?.message || err}</div>`;
    } finally {
      loading.classList.add('hidden');
    }
  });

  btnPrint.addEventListener('click', () => {
    if (!window.__LAST_RPM__) { alert("Belum ada hasil."); return; }
    window.print();
  });

  btnExport.addEventListener('click', () => {
    if (!window.__LAST_RPM__) { alert("Belum ada hasil."); return; }
    exportDocx(window.__LAST_RPM__, window.__LAST_FORM__ || {});
  });
})();