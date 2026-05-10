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
    console.log(`🚀 ${commands.length} komut Discord'a yükleniyor...`);

    // Global olarak kaydet (tüm sunucularda çalışır - 1 saat yayılma süresi)
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log(`✅ ${data.length} komut başarıyla yüklendi!`);
    console.log('📌 Not: Global komutların tüm sunucularda görünmesi 1 saat sürebilir.');
    console.log('📌 Hızlı test için: node deploy-commands-guild.js (sadece belirli sunucu için)');

  } catch (error) {
    console.error('❌ Komut yüklenirken hata oluştu:', error);
  }
})();
