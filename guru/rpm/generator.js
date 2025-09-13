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
