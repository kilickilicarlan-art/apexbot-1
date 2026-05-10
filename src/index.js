const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
require('dotenv').config();

// Database ve API Server
const Database = require('./utils/database');
const APIServer = require('./utils/api');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.GuildMember,
    Partials.User
  ]
});

client.commands = new Collection();
client.cooldowns = new Collection();

// Basit Çekiliş Yöneticisi
client.giveaways = new Collection();

// Handler'ları yükle
require('./handlers/commandHandler')(client);
require('./handlers/eventHandler')(client);

// Hata yakalama
process.on('unhandledRejection', error => {
  console.error('Beklenmeyen hata:', error);
});

process.on('uncaughtException', error => {
  console.error('Yakalanamayan hata:', error);
});

// Bot hazır olduğunda API server'ı başlat
client.once('ready', () => {
  // Minecraft Link API Server'ı başlat
  const apiServer = new APIServer(client);
  apiServer.start();
  
  console.log('🔗 Minecraft hesap bağlama sistemi aktif!');
});

client.login(process.env.BOT_TOKEN);
