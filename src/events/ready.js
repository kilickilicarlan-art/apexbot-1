const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Bot ${client.user.tag} olarak giriş yaptı!`);
    console.log(`📊 ${client.guilds.cache.size} sunucuda aktif`);
    console.log(`👥 ${client.users.cache.size} kullanıcıya erişim`);

    // Durum ayarla
    const activities = [
      { name: `${client.guilds.cache.size} sunucu`, type: ActivityType.Watching },
      { name: `${client.users.cache.size} kullanıcı`, type: ActivityType.Listening },
      { name: '/yardım komutları', type: ActivityType.Playing },
      { name: 'ApexMcBot v1.0', type: ActivityType.Playing }
    ];

    let activityIndex = 0;
    
    // Her 30 saniyede durum değiştir
    setInterval(() => {
      const activity = activities[activityIndex];
      client.user.setActivity(activity.name, { type: activity.type });
      activityIndex = (activityIndex + 1) % activities.length;
    }, 30000);

    // İlk durumu ayarla
    client.user.setActivity(activities[0].name, { type: activities[0].type });
  }
};
