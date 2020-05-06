const chp = require("../rpgStore/inv.json");
const fs = require("fs");
const cooldown = new Set();
const cooldownTime = 60000;

exports.run = (client, message, args) => {
    message.reply("you chopped trees");
    if(!chp[message.author.id]){
        chp[message.author.id]={
            wood: 0
        }
        chp[message.author.id].wood +=100;
        fs.writeFile("./rpgStore/inv.json", JSON.stringify(chp), function (err) {
        if (err) throw err;
        });
    }else{
    chp[message.author.id].wood +=100;
    fs.writeFile("./rpgStore/inv.json", JSON.stringify(chp), function (err) {
        if (err) throw err;
        });
    }
}