const item = require("../Store/item.json");
const chp = require("../rpgStore/inv.json");
const fs = require("fs");
exports.run = (client, message, args) => {
    if(!item[message.author.id]) return message.reply("You dont have anything in ur inventory try buying!")
            let pokeball = item[message.author.id].pokeball;
            let greatball = item[message.author.id].greatball;
            let woods;
            if(!chp[message.author.id]){
                woods = 0
            }else{
                woods = chp[message.author.id].wood;
            }
            let embed = {
                title: message.author.username + "'s inventory",
                description: "Pokeballs: " + pokeball + "<:pb:702261761113587742>" + "\nGreatballs: " + greatball + "<:gb:702262823786643466>" + "\nWoods: " + woods,
                color: 0xfa8072,
                image: {
                    url: "https://cdn.discordapp.com/attachments/614630738142429184/702569344458031174/bag3.PNG.cf31491762da2a02ea2b02f516342111.png"
                }
            }
            message.channel.send({embed:embed})
}