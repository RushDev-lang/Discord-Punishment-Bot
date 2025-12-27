const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const config = require("./config.json");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// load commands
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// interaction handler
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    interaction.reply({ content: "❌ Error", ephemeral: true });
  }
});

// auto cleanup expired warns
setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  let warns = JSON.parse(fs.readFileSync("./warns.json"));

  warns = warns.filter(w => w.expire > now);

  fs.writeFileSync("./warns.json", JSON.stringify(warns, null, 2));
}, 60 * 1000); // هر ۱ دقیقه

client.login(config.token);
