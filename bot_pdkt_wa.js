/**
 * ====================================================================
 * BOT WHATSAPP GAME PDKT (SINGLE FILE VERSION)
 * ====================================================================
 * 
 * Cara Install Paket (di Terminal / Cloud Server Console):
 * npm install @whiskeysockets/baileys qrcode-terminal pino
 * 
 * Cara Jalankan Bot:
 * node bot_pdkt_wa.js
 * ====================================================================
 */

const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

// ====================================================================
// DATABASE PERTANYAAN & GAME PDKT
// ====================================================================

const truthList = [
  "Apa kesan pertama kamu pas awal lihat/kenal aku?",
  "Hal paling konyol yang pernah kamu lakuin pas lagi ngelamun apa?",
  "Sebutin 1 kriteria pasangan yang 'wajib banget' ada di doi!",
  "Pernah salah paham tentang aku gak sebelumnya?",
  "Apa hal kecil dari aku yang pernah bikin kamu tersenyum sendiri?",
  "Satu kata yang paling mendeskripsikan first impression kamu ke aku?",
  "Perasaan pertama kamu saat dengar nama aku apa?",
  "Hal apa yang paling kamu sukai dari kepribadianku?",
  "Pernah berfikir aneh-aneh tentang aku gak?",
  "Jika kamu bisa ubah 1 hal dari aku, apa itu?"
];

const dareList = [
  "Kirim foto selfie muka jelek/lucu kamu sekarang!",
  "Kirim pesan suara (VN) nyanyi Reff lagu favorit kamu!",
  "Kasih gombalan paling garing yang kamu tahu via VN!",
  "Kirim ss (screenshot) wallpaper HP kamu sekarang!",
  "Re-share status/story terakhir kamu ke chat ini!",
  "Kirim foto kamu yg paling apa adanya tanpa filter!",
  "Bilang 5x 'aku menyukaimu' dengan suara imut via VN!",
  "Kirim meme paling lucu yang pernah kamu simpan!"
];

const questionsList = [
  "Kalau kamu bisa liburan gratis besok, mau pergi ke mana dan ajak siapa?",
  "Apa momen paling membahagiakan buat kamu di tahun ini?",
  "Kamu lebih suka gaya kencan yang santai (ngopi/jalan) atau formal (dinner)?",
  "Apa hal paling membanggakan yang pernah kamu capai sejauh ini?",
  "Topik obrolan apa yang paling bikin kamu betah ngobrol berjam-jam?",
  "Impian terbesar kamu dalam 5 tahun ke depan apa?",
  "Siapa orang yang paling berpengaruh dalam hidup kamu?",
  "Apa yang biasanya kamu lakukan saat sedang stres?"
];

const icebreakerList = [
  "Kalau kamu dapet uang 100 juta hari ini, 3 barang pertama yang kamu beli apa?",
  "Pilih punya super power bisa menghilang atau bisa membaca pikiran?",
  "Makanan favorit sepanjang masa yang gak pernah bikin bosan?",
  "Tim introvert staycation atau tim ekstrovert jalan-jalan outdoor?",
  "Jika bisa hidup di era mana pun, kapan yang kamu pilih?",
  "Pilih bisa terbang atau bisa berubah bentuk?",
  "Kalau sehari tanpa HP/internet, kamu bisa gak?",
  "Bakat tersembunyi kamu yang belum banyak orang tahu apa?"
];

const pdktLinesList = [
  "Kamu tau gak sih? Setiap kali kamu ketik, aku jadi kaget di sini 💕",
  "Kalau kejeniusan adalah atribut fisik, kamu pasti bercahaya terus 😊",
  "Aku rasa gravitasi baru saja bertambah kuat sejak kamu ada di sini 🌍",
  "Apakah kamu magnet? Karena aku tertarik padamu 🧲",
  "Kamu pernah merasa jatuh dari langit? Karena aku kira itulah cerita kamu 👼"
];

// ====================================================================
// LOGIKA UTAMA BOT WHATSAPP
// ====================================================================

async function startBot() {
    console.log("🚀 Memulai Bot WhatsApp PDKT...");

    // Menyimpan sesi login di folder 'auth_info'
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    // Event Handler Koneksi
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log("\n========================================================");
            console.log("📱 SCAN QR CODE BERIKUT DENGAN WHATSAPP DI IPHONE KAMU:");
            console.log("========================================================\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Koneksi terputus. Menghubungkan ulang...', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('\n✅ BOT WA PDKT BERHASIL TERHUBUNG & SIAP DIGUNAKAN!\n');
        }
    });

    // Event Handler Pesan Masuk
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || '';
        const command = text.trim().toLowerCase();

        try {
            // 1. Menu Utama
            if (command === '!menu' || command === '.menu' || command === 'bot' || command === 'p') {
                const menuText = 
`✨ *BOT GAME PDKT SERU* ✨

Hai! Mau main bareng atau nyari ide obrolan? 
Ketik salah satu perintah berikut ya:

📋 *DAFTAR PERINTAH:*

1️⃣ *.truth* ➡️ Pertanyaan kejujuran PDKT
2️⃣ *.dare* ➡️ Tantangan lucu & seru
3️⃣ *.ask* ➡️ Pertanyaan Deep Talk
4️⃣ *.ice* ➡️ Topik pancingan obrolan
5️⃣ *.line* ➡️ Gombal sweet PDKT
6️⃣ *.help* ➡️ Petunjuk penggunaan

_Selamat bermain & makin akrab! 😉_`;
                await sock.sendMessage(from, { text: menuText }, { quoted: msg });
            }

            // 2. Truth Command
            else if (command === '.truth') {
                const random = truthList[Math.floor(Math.random() * truthList.length)];
                await sock.sendMessage(from, { text: `🧐 *[TRUTH]*\n\n"${random}"` }, { quoted: msg });
            }

            // 3. Dare Command
            else if (command === '.dare') {
                const random = dareList[Math.floor(Math.random() * dareList.length)];
                await sock.sendMessage(from, { text: `🔥 *[DARE]*\n\n"${random}"` }, { quoted: msg });
            }

            // 4. Deep Talk Command
            else if (command === '.ask') {
                const random = questionsList[Math.floor(Math.random() * questionsList.length)];
                await sock.sendMessage(from, { text: `💬 *[DEEP TALK]*\n\n"${random}"` }, { quoted: msg });
            }

            // 5. Icebreaker Command
            else if (command === '.ice') {
                const random = icebreakerList[Math.floor(Math.random() * icebreakerList.length)];
                await sock.sendMessage(from, { text: `💡 *[ICEBREAKER]*\n\n"${random}"` }, { quoted: msg });
            }

            // 6. PDKT Lines Command
            else if (command === '.line') {
                const random = pdktLinesList[Math.floor(Math.random() * pdktLinesList.length)];
                await sock.sendMessage(from, { text: `💕 *[GOMBAL]*\n\n${random}` }, { quoted: msg });
            }

            // 7. Help Command
            else if (command === '.help') {
                const helpText = `ℹ️ *CARA MAIN:*

1. Ketik perintah pilihanmu (misal: *.truth* atau *.ask*).
2. Jawab secara jujur/lakukan tantangannya bareng-bareng!
3. Bisa dimainkan di chat pribadi maupun grup.

*TIPS BERMAIN:*
✓ Menjawab dengan jujur & terbuka
✓ Saling ketawa dengan pertanyaan lucu
✓ Makin sering diulang, makin akrab!

Selamat bersenang-senang! 🎉`;
                await sock.sendMessage(from, { text: helpText }, { quoted: msg });
            }

            // Respons default
            else if (text.length > 0 && !command.startsWith('.') && !command.startsWith('!')) {
                // Jangan balas pesan biasa untuk menghindari spam
            }

        } catch (error) {
            console.error('Error:', error);
            await sock.sendMessage(from, { text: "❌ Terjadi kesalahan! Coba lagi." }, { quoted: msg });
        }
    });
}

// Jalankan Bot
startBot().catch(err => console.error('Fatal Error:', err));
