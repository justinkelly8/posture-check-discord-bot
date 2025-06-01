// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  checkPostures();
});

// Log in to Discord with your client's token
client.login(token);

client.on('messageCreate', msg => {
  // TODO below move to separate commands file
  switch (msg.content.toLowerCase()) {
    case "ping":
      msg.reply('Pong!');
      break;
    case "test":
      msg.channel.send('wagwan');
      break;
    case "posturecheck":
      sendPostureImage(msg);
      break;

    // TODO documentation for bot commands
    //const helpEmbed = new Discord.MessageEmbed()
    // .setTitle("Commands Documentation")
    // .setDescription(
    // `TODO /help - provides full list of bot commands\n
    //  /test - bot responds with "Hello" when online\n
    //  /ping - bot responds with "Pong! when online\n"
    // `);
    // 	msg.reply({ embeds: [helpEmbed] });
  }
});

function sendPostureImage(msg) {
  imagePath = `.\\media\\posturecheck.jpg`;

  if (Math.round(Math.random()) % 2 === 0) {
    imagePath = `.\\media\\posturecheck.jpg`;
  } else {
    imagePath = `.\\media\\posture-check-golf.jpg`;
  }
  
  msg.channel.send({ files: [{ attachment: imagePath }] });
}


var lastCheck = null;
async function checkPostures() {
  client.guilds.cache.forEach(async (guild) => {
    const voiceChannels = guild.channels.cache.filter(
      (c) => c.type === "voice"
    );

    for await (var vc of voiceChannels) {
      console.log(vc);
      vc = vc[1];
      console.log(vc.name, vc.speakable, vc.members.size);
      if (vc.members.size > 0) {
        const pc = await checkPosture(vc);
        console.log("Successfully posture checked the channel: " + pc.name);
      }
    }

    console.log("The posture check is now finished!");
    lastCheck = new Date();
  });

  setTimeout(checkPostures, 1000 * 60 * 30);
}

async function checkPosture(voiceChannel) {
  return new Promise((resolve, reject) => {
    voiceChannel
      .join()
      .then((connection) => {
        const dispatcher = connection.play("posturecheck.mp3", {
          volume: 1.0,
        });
        dispatcher.on("finish", (end) => {
          dispatcher.destroy();
          voiceChannel.leave();
          setTimeout(() => {
            resolve(voiceChannel);
          }, 1000);
        });
      })
      .catch((err) => {
        console.log(
          "An error occured while trying to connect to the voice channel."
        );
        console.log(err);
        resolve(voiceChannel);
      });
  });
}