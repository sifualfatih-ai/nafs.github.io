const DEFAULT_GEMINI_API_KEY = (window.__ENV && window.__ENV.GEMINI_API_KEY) || window.__ENV_GEMINI_KEY || "";

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
  const esc = (s) => (s || '').toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
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
      <p><strong>Asesmen Akhir:</strong> ${esc(r


                                               // === Tambahan: klik tombol Generate panggil proxy generate.php ===
(function () {
  const formEl   = document.getElementById('rpmForm');
  const outEl    = document.getElementById('output');
  const btnPrint = document.getElementById('btnPrint');
  const btnExport= document.getElementById('btnExport');

  function buildPromptFromForm() {
    const v = (name) => (formEl.querySelector(`[name="${name}"]`)?.value || '').trim();
    const multi = (name) =>
      Array.from(formEl.querySelector(`[name="${name}"]`)?.selectedOptions || [])
        .map(o => o.value).join(', ');

    return `
Anda adalah perancang kurikulum Indonesia. Kembalikan **JSON VALID SAJA** sesuai skema di bawah, tanpa teks lain.

Data:
- Nama Satuan Pendidikan: ${v('schoolName')}
- Jenjang Pendidikan: ${v('educationLevel')}
- Nama Kelas: ${v('className')}
- Tema Pembelajaran: ${v('learningTheme')}
- Capaian Pembelajaran: ${v('learningOutcomes')}
- Materi Pelajaran: ${v('subjectMatter')}
- Jumlah Pertemuan: ${v('numMeetings')}
- Durasi pertemuan: ${v('meetingDuration')}
- Praktik Pedagogik: ${multi('pedagogicalPractices')}
- Dimensi Profil Pelajar Pancasila: ${multi('graduateDimensions')}

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

  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = buildPromptFromForm();

    try {
      const rpm = await window.generateViaProxy(prompt, {
        loadingText: 'Menyusun RPM…',
        onDone: () => window.NafsUI.toast('Berhasil generate', 'success')
      });

      window.__LAST_RPM__  = rpm;
      window.__LAST_FORM__ = Object.fromEntries(new FormData(formEl).entries());

      if (typeof renderRPM === 'function') {
        renderRPM(rpm);
      } else {
        outEl.textContent = JSON.stringify(rpm, null, 2);
      }
    } catch (err) {
      outEl.innerHTML = `<div class="text-red-600">Gagal generate: ${err.message}</div>`;
    }
  });

  btnPrint?.addEventListener('click', () => {
    if (!window.__LAST_RPM__) return window.NafsUI.toast('Belum ada hasil', 'error');
    window.print();
  });

  btnExport?.addEventListener('click', () => {
    if (!window.__LAST_RPM__) return window.NafsUI.toast('Belum ada hasil', 'error');
    if (typeof exportDocx === 'function') {
      exportDocx(window.__LAST_RPM__, window.__LAST_FORM__ || {});
    } else {
      window.NafsUI.toast('Fungsi exportDocx tidak ditemukan', 'error');
    }
  });
})();
