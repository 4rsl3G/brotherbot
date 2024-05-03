const axios = require('axios');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

// Token bot Telegram Anda
const token = '7190883171:AAH-9Fu-EnOInHjit7H5_jfahn2dBK4nHYY'; // Ganti dengan token bot Anda

// Inisialisasi bot
const bot = new TelegramBot(token, { polling: true });

// Fungsi untuk mendapatkan data dari API TikWM
async function dapatkanDataTikWM(payloadUrl) {
    const urlTikWM = 'https://tikwm.com/api/';
    try {
        const response = await axios.get(urlTikWM, { params: payloadUrl });
        return response.data;
    } catch (error) {
        console.error('Gagal mendapatkan data dari API TikWM:', error);
    }
}

// Event listener untuk perintah /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const pesan = `
Selamat datang di Bot JTikBot!

Untuk menggunakan bot ini, cukup kirimkan URL dari video TikTok yang ingin Anda unduh. Bot akan mengunduh video tersebut dan mengirimkannya kepada Anda.

Contoh penggunaan:
/tt <link vidio tiktok>

Bot ini dibuat oleh Jhody. Kunjungi website kami di [Tukukripto](https://tukukripto.my.id/) untuk informasi lebih lanjut.

Terima kasih telah menggunakan bot ini!`;
    
    bot.sendMessage(chatId, pesan, { parse_mode: 'Markdown' });
});

// Event listener untuk perintah /tt
bot.onText(/\/tt (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1]; // Ambil URL dari pesan

    // Payload untuk mengambil data TikWM
    const payloadUrl = {
        url: url,
        count: 12,
        cursor: 0,
        web: 1,
        hd: 1
    };

    // Mendapatkan data dari API TikWM
    const response = await dapatkanDataTikWM(payloadUrl);

    // Cari dan tampilkan nilai hdplay jika ada dalam objek data
    if (response && response.data && response.data.hdplay) {
        // Mengunduh video jika ada pesan hdplay
        const videoUrl = `https://tikwm.com${response.data.hdplay}`;
        const outputPath = `./src/video_${Date.now()}.mp4`; // Path untuk menyimpan video

        axios({
            url: videoUrl,
            method: 'GET',
            responseType: 'stream'
        }).then(response => {
            // Simpan video ke file
            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);
            
            writer.on('finish', () => {
                console.log('Video berhasil diunduh dan disimpan di', outputPath);
                // Kirim video ke pengguna dengan ukuran asli
                bot.sendVideo(chatId, fs.createReadStream(outputPath)).then(() => {
                    // Hapus video dari server setelah berhasil dikirimkan
                    fs.unlink(outputPath, (error) => {
                        if (error) {
                            console.error('Gagal menghapus video:', error);
                        } else {
                            console.log('Video berhasil dihapus dari server.');
                        }
                    });
                }).catch(error => {
                    console.error('Gagal mengirim video:', error);
                });
            });
        }).catch(error => {
            console.error('Gagal mengunduh video:', error);
            bot.sendMessage(chatId, 'Gagal mengunduh video.');
        });
        
    } else {
        bot.sendMessage(chatId, 'Tidak ada pesan hdplay yang ditemukan.');
    }
});

// Logging jika bot berjalan
bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

console.log('Bot Telegram sedang berjalan...');
