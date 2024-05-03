const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// Token bot Telegram Anda
const token = '6983477851:AAHD2r9rSbmeN75IspOVad485fz1_feW5kg'; // Ganti dengan token bot Anda

// URL aplikasi Anda di hosting
const appUrl = 'https://tukukripto.my.id/api';

// Inisialisasi bot
const bot = new TelegramBot(token);

// Buat instance Express
const app = express();

// Gunakan middleware bodyParser untuk memproses data dari Telegram
app.use(bodyParser.json());

// Endpoint untuk menerima pembaruan dari server Telegram
app.post('/webhook', async (req, res) => {
    const body = req.body;

    // Tangani pembaruan dari server Telegram di sini
    console.log('Received update:', body);

    // Tanggapi hanya pada pembaruan pesan
    if (body.message) {
        const chatId = body.message.chat.id;
        const text = body.message.text;

        // Tangani perintah /start
        if (text === '/start') {
            const pesan = `
Selamat datang di Bot JTikBot!

Untuk menggunakan bot ini, cukup kirimkan URL dari video TikTok yang ingin Anda unduh. Bot akan mengunduh video tersebut dan mengirimkannya kepada Anda.

Contoh penggunaan:
/tt <link vidio tiktok>

Bot ini dibuat oleh Jhody. Kunjungi website kami di [Tukukripto](https://tukukripto.my.id/) untuk informasi lebih lanjut.

Terima kasih telah menggunakan bot ini!`;
            bot.sendMessage(chatId, pesan, { parse_mode: 'Markdown' });
        }

        // Tangani perintah /tt
        if (text.startsWith('/tt ')) {
            // Tangani perintah /tt
            const url = text.substring(4).trim(); // Ambil URL dari pesan

            // Payload untuk mengambil data TikWM
            const payloadUrl = {
                url: url,
                count: 12,
                cursor: 0,
                web: 1,
                hd: 1
            };

            try {
                // Mendapatkan data dari API TikWM
                const response = await dapatkanDataTikWM(payloadUrl);

                // Cari dan tampilkan nilai hdplay jika ada dalam objek data
                if (response && response.data && response.data.hdplay) {
                    const videoUrl = `https://tikwm.com${response.data.hdplay}`;
                    bot.sendMessage(chatId, videoUrl); // Kirim URL video ke pengguna
                } else {
                    bot.sendMessage(chatId, 'Tidak ada pesan hdplay yang ditemukan.');
                }
            } catch (error) {
                console.error('Gagal mendapatkan data dari API TikWM:', error);
            }
        }
    }

    // Kirim status OK kembali ke server Telegram
    res.sendStatus(200);
});

// Fungsi untuk mendapatkan data dari API TikWM
async function dapatkanDataTikWM(payloadUrl) {
    const urlTikWM = 'https://tikwm.com/api/';
    try {
        const response = await axios.get(urlTikWM, { params: payloadUrl });
        return response.data;
    } catch (error) {
        throw new Error('Gagal mendapatkan data dari API TikWM:', error);
    }
}

// Logging jika bot berjalan
console.log('Bot Telegram sedang berjalan...');

// Atur webhook untuk bot Telegram
bot.setWebHook(`${appUrl}/webhook`);

// Port yang digunakan oleh aplikasi Express
const port = process.env.PORT || 3000;

// Jalankan server
app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});
