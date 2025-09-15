<?php
declare(strict_types=1);
ob_start();           // tahan output liar
require __DIR__ . '/env.php';

// SET LIMIT agar upload/HTTP2 stabil
@ini_set('display_errors', '0');
@ini_set('log_errors', '1');
@ini_set('post_max_size', '64M');
@ini_set('upload_max_filesize', '64M');
@ini_set('max_execution_time', '120');

// Preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header('Access-Control-Allow-Origin: https://nafsflow.com');
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
  http_response_code(204); exit;
}

// Header JSON
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: https://nafsflow.com');

try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    throw new RuntimeException('Method not allowed');
  }

  // Ambil input dari FormData
  $prompt   = trim($_POST['prompt']   ?? '');
  $model    = trim($_POST['model']    ?? 'VEO 2.0');
  $ratio    = trim($_POST['ratio']    ?? '9:16');
  $duration = trim($_POST['duration'] ?? '8');
  $category = trim($_POST['category'] ?? '');

  if ($prompt === '') throw new RuntimeException('Prompt kosong');

  // (Opsional) Simpan file referensi jika ada
  $refPath = null;
  if (!empty($_FILES['reference']['tmp_name'])) {
    $ext = pathinfo($_FILES['reference']['name'], PATHINFO_EXTENSION);
    $safe = 'ref_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . preg_replace('/[^a-z0-9]/i','', $ext);
    $dest = __DIR__ . '/uploads/' . $safe;
    @mkdir(__DIR__ . '/uploads', 0775, true);
    if (!move_uploaded_file($_FILES['reference']['tmp_name'], $dest)) {
      throw new RuntimeException('Gagal menyimpan file referensi');
    }
    $refPath = $dest;
  }

  // ==== PANGGIL LAYANAN GENERATOR (server-side) ====
  // Kunci & endpoint dari .env (JANGAN taruh di front-end)
  $API_KEY   = getenv('GEN_AI_API_KEY') ?: '';
  $ENDPOINT  = getenv('GEN_AI_ENDPOINT') ?: ''; // contoh: https://your-worker/render
  // Jika kamu pakai Google AI (Veo), isi worker kamu untuk memanggil model-video.
  // Di sini kita kirim ke worker milikmu agar gak expose API langsung.
  if ($ENDPOINT === '' || $API_KEY === '') {
    // Dev fallback: balikan poster mock agar UI tetap hidup
    echo json_encode([
      'ok' => true,
      'posterUrl' => 'https://placehold.co/900x1600/2a0f4a/ffffff?text=Mock+Video',
      'videoUrl'  => null,
      'note'      => 'Dev fallback: set GEN_AI_ENDPOINT & GEN_AI_API_KEY di /public/api/.env'
    ]);
    exit;
  }

  // Contoh minimal proxy ke worker kamu (ubah sesuai worker):
  $payload = [
    'prompt'   => $prompt,
    'model'    => $model,
    'ratio'    => $ratio,
    'duration' => $duration,
    'category' => $category
  ];
  // Kirim file sebagai multipart jika worker butuh
  $boundary = uniqid();
  $delimiter = '-------------' . $boundary;
  $body = '';

  // text fields
  foreach ($payload as $name => $content) {
    $body .= "--$delimiter\r\n";
    $body .= "Content-Disposition: form-data; name=\"$name\"\r\n\r\n$content\r\n";
  }

  // file field
  if ($refPath) {
    $body .= "--$delimiter\r\n";
    $body .= "Content-Disposition: form-data; name=\"reference\"; filename=\"reference.png\"\r\n";
    $body .= "Content-Type: application/octet-stream\r\n\r\n";
    $body .= file_get_contents($refPath) . "\r\n";
  }
  $body .= "--$delimiter--\r\n";

  $ch = curl_init($ENDPOINT);
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
      "Authorization: Bearer $API_KEY",
      "Content-Type: multipart/form-data; boundary=$delimiter",
      "Accept: application/json"
    ],
    CURLOPT_POSTFIELDS => $body,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 110,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_2TLS, // HTTP/2
  ]);
  $resp = curl_exec($ch);
  if ($resp === false) throw new RuntimeException('Worker error: '.curl_error($ch));
  $code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  curl_close($ch);

  if ($code < 200 || $code >= 300) {
    throw new RuntimeException("Worker HTTP $code: $resp");
  }

  // Harapkan worker mengembalikan {ok, posterUrl?, videoUrl?}
  $json = json_decode($resp, true);
  if (!is_array($json)) throw new RuntimeException('Invalid JSON from worker');
  echo json_encode($json, JSON_UNESCAPED_SLASHES);

} catch (Throwable $e) {
  http_response_code(200); // beri 200 agar tak memicu PROTOCOL_ERROR dari proxy
  echo json_encode([
    'ok' => false,
    'error' => $e->getMessage(),
  ], JSON_UNESCAPED_SLASHES);
}
ob_end_flush();
