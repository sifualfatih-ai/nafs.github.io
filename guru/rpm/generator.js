const DEFAULT_GEMINI_API_KEY = (window.__ENV && window.__ENV.GEMINI_API_KEY) || window.__ENV_GEMINI_KEY || "";

/* =========================
   Helper: ambil data form
========================= */
function getFormData(form) {
  const fd = new FormData(form);
  const multi = (name) =>
    Array.from(form.querySelector(`[name="${name}"]`).selectedOptions || []).map((o) => o.value);
  return {
    schoolName: fd.get("schoolName")?.toString() || "",
    teacherName: fd.get("teacherName")?.toString() || "",
    teacherNip: fd.get("teacherNip")?.toString() || "",
    headmasterName: fd.get("headmasterName")?.toString() || "",
    headmasterNip: fd.get("headmasterNip")?.toString() || "",
    educationLevel: fd.get("educationLevel")?.toString() || "KOBER",
    className: fd.get("className")?.toString() || "",
    learningTheme: fd.get("learningTheme")?.toString() || "",
    learningOutcomes: fd.get("learningOutcomes")?.toString() || "",
    subjectMatter: fd.get("subjectMatter")?.toString() || "",
    numMeetings: Number(fd.get("numMeetings") || 1),
    meetingDuration: fd.get("meetingDuration")?.toString() || "2 x 35 menit",
    pedagogicalPractices: multi("pedagogicalPractices"),
    graduateDimensions: multi("graduateDimensions"),
  };
}

/* =======================================================
   RENDER DOKUMEN RPM (bukan JSON) – tampil rapi seperti Word
======================================================= */
function renderRPM(rpm) {
  const out = document.getElementById("output");
  if (!rpm) {
    out.innerHTML = "";
    return;
  }

  const esc = (s) =>
    (s || "").toString().replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));

  const bullets = (arr) =>
    Array.isArray(arr) && arr.length ? `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "<p>-</p>";

  const numbers = (arr) =>
    Array.isArray(arr) && arr.length ? `<ol>${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>` : "<p>-</p>";

  const pertemuanBlocks =
    (rpm.pengalamanBelajar?.pertemuan || [])
      .map(
        (p, i) => `
      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-left:4px solid #16a34a;border-radius:10px;padding:12px 14px;margin:12px 0;">
        <h3 style="font:bold 18px 'Times New Roman',Georgia,serif;margin:0 0 6px;">III.${i + 1} Pertemuan ${i + 1}</h3>
        <p><b>Awal:</b> ${esc(p.awal)}</p>
        <p><b>Inti:</b> ${esc(p.inti)}</p>
        <p><b>Refleksi:</b> ${esc(p.refleksi)}</p>
        <p><b>Penutup:</b> ${esc(p.penutup)}</p>
      </div>
    `
      )
      .join("") || "<p>-</p>";

  const ident = rpm.identifikasi || {};
  const desain = rpm.desainPembelajaran || {};
  const ases = rpm.asesmenPembelajaran || {};

  out.innerHTML = `
    <div class="doc" style="
      background:#fff;color:#111827;font-family:'Times New Roman', Georgia, serif;line-height:1.6;
      padding:28px;border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,.08);max-width:900px;margin:8px auto 0;">
      <h1 style="font:bold 26px 'Times New Roman',Georgia,serif;text-align:center;text-transform:uppercase;letter-spacing:.5px;margin:0 0 10px;">
        RENCANA PEMBELAJARAN MENDALAM (RPM)
      </h1>

      <h2 style="font:bold 20px 'Times New Roman',Georgia,serif;border-bottom:1px solid #d1d5db;padding-bottom:6px;margin:18px 0 8px;">I. Identifikasi</h2>
      <p><b>Siswa</b>: ${esc(ident.siswa)}</p>
      <p><b>Materi Pelajaran</b>: ${esc(ident.materiPelajaran)}</p>
      <p><b>Dimensi Profil Pelajar Pancasila</b>:</p>
      ${bullets(ident.dimensiProfilPelajarPancasila)}

      <h2 style="font:bold 20px 'Times New Roman',Georgia,serif;border-bottom:1px solid #d1d5db;padding-bottom:6px;margin:18px 0 8px;">II. Desain Pembelajaran</h2>
      <p><b>Capaian Pembelajaran</b>:</p>
      <p>${esc(desain.capaianPembelajaran)}</p>
      <p><b>Lintas Disiplin Ilmu</b>:</p>
      ${bullets(desain.lintasDisiplinIlmu)}
      <p><b>Tujuan Pembelajaran</b>:</p>
      ${numbers(desain.tujuanPembelajaran)}
      <p><b>Materi Ajar</b>:</p>
      <p>${esc(desain.materiAjar)}</p>

      <h2 style="font:bold 20px 'Times New Roman',Georgia,serif;border-bottom:1px solid #d1d5db;padding-bottom:6px;margin:18px 0 8px;">III. Pengalaman Belajar</h2>
      ${pertemuanBlocks}

      <h2 style="font:bold 20px 'Times New Roman',Georgia,serif;border-bottom:1px solid #d1d5db;padding-bottom:6px;margin:18px 0 8px;">IV. Asesmen Pembelajaran</h2>
      <p><b>Asesmen Awal</b>:</p>
      <p>${esc(ases.asesmenAwal)}</p>
      <p><b>Asesmen Proses</b>:</p>
      <p>${esc(ases.asesmenProses)}</p>
      <p><b>Asesmen Akhir</b>:</p>
      <p>${esc(ases.asesmenAkhir)}</p>
    </div>
  `;
}

/* ==========================================================
   Tambahan: klik tombol Generate panggil proxy generate.php
   (Fallback API key ditangani di server; browser tidak simpan key)
========================================================== */
(function () {
  const formEl = document.getElementById("rpmForm");
  const outEl = document.getElementById("output");
  const btnPrint = document.getElementById("btnPrint");
  const btnExport = document.getElementById("btnExport");

  function buildPromptFromForm() {
    const v = (name) => (formEl.querySelector(`[name="${name}"]`)?.value || "").trim();
    const multi = (name) =>
      Array.from(formEl.querySelector(`[name="${name}"]`)?.selectedOptions || [])
        .map((o) => o.value)
        .join(", ");

    return `
Anda adalah perancang kurikulum Indonesia. Kembalikan **JSON VALID SAJA** sesuai skema di bawah, tanpa teks lain.

Data:
- Nama Satuan Pendidikan: ${v("schoolName")}
- Jenjang Pendidikan: ${v("educationLevel")}
- Nama Kelas: ${v("className")}
- Tema Pembelajaran: ${v("learningTheme")}
- Capaian Pembelajaran: ${v("learningOutcomes")}
- Materi Pelajaran: ${v("subjectMatter")}
- Jumlah Pertemuan: ${v("numMeetings")}
- Durasi pertemuan: ${v("meetingDuration")}
- Praktik Pedagogik: ${multi("pedagogicalPractices")}
- Dimensi Profil Pelajar Pancasila: ${multi("graduateDimensions")}

Skema JSON:
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
`.trim();
  }

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();
    const prompt = buildPromptFromForm();

    try {
      const rpm = await window.generateViaProxy(prompt, {
        loadingText: "Menyusun RPM…",
        onDone: () => window.NafsUI.toast("Berhasil generate", "success"),
      });

      window.__LAST_RPM__ = rpm;
      window.__LAST_FORM__ = Object.fromEntries(new FormData(formEl).entries());

      if (typeof renderRPM === "function") {
        renderRPM(rpm);
      } else {
        outEl.textContent = JSON.stringify(rpm, null, 2);
      }
    } catch (err) {
      outEl.innerHTML = `<div class="text-red-600">Gagal generate: ${err.message}</div>`;
    }
  });

  btnPrint?.addEventListener("click", () => {
    if (!window.__LAST_RPM__) return window.NafsUI.toast("Belum ada hasil", "error");
    window.print();
  });

  btnExport?.addEventListener("click", () => {
    if (!window.__LAST_RPM__) return window.NafsUI.toast("Belum ada hasil", "error");
    if (typeof exportDocx === "function") {
      exportDocx(window.__LAST_RPM__, window.__LAST_FORM__ || {});
    } else {
      window.NafsUI.toast("Fungsi exportDocx tidak ditemukan", "error");
    }
  });
})();
