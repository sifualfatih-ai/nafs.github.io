<?php
// Muat .env sederhana untuk Hostinger
$envPath = __DIR__ . '/.env';
if (is_readable($envPath)) {
  foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    if (strpos(ltrim($line), '#') === 0) continue;
    [$k,$v] = array_map('trim', explode('=', $line, 2));
    if ($k !== '') putenv("$k=$v");
  }
}
