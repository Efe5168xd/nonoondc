const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const app = express();

// Bot Yetkileri
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
});

app.use(express.json());

// 1. ANA SAYFA (Tarayıcıda 404 hatasını çözen kısım)
app.get('/', (req, res) => {
    res.send('<h1>Leaderboard Botu Aktif!</h1><p>Roblox POST isteklerini bekliyor...</p>');
});

// 2. ROBLOX VERİ ALMA (POST İsteği)
app.post('/update-leaderboard', async (req, res) => {
    const players = req.body.players;
    const channelId = process.env.CHANNEL_ID;

    if (!channelId) {
        console.error("HATA: CHANNEL_ID bulunamadı!");
        return res.status(400).send("Kanal ID eksik.");
    }

    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) return res.status(404).send("Kanal bulunamadı.");

        // Önceki bot mesajını bul (Editlemek için)
        const messages = await channel.messages.fetch({ limit: 20 });
        const botMessage = messages.find(m => m.author.id === client.user.id);

        // Liderlik Tablosu Metni
        let description = "🏆 **TÜM ZAMANLARIN EN İYİLERİ (TOP 10)**\n\n";
        
        if (!players || players.length === 0) {
            description += "🔍 *Henüz kayıtlı bir oyuncu verisi bulunmuyor...*";
        } else {
            players.forEach((p, index) => {
                const d = Math.floor(p.minutes / 1440);
                const h = Math.floor((p.minutes % 1440) / 60);
                const m = p.minutes % 60;
                
                let medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "👤";
                description += `${medal} **${index + 1}.** \`${p.name}\` — **${d}**g **${h}**s **${m}**d\n`;
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("🎮 Canlı Oyun Liderlik Tablosu")
            .setDescription(description)
            .setColor("#FFD700")
            .setTimestamp()
            .setFooter({ text: "Veriler her 30 saniyede bir güncellenir" });

        if (botMessage) {
            await botMessage.edit({ embeds: [embed] });
            console.log("Tablo başarıyla güncellendi (EDİTLENDİ).");
        } else {
            await channel.send({ embeds: [embed] });
            console.log("Yeni tablo gönderildi (YENİ MESAJ).");
        }

        res.status(200).send("Veri işlendi.");
    } catch (err) {
        console.error("İşlem hatası:", err);
        res.status(500).send("Hata oluştu.");
    }
});

// 3. BOT GİRİŞİ VE SUNUCU BAŞLATMA
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
    console.error("HATA: DISCORD_TOKEN Environment Variable olarak eklenmemiş!");
} else {
    client.login(TOKEN).then(() => {
        app.listen(PORT, () => {
            console.log(`-----------------------------------------`);
            console.log(`✅ Bot Aktif: ${client.user.tag}`);
            console.log(`🚀 API Port: ${PORT}`);
            console.log(`🔗 Link: https://leaderboard-4xak.onrender.com/`);
            console.log(`-----------------------------------------`);
        });
    }).catch(err => {
        console.error("Bot giriş yaparken hata aldı:", err);
    });
}
