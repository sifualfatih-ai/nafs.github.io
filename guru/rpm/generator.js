const DEFAULT_GEMINI_API_KEY =
  (window.__ENV && window.__ENV.GEMINI_API_KEY) ||
  window.__ENV_GEMINI_KEY ||
  "";

/* =========================
   Helper umum
========================= */
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
  return Array.from(sel.querySelectorAll("option")).map(
    (o) => o.value || o.textContent
  );
}
function loadScriptOnce(src, globalCheck) {
  return new Promise((resolve, reject) => {
    if (globalCheck && globalCheck()) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Gagal memuat ${src}`));
    document.head.appendChild(s);
  });
}

/* =========================
   Ambil data form
========================= */
function getFormData(form) {
  const fd = new FormData(form);

  const valsByPrefix = (prefix) =>
    Array.from(form.querySelectorAll(`[name^="${prefix}"]`))
      .map((el) => (el.value || "").trim())
      .filter((v) => v !== "");

  const checked = (name) =>
    Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map(
      (el) => el.value
    );

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
    pedagogicalPractices: valsByPrefix("pedagogicalPractices_"),
    graduateDimensions: checked("graduateDimensions"),
  };
}

/* =========================
   Upgrade field sesuai instruksi sebelumnya
========================= */
function upgradeFields() {
  const form = document.getElementById("rpmForm");
  if (!form) return;

  // 1) Nama Kelas → dropdown + kelola (localStorage)
  (function upgradeClassName() {
    const old = form.querySelector('[name="className"]');
    if (!old) return;
    const hidden =
      old.tagName === "INPUT"
        ? old
        : createEl("input", { type: "hidden", name: "className" });
    if (old !== hidden) old.replaceWith(hidden);

    const wrapper = createEl("div", { class: "flex gap-2 items-center" });
    hidden.parentNode.insertBefore(wrapper, hidden.nextSibling);

    const LS_KEY = "rpm_class_name_options";
    const defaultOpts = ["Kelas A", "Kelas B", "Kelas Besar", "Kelas Kecil"];
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    let options = Array.isArray(saved) && saved.length ? saved : defaultOpts;

    const sel = createEl("select", {
      id: "classNameSelect",
      class: "border rounded px-2 py-1 w-full",
    });
    function refresh(valueToKeep) {
      sel.innerHTML = "";
      options.forEach((opt) =>
        sel.appendChild(createEl("option", { value: opt }, opt))
      );
      const val = valueToKeep || hidden.value || options[0] || "";
      sel.value = val;
      hidden.value = val;
    }
    refresh();
    sel.addEventListener("change", () => (hidden.value = sel.value));

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
        .filter(Boolean);
      if (!cleaned.length) return;
      options = Array.from(new Set(cleaned));
      localStorage.setItem(LS_KEY, JSON.stringify(options));
      refresh();
    });

    wrapper.appendChild(sel);
    wrapper.appendChild(btnManage);
  })();

  // 2) Praktik Pedagogik → dropdown dinamis mengikuti jumlah pertemuan
  const oldPedagSel = form.querySelector('[name="pedagogicalPractices"]');
  const pedagogicOptions = extractOptionsFromSelect(oldPedagSel);
  (function upgradePedagogic() {
    const container = createEl("div", {
      id: "pedagogicalContainer",
      class: "space-y-2",
    });
    if (oldPedagSel) oldPedagSel.replaceWith(container);
    else form.appendChild(container);

    function render(count) {
      container.innerHTML = "";
      for (let i = 1; i <= count; i++) {
        const sel = createEl("select", {
          name: `pedagogicalPractices_${i}`,
          class: "border rounded px-2 py-1 w-full",
        });
        (pedagogicOptions.length
          ? pedagogicOptions
          : ["Diskusi", "Demonstrasi", "Bermain Peran", "Eksperimen"]
        ).forEach((opt) =>
          sel.appendChild(createEl("option", { value: opt }, opt))
        );
        container.appendChild(
          createEl("div", {}, [
            createEl("span", { class: "mr-2" }, `Pertemuan ${i}`),
            sel,
          ])
        );
      }
    }
    const numMeetingsEl = form.querySelector('[name="numMeetings"]');
    const getCount = () =>
      Math.max(1, parseInt(numMeetingsEl?.value || "1", 10) || 1);
    render(getCount());
    numMeetingsEl?.addEventListener("input", () => render(getCount()));
    numMeetingsEl?.addEventListener("change", () => render(getCount()));
  })();

  // 3) Dimensi Profil Pelajar Pancasila → checkbox (bullet kotak)
  const oldGradSel = form.querySelector('[name="graduateDimensions"]');
  const gradOptions = extractOptionsFromSelect(oldGradSel);
  (function upgradeGraduateDimensions() {
    const container = createEl("div", {
      id: "graduateDimensionsContainer",
      class: "grid gap-2",
    });
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
          style: { listStyleType: "square" },
        },
        [
          createEl("input", {
            type: "checkbox",
            id,
            name: "graduateDimensions",
            value: label,
          }),
          createEl("span", {}, label),
        ]
      );
      container.appendChild(item);
    });
  })();
}

/* =======================================================
   RENDER DOKUMEN RPM (bukan JSON) – tampil rapi seperti Word
   + blok tanda tangan kiri (Kepala Sekolah) & kanan (Wali Kelas)
======================================================= */
function renderRPM(rpm) {
  const out = document.getElementById("output");
  if (!rpm) {
    out.innerHTML = "";
    return;
  }

  const esc = (s) =>
    (s || "").toString().replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m]));

  const bullets = (arr) =>
    Array.isArray(arr) && arr.length
      ? `<ul style="list-style:square;padding-left:20px">${arr
          .map((x) => `<li>${esc(x)}</li>`)
          .join("")}</ul>`
      : "<p>-</p>";

  const numbers = (arr) =>
    Array.isArray(arr) && arr.length
      ? `<ol>${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>`
      : "<p>-</p>";

  const pertemuanBlocks =
    (rpm.pengalamanBelajar?.pertemuan || [])
      .map(
        (p, i) => `
      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-left:4px solid #16a34a;border-radius:10px;padding:12px 14px;margin:12px 0;">
        <h3 style="font:bold 18px 'Times New Roman',Georgia,serif;margin:0 0 6px;">III.${i +
          1} Pertemuan ${i + 1}</h3>
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

  // Ambil nama dari form terakhir
  const form = window.__LAST_FORM__ || {};
  const headmasterName = form.headmasterName || "";
  const teacherName = form.teacherName || "";

  out.innerHTML = `
    <div class="doc" style="
      background:#fff;color:#111827;font-family:'Times New Roman', Georgia, serif;line-height:1.6;
      padding:28px;border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,.08);max-width:900px;margin:8px auto 0; min-height:1100px; display:flex; flex-direction:column;">
      <div style="flex:1 0 auto;">
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

      <!-- Blok tanda tangan di bawah -->
      <div style="flex-shrink:0; margin-top:36px;">
        <div style="display:flex; justify-content:space-between; gap:24px;">
          <!-- Kiri bawah: Kepala Sekolah -->
          <div style="width:48%; text-align:left;">
            <div style="font-weight:bold; margin-bottom:4px;">Mengetahui,</div>
            <div style="font-weight:bold;">Kepala Sekolah</div>
            <div style="height:64px;"></div>
            <div style="border-top:1.5px solid #111; display:inline-block; min-width:260px; padding-top:4px;">
              <div style="font-weight:bold;">${esc(headmasterName)}</div>
              <div style="font-size:12px;">Tanda tangan & nama jelas</div>
            </div>
          </div>

          <!-- Kanan bawah: Wali Kelas/Guru -->
          <div style="width:48%; text-align:right;">
            <div style="font-weight:bold; margin-bottom:4px;">Disusun oleh,</div>
            <div style="font-weight:bold;">Wali Kelas / Guru</div>
            <div style="height:64px;"></div>
            <div style="border-top:1.5px solid #111; display:inline-block; min-width:260px; padding-top:4px;">
              <div style="font-weight:bold;">${esc(teacherName)}</div>
              <div style="font-size:12px;">Tanda tangan & nama jelas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* =======================================================
   Prompt builder (analisa teliti & kesimpulan presisi)
======================================================= */
function buildPromptFromForm(formEl) {
  const v = (name) =>
    (formEl.querySelector(`[name="${name}"]`)?.value || "").trim();

  const pedagogik = Array.from(
    formEl.querySelectorAll('[name^="pedagogicalPractices_"]')
  )
    .map((el) => el.value)
    .filter(Boolean)
    .join(", ");

  const gradDims = Array.from(
    formEl.querySelectorAll('input[name="graduateDimensions"]:checked')
  )
    .map((el) => el.value)
    .join(", ");

  return `
Anda adalah **perancang kurikulum Indonesia**. Gunakan kemampuan analisis tingkat tinggi untuk memahami maksud teks input, menyimpulkan kebutuhan belajar, dan memberi rekomendasi **sangat presisi**. 
Lakukan penalaran internal Anda, namun **kembalikan hanya JSON VALID** sesuai skema—tanpa teks lain.

Data:
- Nama Satuan Pendidikan: ${v("schoolName")}
- Jenjang Pendidikan: ${v("educationLevel")}
- Nama Kelas: ${v("className")}
- Tema Pembelajaran: ${v("learningTheme")}
- Capaian Pembelajaran: ${v("learningOutcomes")}
- Materi Pelajaran: ${v("subjectMatter")}
- Jumlah Pertemuan: ${v("numMeetings")}
- Durasi pertemuan: ${v("meetingDuration")}
- Praktik Pedagogik (urut sesuai pertemuan): ${pedagogik}
- Dimensi Profil Pelajar Pancasila (multi pilih): ${gradDims}

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

/* =======================================================
   Ekspor PDF & DOCX (fallback bawaan)
======================================================= */
async function exportPDF() {
  const target = document.getElementById("output");
  if (!target || !target.firstElementChild)
    return window.NafsUI?.toast?.("Belum ada hasil", "error");

  await loadScriptOnce(
    "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js",
    () => window.html2canvas
  );
  await loadScriptOnce(
    "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",
    () => window.jspdf && window.jspdf.jsPDF
  );

  const canvas = await window.html2canvas(target.firstElementChild, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "pt", "a4");
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();

  const imgW = pdfW;
  const imgH = (canvas.height * imgW) / canvas.width;

  let position = 0;
  pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
  let heightLeft = imgH - pdfH;

  while (heightLeft > 0) {
    position = -heightLeft;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
    heightLeft -= pdfH;
  }

  pdf.save("RPM.pdf");
}

async function ensureDocxLib() {
  await loadScriptOnce(
    "https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.min.js",
    () => window.docx
  );
}
async function exportDocx(rpm, formObj = {}) {
  await ensureDocxLib();
  const d = window.docx;

  const sigTable = new d.Table({
    rows: [
      new d.TableRow({
        children: [
          new d.TableCell({
            children: [
              new d.Paragraph({ text: "Mengetahui,", spacing: { after: 80 } }),
              new d.Paragraph({ text: "Kepala Sekolah", bold: true }),
              new d.Paragraph({ text: " ", spacing: { after: 600 } }), // ruang ttd
              new d.Paragraph({
                children: [
                  new d.TextRun({ text: (formObj.headmasterName || "").toUpperCase(), bold: true }),
                ],
              }),
              new d.Paragraph({ text: "Tanda tangan & nama jelas", size: 20 }),
            ],
            borders: d.Borders.NONE,
          }),
          new d.TableCell({
            children: [
              new d.Paragraph({ text: "Disusun oleh,", alignment: d.AlignmentType.RIGHT, spacing: { after: 80 } }),
              new d.Paragraph({ text: "Wali Kelas / Guru", bold: true, alignment: d.AlignmentType.RIGHT }),
              new d.Paragraph({ text: " ", spacing: { after: 600 } }),
              new d.Paragraph({
                alignment: d.AlignmentType.RIGHT,
                children: [
                  new d.TextRun({ text: (formObj.teacherName || "").toUpperCase(), bold: true }),
                ],
              }),
              new d.Paragraph({ text: "Tanda tangan & nama jelas", alignment: d.AlignmentType.RIGHT, size: 20 }),
            ],
            borders: d.Borders.NONE,
          }),
        ],
      }),
    ],
    width: { size: 100, type: d.WidthType.PERCENTAGE },
  });

  const doc = new d.Document({
    sections: [
      {
        properties: {},
        children: [
          new d.Paragraph({
            text: "RENCANA PEMBELAJARAN MENDALAM (RPM)",
            heading: d.HeadingLevel.TITLE,
            spacing: { after: 200 },
          }),
          new d.Paragraph({
            text: `Satuan Pendidikan: ${formObj.schoolName || ""}`,
          }),
          new d.Paragraph({
            text: `Jenjang: ${formObj.educationLevel || ""}  |  Kelas: ${
              formObj.className || ""
            }`,
            spacing: { after: 200 },
          }),

          new d.Paragraph({
            text: "I. Identifikasi",
            heading: d.HeadingLevel.HEADING_2,
          }),
          new d.Paragraph({ text: `Siswa: ${rpm?.identifikasi?.siswa || "-"}` }),
          new d.Paragraph({
            text: `Materi Pelajaran: ${
              rpm?.identifikasi?.materiPelajaran || "-"
            }`,
          }),
          new d.Paragraph({
            text:
              "Dimensi Profil Pelajar Pancasila: " +
              (rpm?.identifikasi?.dimensiProfilPelajarPancasila || []).join(
                "; "
              ),
            spacing: { after: 200 },
          }),

          new d.Paragraph({
            text: "II. Desain Pembelajaran",
            heading: d.HeadingLevel.HEADING_2,
          }),
          new d.Paragraph({
            text:
              "Capaian Pembelajaran: " +
              (rpm?.desainPembelajaran?.capaianPembelajaran || "-"),
          }),
          new d.Paragraph({
            text:
              "Lintas Disiplin Ilmu: " +
              (rpm?.desainPembelajaran?.lintasDisiplinIlmu || []).join("; "),
          }),
          new d.Paragraph({
            text:
              "Tujuan Pembelajaran: " +
              (rpm?.desainPembelajaran?.tujuanPembelajaran || []).join("; "),
          }),
          new d.Paragraph({
            text:
              "Materi Ajar: " + (rpm?.desainPembelajaran?.materiAjar || "-"),
            spacing: { after: 200 },
          }),

          new d.Paragraph({
            text: "III. Pengalaman Belajar",
            heading: d.HeadingLevel.HEADING_2,
          }),
          ...(rpm?.pengalamanBelajar?.pertemuan || []).flatMap((p, i) => [
            new d.Paragraph({
              text: `Pertemuan ${i + 1}`,
              heading: d.HeadingLevel.HEADING_3,
            }),
            new d.Paragraph({ text: `Awal: ${p.awal || "-"}` }),
            new d.Paragraph({ text: `Inti: ${p.inti || "-"}` }),
            new d.Paragraph({ text: `Refleksi: ${p.refleksi || "-"}` }),
            new d.Paragraph({
              text: `Penutup: ${p.penutup || "-"}`,
              spacing: { after: 150 },
            }),
          ]),

          new d.Paragraph({
            text: "IV. Asesmen Pembelajaran",
            heading: d.HeadingLevel.HEADING_2,
          }),
          new d.Paragraph({
            text: `Asesmen Awal: ${rpm?.asesmenPembelajaran?.asesmenAwal || "-"}`,
          }),
          new d.Paragraph({
            text:
              "Asesmen Proses: " +
              (rpm?.asesmenPembelajaran?.asesmenProses || "-"),
          }),
          new d.Paragraph({
            text:
              "Asesmen Akhir: " +
              (rpm?.asesmenPembelajaran?.asesmenAkhir || "-"),
            spacing: { after: 200 },
          }),

          // Tabel tanda tangan
          sigTable,
        ],
      },
    ],
  });

  const blob = await d.Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "RPM.docx";
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

/* =======================================================
   Wiring tombol (Generate, Print, PDF, Export, Clear)
======================================================= */
(function () {
  const formEl = document.getElementById("rpmForm");
  const outEl = document.getElementById("output");
  const btnPrint = document.getElementById("btnPrint");
  let btnPdf = document.getElementById("btnPdf");
  const btnExport = document.getElementById("btnExport");
  let btnClear = document.getElementById("btnClear");

  // Pastikan field sudah di-upgrade
  document.addEventListener("DOMContentLoaded", upgradeFields);
  if (document.readyState === "interactive" || document.readyState === "complete")
    upgradeFields();

  // Tambahkan tombol PDF / Clear jika belum ada
  const toolbar =
    btnPrint?.parentElement ||
    btnExport?.parentElement ||
    formEl?.querySelector(".toolbar");
  if (!btnPdf && toolbar) {
    btnPdf = createEl(
      "button",
      { type: "button", id: "btnPdf", class: "px-3 py-2 border rounded ml-2" },
      "PDF"
    );
    toolbar.appendChild(btnPdf);
  }
  if (!btnClear && toolbar) {
    btnClear = createEl(
      "button",
      { type: "button", id: "btnClear", class: "px-3 py-2 border rounded ml-2" },
      "Clear"
    );
    toolbar.appendChild(btnClear);
  }

  function setLoading(isLoading) {
    const submitBtn =
      formEl.querySelector('[type="submit"]') ||
      formEl.querySelector("#btnGenerate");
    if (!submitBtn) return;
    submitBtn.disabled = !!isLoading;
    submitBtn.dataset._origText = submitBtn.dataset._origText || submitBtn.textContent;
    submitBtn.textContent = isLoading ? "Mengolah (analisa presisi)..." : submitBtn.dataset._origText;
  }

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();

    const prompt = buildPromptFromForm(formEl);

    try {
      setLoading(true);
      const rpm = await window.generateViaProxy(prompt, {
        loadingText: "Menganalisis input & menyusun RPM…",
        onDone: () => window.NafsUI?.toast?.("Berhasil generate", "success"),
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
    } finally {
      setLoading(false);
    }
  });

  // Print
  btnPrint?.addEventListener("click", () => {
    if (!window.__LAST_RPM__) return window.NafsUI?.toast?.("Belum ada hasil", "error");
    window.print();
  });

  // PDF
  btnPdf?.addEventListener("click", async () => {
    if (!window.__LAST_RPM__) return window.NafsUI?.toast?.("Belum ada hasil", "error");
    try {
      await exportPDF();
      window.NafsUI?.toast?.("PDF siap diunduh", "success");
    } catch (e) {
      window.NafsUI?.toast?.(`Gagal membuat PDF: ${e.message}`, "error");
    }
  });

  // Export Word (pakai fallback jika fungsi global tidak ada)
  btnExport?.addEventListener("click", async () => {
    if (!window.__LAST_RPM__) return window.NafsUI?.toast?.("Belum ada hasil", "error");
    try {
      if (typeof window.exportDocx === "function") {
        window.exportDocx(window.__LAST_RPM__, window.__LAST_FORM__ || {});
      } else {
        await exportDocx(window.__LAST_RPM__, window.__LAST_FORM__ || {});
      }
    } catch (e) {
      window.NafsUI?.toast?.(`Gagal ekspor DOCX: ${e.message}`, "error");
    }
  });

  // Clear
  btnClear?.addEventListener("click", () => {
    formEl.reset();
    const numMeet = formEl.querySelector('[name="numMeetings"]');
    if (numMeet) numMeet.value = "1";
    upgradeFields();
    outEl.innerHTML = "";
    delete window.__LAST_RPM__;
    delete window.__LAST_FORM__;
    window.NafsUI?.toast?.("Form & hasil dibersihkan", "success");
  });
})();
