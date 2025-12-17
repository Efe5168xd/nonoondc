const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');
const app = express();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

app.use(express.json());

app.post('/update-leaderboard', async (req, res) => {
    const players = req.body.players;
    const channelId = process.env.CHANNEL_ID; // Render'dan ayarlayacağız

    try {
        const channel = await client.channels.fetch(channelId);
        
        let description = "🏆 **En Çok Oynayan Top 10**\n\n";
        
        players.forEach((p, index) => {
            const d = Math.floor(p.minutes / 1440);
            const h = Math.floor((p.minutes % 1440) / 60);
            const m = p.minutes % 60;
            
            description += `**${index + 1}.** \`${p.name}\` — ${d}g ${h}s ${m}d\n`;
        });

        const embed = new EmbedBuilder()
            .setTitle("🎮 Oyun Liderlik Tablosu")
            .setDescription(description)
            .setColor("#5865F2")
            .setTimestamp()
            .setFooter({ text: "Otomatik Güncelleme" });

        // Önceki mesajları silip yeni mesaj atmak yerine tek bir mesajı düzenlemek daha iyidir
        // Ama şimdilik basit olması için direkt gönderiyoruz:
        await channel.send({ embeds: [embed] });
        
        res.status(200).send("Başarılı!");
    } catch (err) {
        console.error(err);
        res.status(500).send("Hata oluştu.");
    }
});

const PORT = process.env.PORT || 3000;
client.login(process.env.DISCORD_TOKEN).then(() => {
    app.listen(PORT, () => console.log(`Bot ve API ${PORT} portunda hazır!`));
});
