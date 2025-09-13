const DEFAULT_GEMINI_API_KEY = (window.__ENV && window.__ENV.GEMINI_API_KEY) || window.__ENV_GEMINI_KEY || "";

/* =========================
   Helper: ambil data form
========================= */
function getFormData(form) {
  const fd = new FormData(form);

  // Ambil semua nilai dari beberapa elemen bernama mirip (pedagogik_1, pedagogik_2, ...)
  const valsByPrefix = (prefix) =>
    Array.from(form.querySelectorAll(`[name^="${prefix}"]`))
      .map((el) => (el.value || "").trim())
      .filter((v) => v !== "");

  // Ambil semua checkbox yang dicentang
  const checked = (name) =>
    Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((el) => el.value);

  return {
    schoolName: fd.get("schoolName")?.toString() || "",
    teacherName: fd.get("teacherName")?.toString() || "",
    teacherNip: fd.get("teacherNip")?.toString() || "",
    headmasterName: fd.get("headmasterName")?.toString() || "",
    headmasterNip: fd.get("headmasterNip")?.toString() || "",
    educationLevel: fd.get("educationLevel")?.toString() || "KOBER",

    // className kini dikendalikan oleh <select> tetapi disinkronkan ke input[name="className"] tersembunyi
    className: fd.get("className")?.toString() || "",

    learningTheme: fd.get("learningTheme")?.toString() || "",
    learningOutcomes: fd.get("learningOutcomes")?.toString() || "",
    subjectMatter: fd.get("subjectMatter")?.toString() || "",
    numMeetings: Number(fd.get("numMeetings") || 1),
    meetingDuration: fd.get("meetingDuration")?.toString() || "2 x 35 menit",

    // praktik pedagogik sekarang berbentuk beberapa <select>, satu per pertemuan
    pedagogicalPractices: valsByPrefix("pedagogicalPractices_"),

    // dimensi PPP sekarang checkbox
    graduateDimensions: checked("graduateDimensions"),
  };
}

/* =======================================================
   Utility kecil untuk DOM upgrade sesuai instruksi
======================================================= */
function createEl(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") el.className = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else el.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c == null) return;
    el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return el;
}

function extractOptionsFromSelect(sel) {
  if (!sel) return [];
  return Array.from(sel.querySelectorAll("option")).map((o) => o.value || o.textContent);
}

/* =======================================================
   UPGRADE FORM FIELD sesuai kebutuhan
======================================================= */
function upgradeFields() {
  const form = document.getElementById("rpmForm");
  if (!form) return;

  /* ---------- 1) Nama Kelas menjadi dropdown + CRUD (localStorage) ---------- */
  (function upgradeClassName() {
    // Cari input/elemen lama
    const old = form.querySelector('[name="className"]');
    if (!old) return;

    // Buat hidden untuk sinkronisasi nilai (agar FormData tetap bekerja)
    const hidden = old.tagName === "INPUT" ? old : createEl("input", { type: "hidden", name: "className" });
    if (old !== hidden) {
      old.replaceWith(hidden);
    }

    // Tempatkan UI baru setelah hidden
    const wrapper = createEl("div", { class: "flex gap-2 items-center" });
    hidden.parentNode.insertBefore(wrapper, hidden.nextSibling);

    // Ambil opsi tersimpan atau gunakan default
    const LS_KEY = "rpm_class_name_options";
    const defaultOpts = ["Kelas A", "Kelas B", "Kelas Besar", "Kelas Kecil"];
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    let options = Array.isArray(saved) && saved.length ? saved : defaultOpts;

    const sel = createEl("select", {
      id: "classNameSelect",
      class: "border rounded px-2 py-1 w-full",
    });

    function refreshClassSelect(valueToKeep) {
      sel.innerHTML = "";
      options.forEach((opt) => sel.appendChild(createEl("option", { value: opt }, opt)));
      const val = valueToKeep || hidden.value || options[0] || "";
      sel.value = val;
      hidden.value = val;
    }

    refreshClassSelect();

    sel.addEventListener("change", () => {
      hidden.value = sel.value;
    });

    const btnManage = createEl(
      "button",
      { type: "button", class: "px-2 py-1 border rounded" },
      "Kelola"
    );
    btnManage.addEventListener("click", () => {
      const current = options.join("\n");
      const next = window.prompt(
        "Kelola Nama Kelas (satu baris satu nama):",
        current
      );
      if (next == null) return;
      const cleaned = next
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s);
      if (!cleaned.length) return;
      options = Array.from(new Set(cleaned)); // unik
      localStorage.setItem(LS_KEY, JSON.stringify(options));
      refreshClassSelect();
    });

    wrapper.appendChild(sel);
    wrapper.appendChild(btnManage);
  })();

  /* ---------- Ambil opsi lama dari select untuk dipakai ulang ---------- */
  const oldPedagSel = form.querySelector('[name="pedagogicalPractices"]');
  const oldGradSel = form.querySelector('[name="graduateDimensions"]');
  const pedagogicOptions = extractOptionsFromSelect(oldPedagSel);
  const gradOptions = extractOptionsFromSelect(oldGradSel);

  /* ---------- 2) Praktik Pedagogik menjadi dropdown & mengikuti jumlah pertemuan ---------- */
  (function upgradePedagogic() {
    // Buat container pengganti
    const container = createEl("div", { id: "pedagogicalContainer", class: "space-y-2" });

    if (oldPedagSel) {
      oldPedagSel.replaceWith(container);
    } else {
      // fallback: cari tempat berdasarkan label
      const anchor = form.querySelector("#pedagogical-anchor") || form.querySelector('[data-field="pedagogicalPractices"]') || form;
      anchor.appendChild(container);
    }

    function render(count) {
      container.innerHTML = "";
      for (let i = 1; i <= count; i++) {
        const sel = createEl("select", {
          name: `pedagogicalPractices_${i}`,
          class: "border rounded px-2 py-1 w-full",
        });
        // opsi tetap sama seperti sebelumnya
        (pedagogicOptions.length ? pedagogicOptions : ["Diskusi", "Demonstrasi", "Bermain Peran", "Eksperimen"]).forEach((opt) =>
          sel.appendChild(createEl("option", { value: opt }, opt))
        );
        const row = createEl("div", {}, [
          createEl("span", { class: "mr-2" }, `Pertemuan ${i}`),
          sel,
        ]);
        container.appendChild(row);
      }
    }

    // sinkron dengan jumlah pertemuan
    const numMeetingsEl = form.querySelector('[name="numMeetings"]');
    const getCount = () => Math.max(1, parseInt(numMeetingsEl?.value || "1", 10) || 1);

    render(getCount());

    numMeetingsEl?.addEventListener("input", () => render(getCount()));
    numMeetingsEl?.addEventListener("change", () => render(getCount()));
  })();

  /* ---------- 3) Dimensi Profil Pelajar Pancasila → checkbox (bullet kotak) ---------- */
  (function upgradeGraduateDimensions() {
    const container = createEl("div", { id: "graduateDimensionsContainer", class: "grid gap-2" });
    if (oldGradSel) oldGradSel.replaceWith(container);
    else form.appendChild(container);

    const list = gradOptions.length
      ? gradOptions
      : [
          "Beriman, bertakwa kepada Tuhan YME, dan berakhlak mulia",
          "Berkebinekaan global",
          "Bergotong-royong",
          "Mandiri",
          "Bernalar kritis",
          "Kreatif",
        ];

    list.forEach((label, idx) => {
      const id = `grad_${idx}`;
      const item = createEl(
        "label",
        {
          for: id,
          class: "flex items-center gap-2",
          style: { listStyleType: "square" }, // bullet kotak (visual bantu)
        },
        [
          createEl("input", { type: "checkbox", id, name: "graduateDimensions", value: label }),
          createEl("span", {}, label),
        ]
      );
      container.appendChild(item);
    });
  })();
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
    Array.isArray(arr) && arr.length ? `<ul style="list-style:square;padding-left:20px">${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "<p>-</p>";

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

  // Upgrade field sesuai instruksi (buat dropdown, checkbox, dsb.)
  document.addEventListener("DOMContentLoaded", upgradeFields);
  // Jika skrip dimuat setelah DOM siap:
  if (document.readyState === "interactive" || document.readyState === "complete") upgradeFields();

  function buildPromptFromForm() {
    const v = (name) => (formEl.querySelector(`[name="${name}"]`)?.value || "").trim();

    // Ambil semua praktik pedagogik (per pertemuan)
    const pedagogik = Array.from(formEl.querySelectorAll('[name^="pedagogicalPractices_"]'))
      .map((el) => el.value)
      .filter(Boolean)
      .join(", ");

    // Ambil semua dimensi PPP yang dicentang
    const gradDims = Array.from(formEl.querySelectorAll('input[name="graduateDimensions"]:checked'))
      .map((el) => el.value)
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
- Praktik Pedagogik: ${pedagogik}
- Dimensi Profil Pelajar Pancasila: ${gradDims}

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
