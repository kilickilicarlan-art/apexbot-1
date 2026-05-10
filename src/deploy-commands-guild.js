const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];

// Tüm komutları topla
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      console.log(`✅ Komut yüklendi: ${command.data.name}`);
    } else {
      console.log(`⚠️ [UYARI] ${filePath} komutunda gerekli özellikler eksik.`);
    }
  }
}

// REST API kurulum
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    if (!process.env.GUILD_ID) {
      console.error('❌ GUILD_ID .env dosyasında ayarlanmamış!');
      console.log('   Global komutlar için: node deploy-commands.js');
      return;
    }

    console.log(`🚀 ${commands.length} komut sunucuya yükleniyor...`);
    console.log(`📌 Sunucu ID: ${process.env.GUILD_ID}`);

    // Sadece belirli sunucu için kaydet (anında çalışır - test için ideal)
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );

    console.log(`✅ ${data.length} komut başarıyla sunucuya yüklendi!`);
    console.log('📌 Komutlar hemen kullanılabilir!');

  } catch (error) {
    console.error('❌ Komut yüklenirken hata oluştu:', error);
    if (error.code === 50001) {
      console.log('💡 Çözüm: Botu sunucuya eklerken "application.commands" iznini vermeyi unutmuş olabilirsin.');
    }
  }
})();
