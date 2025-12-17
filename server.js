const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const app = express();

// Botun yetkilerini ayarlıyoruz
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
});

app.use(express.json());

// Düzenlenecek mesajın ID'sini hafızada tutar
let lastMessageId = null;

app.post('/update-leaderboard', async (req, res) => {
    const players = req.body.players;
    const channelId = process.env.CHANNEL_ID; // Render'daki Environment Variables'dan gelir

    if (!players || !channelId) {
        return res.status(400).send("Eksik veri veya kanal ID.");
    }

    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) return res.status(404).send("Kanal bulunamadı.");

        // Liderlik tablosu metnini hazırlama
        let description = "🏆 **EN ÇOK OYNAYAN TOP 10**\n\n";
        
        if (players.length === 0) {
            description += "*Henüz veri bulunmuyor...*";
        } else {
            players.forEach((p, index) => {
                // Dakikayı Gün, Saat, Dakika formatına çevirme
                const d = Math.floor(p.minutes / 1440);
                const h = Math.floor((p.minutes % 1440) / 60);
                const m = p.minutes % 60;
                
                // Sıralama emojileri
                let medal = "👤";
                if (index === 0) medal = "🥇";
                if (index === 1) medal = "🥈";
                if (index === 2) medal = "🥉";

                description += `${medal} **${index + 1}.** \`${p.name}\` — **${d}**g **${h}**s **${m}**d\n`;
            });
        }

        const embed = new EmbedBuilder()
            .setTitle("🎮 Roblox Oyun Süresi Liderlik Tablosu")
            .setDescription(description)
            .setColor("#F1C40F") // Altın sarısı renk
            .setTimestamp()
            .setFooter({ text: "Veriler 10 dakikada bir güncellenir" });

        let messageSent = false;

        // EĞER ÖNCEDEN ATILMIŞ BİR MESAJ VARSA ONU DÜZENLE
        if (lastMessageId) {
            try {
                const msg = await channel.messages.fetch(lastMessageId);
                await msg.edit({ embeds: [embed] });
                messageSent = true;
                console.log("Mesaj başarıyla düzenlendi.");
            } catch (e) {
                console.log("Eski mesaj bulunamadı veya silinmiş, yeni mesaj atılıyor.");
                lastMessageId = null; 
            }
        }

        // MESAJ YOKSA VEYA SİLİNDİYSE YENİSİNİ AT
        if (!messageSent) {
            const newMsg = await channel.send({ embeds: [embed] });
            lastMessageId = newMsg.id;
            console.log("Yeni mesaj gönderildi.");
        }

        res.status(200).send("İşlem başarılı.");
    } catch (err) {
        console.error("Hata oluştu:", err);
        res.status(500).send("Sunucu hatası.");
    }
});

// Bot Girişi ve Sunucu Başlatma
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
    console.error("HATA: DISCORD_TOKEN bulunamadı!");
} else {
    client.login(TOKEN).then(() => {
        app.listen(PORT, () => {
            console.log(`Bot aktif ve API ${PORT} portunda çalışıyor.`);
        });
    }).catch(err => {
        console.error("Bot giriş yaparken hata oluştu:", err);
    });
}
