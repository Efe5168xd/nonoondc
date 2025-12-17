const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const app = express();

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] 
});

app.use(express.json());

// Ana sayfa hatasını düzeltmek için (Tarayıcıdan girince bu görünür)
app.get('/', (req, res) => {
    res.send('<h1>Leaderboard Botu Aktif!</h1><p>Roblox verileri başarıyla işleniyor.</p>');
});

app.post('/update-leaderboard', async (req, res) => {
    const players = req.body.players;
    const channelId = process.env.CHANNEL_ID;

    try {
        const channel = await client.channels.fetch(channelId);
        
        // Kanalın son 10 mesajını çekip botun attığı mesajı bulalım
        const messages = await channel.messages.fetch({ limit: 10 });
        const botMessage = messages.find(m => m.author.id === client.user.id);

        let description = "🏆 **TÜM ZAMANLARIN EN İYİLERİ (TOP 10)**\n\n";
        
        if (!players || players.length === 0) {
            description += "🔍 *Henüz kayıtlı oyuncu verisi yok...*";
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
            .setFooter({ text: "Her 30 saniyede bir otomatik güncellenir" });

        if (botMessage) {
            await botMessage.edit({ embeds: [embed] });
            console.log("Mevcut tablo güncellendi.");
        } else {
            await channel.send({ embeds: [embed] });
            console.log("Yeni tablo oluşturuldu.");
        }

        res.status(200).send("OK");
    } catch (err) {
        console.error(err);
        res.status(500).send("Hata");
    }
});

client.login(process.env.DISCORD_TOKEN).then(() => {
    app.listen(process.env.PORT || 3000, () => console.log("Bot Koşuyor..."));
});
