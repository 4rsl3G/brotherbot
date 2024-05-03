<?php

require 'vendor/autoload.php'; // Sesuaikan dengan lokasi autoload.php Anda

use TelegramBot\Api\Client;
use TelegramBot\Api\Types\Update;

// Token bot Telegram Anda
$token = 'YOUR_TELEGRAM_BOT_TOKEN';

// Inisialisasi bot
$bot = new Client($token);

// Fungsi untuk mendapatkan data dari API TikWM
function dapatkanDataTikWM($payloadUrl) {
    $urlTikWM = 'https://tikwm.com/api/';
    try {
        $response = file_get_contents($urlTikWM . '?' . http_build_query($payloadUrl));
        return json_decode($response, true);
    } catch (Exception $e) {
        echo 'Gagal mendapatkan data dari API TikWM: ' . $e->getMessage();
    }
}

// Handler untuk perintah /start
$bot->command('start', function ($message) use ($bot) {
    $pesan = "
Selamat datang di Bot JTikBot!

Untuk menggunakan bot ini, cukup kirimkan URL dari video TikTok yang ingin Anda unduh. Bot akan mengunduh video tersebut dan mengirimkannya kepada Anda.

Contoh penggunaan:
/tt <link vidio tiktok>

Bot ini dibuat oleh Jhody. Kunjungi website kami di [Tukukripto](https://tukukripto.my.id/) untuk informasi lebih lanjut.

Terima kasih telah menggunakan bot ini!
";
    $bot->sendMessage($message->getChat()->getId(), $pesan, 'Markdown');
});

// Handler untuk perintah /tt
$bot->command('tt', function ($message) use ($bot) {
    $chatId = $message->getChat()->getId();
    $url = isset($message->getCommand()[1]) ? $message->getCommand()[1] : null;

    if ($url) {
        // Payload untuk mengambil data TikWM
        $payloadUrl = [
            'url' => $url,
            'count' => 12,
            'cursor' => 0,
            'web' => 1,
            'hd' => 1
        ];

        // Mendapatkan data dari API TikWM
        $response = dapatkanDataTikWM($payloadUrl);

        // Cari dan tampilkan nilai hdplay jika ada dalam objek data
        if ($response && isset($response['data']['hdplay'])) {
            $videoUrl = 'https://tikwm.com' . $response['data']['hdplay'];

            // Unduh video
            $videoData = file_get_contents($videoUrl);
            // Simpan video ke file lokal
            $videoFileName = './video_' . time() . '.mp4';
            file_put_contents($videoFileName, $videoData);

            // Kirim video ke pengguna
            $bot->sendVideo($chatId, new CURLFile($videoFileName));

            // Hapus file video lokal setelah dikirim
            unlink($videoFileName);
        } else {
            $bot->sendMessage($chatId, 'Tidak ada pesan hdplay yang ditemukan.');
        }
    } else {
        $bot->sendMessage($chatId, 'Silakan sertakan URL video TikTok.');
    }
});

// Jalankan bot
$bot->run();
