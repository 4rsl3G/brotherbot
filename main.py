import requests
import os
import time
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters

# Token bot Telegram Anda
TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN'

# Inisialisasi bot
updater = Updater(token=TOKEN, use_context=True)
dispatcher = updater.dispatcher

# Fungsi untuk mendapatkan data dari API TikWM
def dapatkan_data_tikwm(payload_url):
    url_tikwm = 'https://tikwm.com/api/'
    try:
        response = requests.get(url_tikwm, params=payload_url)
        return response.json()
    except Exception as e:
        print('Gagal mendapatkan data dari API TikWM:', e)

# Handler untuk perintah /start
def start(update, context):
    pesan = """
Selamat datang di Bot JTikBot!

Untuk menggunakan bot ini, cukup kirimkan URL dari video TikTok yang ingin Anda unduh. Bot akan mengunduh video tersebut dan mengirimkannya kepada Anda.

Contoh penggunaan:
/tt <link vidio tiktok>

Bot ini dibuat oleh Jhody. Kunjungi website kami di [Tukukripto](https://tukukripto.my.id/) untuk informasi lebih lanjut.

Terima kasih telah menggunakan bot ini!
"""
    context.bot.send_message(chat_id=update.effective_chat.id, text=pesan, parse_mode='Markdown')

# Handler untuk perintah /tt
def unduh_video(update, context):
    chat_id = update.effective_chat.id
    url = context.args[0] if len(context.args) > 0 else None

    if url:
        # Payload untuk mengambil data TikWM
        payload_url = {
            'url': url,
            'count': 12,
            'cursor': 0,
            'web': 1,
            'hd': 1
        }

        # Mendapatkan data dari API TikWM
        response = dapatkan_data_tikwm(payload_url)

        # Cari dan tampilkan nilai hdplay jika ada dalam objek data
        if response and 'data' in response and 'hdplay' in response['data']:
            video_url = f"https://tikwm.com{response['data']['hdplay']}"
            # Download video
            try:
                with requests.get(video_url, stream=True) as r:
                    r.raise_for_status()
                    # Path untuk menyimpan video
                    output_path = f"./src/video_{int(time.time())}.mp4"
                    with open(output_path, 'wb') as f:
                        for chunk in r.iter_content(chunk_size=8192):
                            f.write(chunk)
                # Kirim video ke pengguna
                context.bot.send_video(chat_id=chat_id, video=open(output_path, 'rb'))
                # Hapus video dari server setelah berhasil dikirimkan
                os.remove(output_path)
            except Exception as e:
                print('Gagal mengunduh atau mengirim video:', e)
                context.bot.send_message(chat_id=chat_id, text='Gagal mengunduh atau mengirim video.')
        else:
            context.bot.send_message(chat_id=chat_id, text='Tidak ada pesan hdplay yang ditemukan.')

    else:
        context.bot.send_message(chat_id=chat_id, text='Silakan sertakan URL video TikTok.')

# Handler untuk perintah tidak dikenal
def unknown(update, context):
    context.bot.send_message(chat_id=update.effective_chat.id, text="Perintah tidak dikenal. Gunakan /start untuk memulai.")

# Menambahkan handler ke dispatcher
dispatcher.add_handler(CommandHandler("start", start))
dispatcher.add_handler(CommandHandler("tt", unduh_video))
dispatcher.add_handler(MessageHandler(Filters.command, unknown))

# Memulai bot
updater.start_polling()
print('Bot Telegram sedang berjalan...')
updater.idle()
