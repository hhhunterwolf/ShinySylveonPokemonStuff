const Discord = require('discord.js');
const client = new Discord.Client();
//Cooldown
const cooldown = new Set();
const catchingtr = new Set();
const cooldownTime = 60000;
var fs = require("fs");

const Enmap = require("enmap");
var fixedWidthString = require("fixed-width-string");
var dateFormat = require('dateformat');
var schedule = require('node-schedule');
const keep_alive = require('./keep_alive.js');
const getPokemon = require("./pokemon.js")
let db = JSON.parse(fs.readFileSync("./database.json", "utf8"));
const pConfig = require("./pokemon_config.json");
opx = require('oakdex-pokedex');
const dex = require("./dex.json");
const dexlegs = require("./dexlegs.json")
const pdex = require("./pdex.json");
const mons = require("./Store/mons.json");
const party = require("./Store/party.json");
const trainers = require("./Store/trainers.json");
const market = require("./Store/market.json");
const marketadd = require("./Store/marketadd.json");
var currentMon = null;
var spawns = require("./Store/spawns.json");
const eco = require("./Store/money.json");
gender = require("./Data/gender.json");
user = require("./Store/xp.json");
select = require("./Store/selected.json");
item = require("./Store/item.json");
todo = require("./Store/todo.json");
var spawnsEnabled;
checkHour();



//Pokemon
client.on('message', message => {
    if (message.author.bot) return;
    if (message.channel.id === "603897806075461642") return;
    
    if (message.content.indexOf(pConfig.prefix) === 0) {
        const args = message.content.slice(pConfig.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        
    if(command === "ping"){
            var ping = Date.now() - message.createdTimestamp + " ms";
    message.channel.sendMessage("Your ping is `" + `${Date.now() - message.createdTimestamp}` + " ms`");

        }
        //dev commands only
        if (command === "spawn") {
             spawnnMon(message);
             
           }
        if(command === "s"){
            spawnnMon(message)
        }
        else if(command === "sp"){
            if(!message.author.id === `576145034110435340`) return;
            message.delete(1);
            perfectspawnMon(message);
        }
        if(command === "cs"){
            if(!message.author.id === `576145034110435340`) return;
            message.delete(1)
            customspawnMon(message);
        }
        if(command === "qu"){
            if(!message.author.id === `656491651044343839`) return;
            message.delete(1)
            customspawnMon(message);
        }
        if(command === "give"){
        if(!trainers[message.author.id]) return message.reply("You dont have any Pokemons to give!");
        let trindex = args[1] -1;
        let mng = trainers[message.author.id].mons;
        let trid = mng[trindex];
        let user = message.mentions.users.first();
        let mnog = trainers[user.id].mons;
        if(!user) return message.reply("To whom are you giving?");
        mng.splice(trindex, 1);
        mnog.push(trid);
        message.channel.send(`Giver: ${message.author.username}\nTaker: ${user.username}\nPokemon Id: ${trid}`)
    }

        else if (command === "despawn") {
            despawnMon();
        }
        if (command === "gcatch"){
			let saidnm = args[0];
            if(!saidnm)return message.reply("Say the name");
            if(!currentMon)return;
            names = saidnm.toLowerCase()
            if(names === currentMon.name){
            attemptGreatCatch(message, currentMon)
            }else{
                message.reply("Wrong!")
            }
		}
		if(command === "gc"){
		    let saidnm = args[0];
            if(!saidnm)return message.reply("Say the name");
            if(!currentMon)return
            names = saidnm.toLowerCase()
            if(names === currentMon.name){
            attemptGreatCatch(message, currentMon)
            }else{
                message.reply("Wrong!")
            }
		}
        if (command === "catch"){
        let saidnm = args[0];
            if(!saidnm)return message.reply("Say the name");
            if(!currentMon)return;
            names = saidnm.toLowerCase()
            if(names === currentMon.name){
            attemptCatch(message, currentMon)
            }else{
                message.reply("Wrong!");
            }
        }
        if(command === "c"){
            let saidnm = args[0];
            if(!saidnm)return message.reply("Say the name");
            if(!currentMon)return;
            names = saidnm.toLowerCase()
            if(names === currentMon.name){
            attemptCatch(message, currentMon)
            }else{
                message.reply("Wrong!")
            }
        }
        else if(command === "select"){
        let inp = args[0] - 1;
        let mon = trainers[message.author.id].mons;
        let scled = mon[inp];
        if(!mon[inp]) return message.reply("You dont have a Pokemon of that id");
             select [message.author.id] = {
                 selected: scled,
                 id: inp
             }
         user [message.author.id] = {
                xp: 0,
                level: 0
            }
            
        fs.writeFile("./Store/xp.json", JSON.stringify(user), function (err) {
        if (err) throw err;
        });
         fs.writeFile("./Store/selected.json", JSON.stringify(select), function (err) {
        if (err) throw err;
    });
        let foundname = mons[scled].name;
        let name = pdex[foundname].species;
        let level = mons[scled].level;
        message.channel.send(`${message.author.username}, you selected your level ${level} ${name}!`)
                        
        }
        else if(command === "todo-add"){
             id =  message.content.slice(11);
             
             todo [message.author.id] = {
                 item: id
             }
         fs.writeFile("./Store/todo.json", JSON.stringify(todo), function (err) {
        if (err) throw err;
        message.delete(10);
        });
        message.channel.send("Added")            
        }
        else if(command === "todo"){
            if(!todo[message.author.id]){
                message.channel.send("You didnt say me what u had to do");
            } else {
                message.reply("You had to " + todo[message.author.id].item);
            }
        }
        else if(command === "party"){
            let fil = args[0];
            if(!party[message.author.id]){
            party[message.author.id] = {
                                party1: "",
                                party2: "",
                                party3: "",
                                party4: "",
                                party5: "",
                                party6: ""
                            }
                            fs.writeFile("./Store/party.json", JSON.stringify(party), function (err) {
                             if (err) throw err;
                            })
                            message.channel.send("Made your Party Slots do that again!")
            }else{
            if(!fil){
                let desc = "Party slots\n";
                let slotno = party[message.author.id];
                if(!party[message.author.id].party1){
                    desc += "Slot 1 - Not Selected\n";
                }else{
                    let nrname = mons[slotno.party1].name;
                    let name = pdex[nrname].species;
                    desc += `Slot 1 - ${name}\n`
                }
                if(!party[message.author.id].party2){
                    desc += "Slot 2 - Not Selected\n";
                }else{
                    let nrname = mons[slotno.party2].name;
                    let name = pdex[nrname].species;
                    desc += `Slot 2 - ${name}\n`
                }
                if(!party[message.author.id].party3){
                    desc += "Slot 3 - Not Selected\n";
                }else{
                    let nrname = mons[slotno.party3].name;
                    let name = pdex[nrname].species;
                    desc += `Slot 3 - ${name}\n`
                }
                if(!party[message.author.id].party4){
                    desc += "Slot 4 - Not Selected\n";
                }else{
                    let nrname = mons[slotno.party4].name;
                    let name = pdex[nrname].species;
                    desc += `Slot 4 - ${name}\n`
                }
                if(!party[message.author.id].party5){
                    desc += "Slot 5 - Not Selected\n";
                }else{
                    let nrname = mons[slotno.party5].name;
                    let name = pdex[nrname].species;
                    desc += `Slot 5 - ${name}\n`
                }
                if(!party[message.author.id].party6){
                    desc += "Slot 6 - Not Selected\n";
                }else{
                    let nrname = mons[slotno.party6].name;
                    let name = pdex[nrname].species;
                    desc += `Slot 6 - ${name}\n`
                }
                let embed = {
                    title: `${message.author.username}'s Party!`,
                    description: desc
                }
                message.channel.send({embed:embed})
            }else{
                let chs = args[0];
                let pkidf = args[1];
                let pkid = pkidf - 1;
                let slt = args[2];
                if(chs === "add"){
                    if(!pkidf){
                        message.reply("Give an id of the pokemon and the slot you want to add it in as well");
                    }else if(!slt){
                        message.reply("Give a slot number!");
                    }else{
                        let mon = trainers[message.author.id].mons;
                        let monid = mon[pkid];
                        if(slt === "1"){
                            party[message.author.id].party1 = monid;
                            message.channel.send(`Selected ${mons[monid].name} at slot ${slt}`)
                            updatePoke();
                        }else if(slt === "2"){
                            party[message.author.id].party2 = monid;
                            message.channel.send(`Selected ${mons[monid].name} at slot ${slt}`)
                            updatePoke();
                        }else if(slt === "3"){
                            party[message.author.id].party3 = monid;
                            message.channel.send(`Selected ${mons[monid].name} at slot ${slt}`)
                            updatePoke();
                        }else if(slt === "4"){
                            party[message.author.id].party4 = monid;
                            message.channel.send(`Selected ${mons[monid].name} at slot ${slt}`)
                            updatePoke();
                        }else if(slt === "5"){
                            party[message.author.id].party5 = monid;
                            message.channel.send(`Selected ${mons[monid].name} at slot ${slt}`)
                            updatePoke();
                        }else if(slt === "6"){
                            party[message.author.id].party6 = monid;
                            message.channel.send(`Selected ${mons[monid].name} at slot ${slt}`)
                            updatePoke();
                        }else{
                        message.channel.send("Only 6 slot available!")
                    }
                }
            }
        }
        }
        }
        else if(command === "info"){
               if (trainers[message.author.id]){
                if (!select[message.author.id])return message.channel.send("Select something from pc first!");
                let ars = args[0];
                let inp = ars - 1;
                let given;
                if(!ars){
                     given = select[message.author.id].selected;
                }else{
                mng = trainers[message.author.id].mons
                givenid = mng[inp];
                 given = givenid;
                }
                let footid;
                if(!ars){
                    foot = select[message.author.id].id + 1;
                    footid = "Selected Pokemon: " +  foot
                }else{
                    foot = ars;
                    footid = "Showing Pokemon: " +  foot
                }
                if (given) {
                    var found = false;
                    var correctID;
                    
                    if(!isNaN(parseInt(given))){
                        trainers[message.author.id].mons.forEach(function (mon, index){
                            if (mon == parseInt(given)){
                                found = true;
                                correctID = parseInt(given);
                                return;
                            }
                        });
                    }
                    
                    
                    if (!found){    //check if a nickname was given
                        trainers[message.author.id].mons.forEach(function (mon, index){
                            monData = mons[mon];
                            if (monData.nickname === given){
                                found = true;
                                correctID = mon;
                                return;
                            }
                        });
                    }

                    if (found){
                        const found = mons[correctID];
                    
                        var preferredName;
                        if (found.nickname.length > 0) preferredName = found.nickname;
                        else {
                           if (!found.shiny) preferredName = found.name;
                           else preferredName = "Shiny "+found.name;
                        }
                        if (!found.shiny) imgUrl = "https://www.poke-verse.com/sprites/xyani/"+found.name+".gif"; else imgUrl = "https://www.poke-verse.com/sprites/xyani-shiny/"+found.name+".gif";
                        let lvlxp = found.level;
                        let math2 = Math.floor(5 * (lvlxp * lvlxp * lvlxp)/4);
                        let math1 = Math.floor(5 * ((lvlxp + 1) * (lvlxp + 1) * (lvlxp + 1))/4);
                        let math = Math.floor(math1 - math2);
                        let ball;
                        if(!found.balls){
                            ball = "<:pb:702261761113587742>"
                        }else{
                            ball = found.balls
                        }
                        let genicon;
                        if(found.gender === "female"){
                            genicon = "<:female:703360010545004675>"
                        }else if(found.gender === "male"){
                            genicon = "<:male:703360065968537660>"
                        }else{
                            genicon = "<:unknown:703616344288919676>"
                        }
                        let exphv;
                        if(!ars){
                        exphv = user[message.author.id].xp  + "/" + math;
                        }else{
                            exphv = "Select To gain xp"
                        }
                        
                        let dexId = pdex[found.name].num;
                        let dexname = pdex[found.name].species;
                        var desc;
                        if (!found.shiny) desc = `**${dexname} ${genicon} ${ball} #${dexId} - ${correctID}**`;
                        else desc = `<a:shiny:703757184567345223>**Shiny ${dexname} ${genicon} ${ball} #${dexId} - ${correctID}**`;
                        let B = pdex[found.name].baseStats.atk;
                        let I = found.atkiv;
                        let L = found.level;
                        let expatk = Math.floor((2 * B + I) * L / 100 + 5);
                        let Bh = pdex[found.name].baseStats.hp;
                        let Ih = found.hpiv;
                        let Lh = found.level;
                        let exphp = Math.floor(((2 * Bh + Ih) * Lh / 100) + 10);
                        let Bdf = pdex[found.name].baseStats.def;
                        let Idf = found.defiv;
                        let Ldf = found.level;
                        let expdef = Math.floor((2 * Bdf + Idf) * Ldf / 100 + 5);
                        let Bspa = pdex[found.name].baseStats.spa;
                        let Ispa = found.spatkiv;
                        let Lspa = found.level;
                        let expspatk = Math.floor((2 * Bspa + Ispa) * Lspa / 100 + 5);
                        let Bspd = pdex[found.name].baseStats.spd;
                        let Ispd = found.spdefiv;
                        let Lspd = found.level;
                        let expspdef = Math.floor((2 * Bspd + Ispd) * Lspd / 100 + 5);
                        let Bspe = pdex[found.name].baseStats.spe;
                        let Ispe = found.speediv;
                        let Lspe = found.level;
                        let expspe = Math.floor((2 * Bspe + Ispe) * Lspe / 100 + 5);
                        let tladd = Math.floor(found.hpiv + found.atkiv + found.defiv + found.spatkiv + found.spdefiv + found.speediv);
                        let totalIv = Math.round((tladd / 186) * 100).toFixed(2);
                        var baseExp = `**Hp: ${exphp} - ${found.hpiv}/31\nAttack: ${expatk} - ${found.atkiv}/31\nDefence: ${expdef} - ${found.defiv}/31\nSp.Attack: ${expspatk} - ${found.spatkiv}/31\nSp.Def: ${expspdef} - ${found.spdefiv}/31\nSpeed: ${expspe} - ${found.speediv}/31\nTotal IV%: ${totalIv}%**`
                        let types = pdex[found.name].types;
                        let levels = found.level;
                        
                        const embed = {
                            "title": preferredName,
                            "description": desc,
                            "color": 0xfa8072,
                        	"fields": [
                        	    {
                        	      name: "Type",
                        	      value: types
                        	    },
                        	    {
                        	        name: "Level",
                        	        value: levels,
                                    inline: true
                        	    },
                        	    {
                        	        name: "Exp",
                        	        value: exphv,
                                    inline: true
                        	    },
                        	    {
                        	        name: "Stats",
                        	        value: baseExp
                        	    }
                        	],
                            "image": {
                              "url": imgUrl
                            },
                            "footer": {
                                "text": footid + "/" + trainers[message.author.id].mons.length + " - Caught at " + found.catchTime
                            }        
                        };
                    
                        message.channel.send({ embed });
                         
                }  
            
            }
        }
        }
        else if (command === "mon") {
            if(!currentMon){
                message.channel.send("There arent any spawns!");
            } else {
                 const embed = {
                 "title": `${currentMon.name} (Lv. ${currentMon.level})`,
                "description": desc,
                "color": 0xfa8072,
    
                "image": {
                    "url": currentMon.imgUrl
                }
                };
             message.channel.send({embed:embed});
             message.channel.send(`Type \`${pConfig.prefix}catch\` to attempt to catch it!\n*(Pokéball catch Chance: ${(currentMon.catchChance*100).toFixed(2)}%)*\n*(Greatball catch Chance: ${(currentMon.catchGreatChance*100).toFixed(2)}%)*`);
           
            }
        }
        else if (command === "nickname"){
            if (trainers[message.author.id]){
                let inp = args[0] - 1;
                mng = trainers[message.author.id].mons
                givenid = mng[inp];
                given = givenid;
                if (given){
                    var found = false;
                    if (!isNaN(parseInt(given))){
                        trainers[message.author.id].mons.forEach(function (mon, index){
                            if (mon == parseInt(given)){
                                found = true;
                                return;
                            }
                        });
                    }
                    
                    if (found){
                        var correctID = parseInt(given);
                        args.shift();
                        const restOf = args.join(" ");
                        if (restOf){
                            mons[correctID].nickname = restOf;
                            updatePoke();
                            message.reply(`${mons[correctID].name}'s new nickname is "${mons[correctID].nickname}"`);
                        }else{
                            message.reply("please include the nickname you'd like to set. For example `"+pConfig.prefix+" nickname "+correctID+" Bobby`");
                        }
                    }else{
                        message.reply("you do not have a Pokémon with the ID `"+args[0]+"`");
                    }
                }
                else message.reply("please include the id of the Pokémon you'd like to nickname. For example `"+pConfig.prefix+" nickname "+trainers[message.author.id].mons[0]+" Bobby`");
            }
            else message.reply("you have not caught any Pokémon.");
        }
    }
});
//Evolution
client.on("message", message => {
    if (message.author.bot) return; // ignore bots
    // if the user is not on db add the user and change his values to 0
    if (!db[message.author.id]) db[message.author.id] = {
        xp: 0,
        level: 0,
        message: 0,
      };
      
    fs.writeFile("./database.json", JSON.stringify(db), (x) => {
        if (x) console.error(x)
      });
    db[message.author.id].message++;
    let xpg = getRandomInt(10, 20)
    db[message.author.id].xp += xpg;
    let userInfo = db[message.author.id];
    
    if(!select[message.author.id]) return;

    let id = select[message.author.id].selected;
        let correctIDxp = parseInt(id);
        if(!mons[correctIDxp]) return;
        let ev = mons[correctIDxp];
        let name = ev.name;
        let lvlxp = ev.level;
        let math2 = Math.floor(5 * (lvlxp * lvlxp * lvlxp)/4);
        let math1 = Math.floor(5 * ((lvlxp + 1) * (lvlxp + 1) * (lvlxp + 1))/4);
        let math = Math.floor(math1 - math2)
        if(!pdex[name].evos) return;
        let evoname = pdex[name].evos;
        if(!pdex[evoname].evoLevel) return;
        let evolvl = pdex[evoname].evoLevel;
        let mon = pdex[name].name;
        let h = (lvlxp + 1);
        let l = lvlxp;
        
        if(lvlxp > evolvl - 1){
        if (trainers[message.author.id]){
            if(!select[message.author.id]) return;
            if(!mons) return;
                const given = select[message.author.id].selected;
                if (given) {
                    var found = false;
                    var correctID;
                    
                    if(!isNaN(parseInt(given))){
                        trainers[message.author.id].mons.forEach(function (mon, index){
                            if (mon == parseInt(given)){
                                found = true;
                                correctID = parseInt(given);
                                return;
                            }
                        });
                    }
        if (found){
        const found = mons[correctID];
        if(found.level > 99) return;
        let prievo = pdex[found.name].prevo;
        let evolved = pdex[found.name].evos;
        ev.name = evolved;
        ev.name = evolved;
        let embed = {
            title: "Evolution",
            description: `${message.author.username} your Pokemon evolved!`,
            color: 0xfa8072,
            fields:[
                {
                    name: "Name:",
                    value: found.name
                }
                ]
        }
        message.channel.send({embed : embed});
        updatePoke();
        updatePoke();
    
    }
                }}}
    const args = message.content.slice(pConfig.prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    fs.writeFile("./database.json", JSON.stringify(db), (x) => {
        if (x) console.error(x)
      });
});
//Pc
client.on('message', message => {
    if (message.author.bot) return;
    if (message.channel.id === "603897806075461642") return;
    
    if (message.content.indexOf(pConfig.prefix) === 0) {
        const args = message.content.slice(pConfig.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        if(!trainers[message.author.id]) return;
        let ids = trainers[message.author.id].mons;
        if (command === "pc"){
            
            var pageNum = 1;
            if(!isNaN(parseInt(args[0]))){
                pageNum = parseInt(args[0]);
            }
            
            var textToSend;
            if (trainers[message.author.id]){
                var speciesFound = [];
                trainers[message.author.id].mons.forEach(function (mon, item){
                    if (!speciesFound.includes(mons[mon].id)){
                        speciesFound.push(mons[mon].id);
                    }
                });

                var pageCount = Math.ceil((trainers[message.author.id].mons.length/10));
                var grm;
                if(speciesFound.length < 2){
                    grm = "Pokemon"
                }else{
                    grm = "Pokemons"
                }
                textToSend = `**Your Pokédex <:dex:703774823536656474>**\n${speciesFound.length} ${grm} caught\n**Your Pc**\n`;
                
                trainers[message.author.id].mons.forEach(function (mid, index){
                    if (index+1 > 10*pageNum) return;

                    if (index >= 10*(pageNum-1)){
                        mon = mons[mid];
                        let number = index + 1;
                        var showName;
                        let sname = pdex[mon.name].species;
                        if (!mon.shiny) showName = number + " - " + sname;
                        else showName = number + " - " + sname + " <a:shiny:703757184567345223>";
                    let genicon;
                    if(mon.gender === "female"){
                        genicon = " <:female:703360010545004675> ";
                    }else if(mon.gender === "male"){
                        genicon = " <:male:703360065968537660> ";
                    }else{
                        genicon = " <:unknown:703616344288919676> ";
                    }
                        var description;
                        if (mon.nickname.length > 0) description = "**"+showName+genicon+"** (Lv. "+mon.level+")"+" - **"+mon.nickname+"**";
                        else description = "**"+showName+genicon+"** (Lv. "+mon.level+")";
                        textToSend+="\n" + description;
                    }
                });

                textToSend += `\n\nPage ${pageNum}/${pageCount}`;
                if (pageCount > pageNum) textToSend += " - to view the next page type `s!pc "+(pageNum+1)+"` or to select a Pokemon type `s!select <seriel number>`";
            }
            else{ 
                textToSend = "You have not caught any Pokémon.";
            }

            let embed ={
                title: message.author.username,
                description: textToSend,
                color: 0xfa8072
            }
            message.channel.send('Loading pc....<a:mew_cartwheels:592741558491807744>')
            .then((message)=> {
            setTimeout(function(){
            message.delete(1) && message.channel.send({embed:embed});
            }, 1000)
            });
        }
        if (command === "shiny"){
            var pageNum = 1;
            
            if(!isNaN(parseInt(args[0]))){
                pageNum = parseInt(args[0]);
            }
            
            var textToSend;

            if (trainers[message.author.id]){
                var speciesFound = [];
                trainers[message.author.id].mons.forEach(Mon)
                    function Mon(item){
                    if (!speciesFound.includes(mons[item])){
                    speciesFound.push(mons[item]);
                    }
                    let shiny = mons[item].shiny
                
                    };
                var pageCount = Math.ceil((trainers[message.author.id].mons.length/10));
                    
                textToSend = `**Your Shiny Pc**`;
                
                trainers[message.author.id].mons.forEach(function (mid, index){
                    let shiny = mons[mid].shiny;
                    if (shiny+1 > 10*pageNum) return;  
                    if (shiny >= 10*(pageNum-1)){
                        mon = mons[mid];
                        monname = mon.name;
                        var showName;
                        if (!mon.shiny) return; 
                        else showName = "Shiny "+pdex[monname].species;

                        var description;
                        if (mon.nickname.length > 0) description = "**"+mon.nickname+"** - "+showName+" (Lv. "+mon.level+")";
                        else description = "**"+showName+"** (Lv. "+mon.level+")";
                        textToSend+="\n"+fixedWidthString("`"+mid+"`", 12)+description;
                    }
                });

            }
            else textToSend = "You have not caught any Pokémon.";

            message.channel.send(textToSend);
        }
    }
});
//Economy
client.on('message', message => {
    if (message.author.bot) return;
    
    if (message.channel.id === "603897806075461642") return;
    if (message.content.indexOf(pConfig.prefix) === 0) {
        const args = message.content.slice(pConfig.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        
            if(!eco[message.author.id]){
            eco [message.author.id] = {
                money: 0,
                bank: 0
            }
            
        fs.writeFile("./Store/money.json", JSON.stringify(eco), function (err) {
        if (err) throw err;
        });}

   if (command ==="bal") {  
       if(!eco[message.author.id]){
            eco [message.author.id] = {
                money: 0,
                bank: 0
            }
            
        fs.writeFile("./Store/money.json", JSON.stringify(eco), function (err) {
        if (err) throw err;
        });}
       let total = eco[message.author.id].money + eco[message.author.id].bank;
       message.channel.send({embed :{
           title: "Wallet",
           color: 0xfa8072,
           fields:[
               {
               name: "Wallet Holder",
               value: message.author.username
               
           },
           {
               name: "Balance:",
               value: eco[message.author.id].money + "<:sylveoncoin:699574208476479519> " 
               
           },
           {
               name: "Bank Balance:",
               value: eco[message.author.id].bank + "<:sylveoncoin:699574208476479519> " 
           },
           {
               name: "Net Worth:",
               value: total + "<:sylveoncoin:699574208476479519> "
           }
           ]
       }});
   }
   if(command === "pay"){
       let taker = message.mentions.users.first().id
       let giver = message.author.id
       let inp = args[1];
       let amount = parseInt(inp);
       if(eco[giver].money < amount) return message.channel.send(`You dont have ${amount}`)
       let take = Math.floor(eco[taker].money + amount);
       let give = Math.floor(eco[giver].money - amount);
       
       eco[taker].money = take;
       eco[giver].money = give;
       message.channel.send(`Giver id: ${giver}\nTaker id: ${taker}\nAmount: ${amount}<:sylveoncoin:699574208476479519>`)
   }
   if (command ==="dep") {
       let wallet = eco[message.author.id].money;
       let bank = eco[message.author.id].bank;
       let amnt = args[0]
       if(!args[0]) amnt = wallet;
       let amt = parseInt(amnt);
       if(wallet < amt)return message.reply(`You dont have ${amt} <:sylveoncoin:699574208476479519> in your wallet, you have ${wallet}  <:sylveoncoin:699574208476479519>`)
       let leftmoney =  Math.floor(wallet - amt)
       eco[message.author.id].bank += amt;
       eco[message.author.id].money = leftmoney;
       message.channel.send(`You deposited ${amt}<:sylveoncoin:699574208476479519> to your bank`);
       
    }
   if(command ==="withdraw") {
       let wallet = eco[message.author.id].money;
       let bank = eco[message.author.id].bank;
       let amnt = args[0]
       if(!args[0]) amnt = bank;
       let amt = parseInt(amnt);
       if(bank < amt)return message.reply(`You dont have ${amt} <:sylveoncoin:699574208476479519> in your bank, you have ${bank} <:sylveoncoin:699574208476479519>`);
       let leftmoney =  Math.floor(bank - amt)
       
       eco[message.author.id].money += amt;
       eco[message.author.id].bank = leftmoney;
       message.channel.send(`You withdrew ${amt}<:sylveoncoin:699574208476479519> from your bank`);
   }
   if (command === "work"){
            if(cooldown.has(message.author.id)){
           message.reply("You cant work right now trying again later!");
       } else {
       let money = getRandomInt(100, 500);
       var work = [
           'You helped Sylveon start her berry shop, she gave you',
           'You stopped a thief from stealing psyducks purse, psyduck gave u',
           'An old Pachirisu asked you to help her reach the high shelves at the market. She gave you',
           'You helped Greninja for his big battle! He gave you ',
           'You’ve traveled a long time and helped Togepi evolve to Togetic! She gives you ',
           'You happen to find an Eevee trying to evolve. You help it become a Sylveon! It gives you ',
           'You encountered a Skitty stuck in a tree and helped it get down. Its owner gave you ',
           'You grabbed a small Dedennes balloon before it got away. Her parents gave you ',
           'You stop a wild Spearow from attacking a Ratatta! The Ratatta has given you ',
           'You helped Detective Pikachu figure out the case of the missing Aipoms. They were simply in storage eating banana-berries. Detective Pikachu gave you '
           ]
        var randomWork = work[Math.floor(Math.random() * work.length)]

       eco[message.author.id].money +=money;
       message.channel.send({embed:{
           color: 0xfa8072,
           fields: [{
               name: "Work",
               value: randomWork +" "+ money + "<:sylveoncoin:699574208476479519> " 
           }]
       }});
       cooldown.add(message.author.id);
       setTimeout(() =>{
          cooldown.delete(message.author.id); 
       }, cooldownTime);
        }
        }
    }
});
//Items
client.on('message', message => {
    if (message.author.bot) return;
    if (message.channel.id === "603897806075461642") return;
    
    if (message.content.indexOf(pConfig.prefix) === 0) {
        const args = message.content.slice(pConfig.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
   
    if(command === "mart"){
        let embed = {
            title: "PokeMart",
            description: "Welcome to the PokeMart, How may i help you?",
            color: 0xfa8072,
            fields:[
                {
                    name: "Pokeball <:pb:702261761113587742>",
                    value: "Price: 200 <:sylveoncoin:699574208476479519>\nTo Buy: `s!buy pb <amount>`"
                },
                {
                    name: "Greatball <:gb:702262823786643466>",
                    value: "Price: 600 <:sylveoncoin:699574208476479519>\nTo Buy: `s!buy gb <amount>`"
                }
                ],
                image:{
                    url: "https://cdn.discordapp.com/attachments/614630738142429184/702476789766946916/Pokemart_Exterior.png"
                }
        }
        
        message.channel.send({embed:embed})
    }    
    if(command === "buy"){
                     if (!item[message.author.id]){
                    item [message.author.id] = {
                        pokeball: 20,
                        greatball: 0
                    }
                    fs.writeFile("./Store/item.json", JSON.stringify(item), function (err) {
                    if (err) throw err;
                     });
                     }
            let inp = args[0]
            if(!inp) return message.channel.send("What do you want to buy? pb - pokeball or gb- greatball")
            let amnt = args[1]
            let amt = parseInt(amnt)
            if(inp === `pb`){
            if(!amt) return message.channel.send("How many do u want to buy tho? use the command as s!buy pb 10");
            
            if(!eco[message.author.id]) return message.channel.send("You dont have any coin!");
            let mnus = Math.floor(amt * 200);
            if(eco[message.author.id].money < mnus) return message.channel.send("You dont have enough coin!");
            eco[message.author.id].money -= mnus;
            updatePoke();
            let pbam = item[message.author.id].pokeball;
            let gbam = item[message.author.id].greatball;
            
            let amntpb = Math.floor(pbam + amt)
                item [message.author.id] = {
                        pokeball: amntpb,
                        greatball: gbam
                    }
                    
                    fs.writeFile("./Store/item.json", JSON.stringify(item), function (err) {
                    if (err) throw err;
                     });
            message.channel.send(`Now you have ${amntpb}`)
            }
            if(!inp) return message.channel.send("What do you want to buy? pb - pokeball or gb- greatball")
            else if(inp === `gb`){
            if(!amt) return message.channel.send("How many do u want to buy tho? use the command as s!buy gb 10");
            if(!eco[message.author.id]) return message.channel.send("You dont have any money!");
            let mnus = Math.floor(amt * 600);
            if(eco[message.author.id].money < mnus) return message.channel.send("You dont have enough coin!");
            eco[message.author.id].money -= mnus;
            updatePoke();
            
                let pbam = item[message.author.id].pokeball;
                let gbam = item[message.author.id].greatball;
                let amntgb = Math.floor(gbam + amt)
                item [message.author.id] = {
                        pokeball: pbam,
                        greatball: amntgb
                    }
                    
                    fs.writeFile("./Store/item.json", JSON.stringify(item), function (err) {
                    if (err) throw err;
                     });
                message.channel.send(`Now you have ${amntgb}`);
            }
        }
    if(command === "cost"){
            if(!args[0])return message.channel.send("Cost of what?");
            if (!args[1])return message.channel.send("Cost of how many?")
            if(isNaN(args[1]))return message.channel.send("That aint a number")
            let inp = args[0];
            let amount = args[1];
            if(inp === "pb"){
                let math = Math.floor(amount * 200);
                message.channel.send(`It will take ${math} <:sylveoncoin:699574208476479519> for ${amount} Pokeballs`);
            }
            if(inp === "gb"){
                let math = Math.floor(amount * 600);
                message.channel.send(`It will take ${math} <:sylveoncoin:699574208476479519> for ${amount} Greatballs`)
            }
        }
    }		
});
//Level Up
client.on('message', message=> {
    if(message.author.bot) return;
    
    if(!trainers[message.author.id]) return;
    if(!user[message.author.id]){
            user [message.author.id] = {
                xp: 0,
                level: 0
            }
            
        fs.writeFile("./Store/xp.json", JSON.stringify(user), function (err) {
        if (err) throw err;
        });
        }
    if(!select[message.author.id]) return;
        let xpadd = getRandomInt(10, 20);
        user[message.author.id].xp += xpadd;
        updatePoke();
        //Select Mon
        const given = select[message.author.id].selected;
                if (given) {
                    var found = false;
                    var correctID;
                    
                    if(!isNaN(parseInt(given))){
                        trainers[message.author.id].mons.forEach(function (mon, index){
                            if (mon == parseInt(given)){
                                found = true;
                                correctID = parseInt(given);
                                return;
                            }
                        });
                    }
                    
                    
                    if (!found){    //check if a nickname was given
                        trainers[message.author.id].mons.forEach(function (mon, index){
                            monData = mons[mon];
                            if (monData.nickname === given){
                                found = true;
                                correctID = mon;
                                return;
                            }
                        });
                    }
        if(!mons[correctID]) return;
        let ev = mons[correctID];
        let name = ev.name;
        let lvlxp = ev.level;
        let math2 = Math.floor(5 * (lvlxp * lvlxp * lvlxp)/4);
        let math1 = Math.floor(5 * ((lvlxp + 1) * (lvlxp + 1) * (lvlxp + 1))/4);
        let math = Math.floor(math1 - math2)
        let math2min = Math.floor(5 * ((lvlxp - 1) * (lvlxp - 1) * (lvlxp - 1))/4);
        let math1min = Math.floor(5 * ((lvlxp) * (lvlxp) * (lvlxp))/4);
        let mathmin = Math.floor(math1min - math2min)
        
    if (message.content.indexOf(pConfig.prefix) === 0) {
        const args = message.content.slice(pConfig.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        if(!trainers[message.author.id]) return;
        
        if(user[message.author.id].xp > math){
            ev.level++;
            let dpname;
            if(ev.nickname.length > 0){
                dpname = ev.nickname;
            }else{
                dpname = pdex[name].species;
            }
            let embed = {
            title: "Level Up",
            description: `${message.author.username} your Pokemon leveled up!`,
            color: 0xfa8072,
            fields:[
                {
                    name: "Pokemon:",
                    value: dpname + " leveled to " + ev.level
                }
                ]
        }
        
            let xpafter = Math.floor(user[message.author.id].xp - mathmin);
            user[message.author.id].xp = xpafter
            updatePoke();
        if (message.channel.id === "603897806075461642")return;
        message.channel.send({embed : embed});
        }
        
        if(command === "xp"){
            let xpshow = user[message.author.id].xp;
            message.channel.send(xpshow);
        }
    } 
}});
//Market
client.on('message', message=>{
    if (message.channel.id === "603897806075461642") return;
    
    if (message.content.indexOf(pConfig.prefix) === 0) {
    const args = message.content.slice(pConfig.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if(command === "market"){
        let fil = args[0];
        if(!trainers[message.author.id]) return message.channel.send("Catch a Pokemon first to openup your account!");
        if(fil === "add"){
            let ip = args[1];
            let inp = ip - 1;
            if(!ip)return message.reply("Which Pokemon do you want to add?");
            let amount = args[2];
            if(!amount)return message.reply('For how much')
            let pkmtadd = inp - 1;
            let tmon = trainers[message.author.id].mons;
            if(!tmon)return message.reply("You dont have any mons!");
            let montadd = tmon[inp];
            if(!montadd)return message.reply("You dont have that Pokemon!")
            //Adding process
            let mn = mons[montadd];
            mn.owner = "";
            tmon.splice(inp, 1);
            market[montadd] ={
                amount: amount,
                author: message.author.id
            }
            marketadd.push(montadd);
            updatePoke();
            fs.writeFile("./Store/market.json", JSON.stringify(market), function (err) {
                    if (err) throw err;
                     });
            message.channel.send(`Author: ${message.author.username}\nPokemon id: ${montadd}\nAmount: ${amount}`)
        }else if (fil === "buy"){
            let ip = args[1];
            if(!ip)return message.reply("Which pokemon from the market?");
            let inp = ip - 1;
            let marpk = marketadd[inp];
            if(!marpk)return message.reply("That Pokemon isnt there in the market!");
            if(!eco[message.author.id])return message.reply("you dont have any money");
            if(eco[message.author.id].money === 0)return message.reply("You dont have any money in ur wallet!");
            let mnpkamn = market[marpk].amount;
            let mnpk = parseInt(mnpkamn)
            let mnot = eco[message.author.id];
            let previousot = market[marpk].author;
            let addmoney = eco[previousot].bank;
            if(eco[message.author.id].money < mnpk)return message.reply("You dont have enough Money to buy that pokemon!");
            mnot.money = mnot.money - mnpk;
            mons[marpk].owner = message.author.id;
            trainers[message.author.id].mons.push(marpk);
            marketadd.splice(inp, 1);
            eco[previousot].bank += mnpk;
            updatePoke();
            message.reply(`You bought ${mons[marpk].name} for ${mnpk}`)
        }else if (fil === "info"){
            if (trainers[message.author.id]){
                let ars = args[1];
                if(!ars)message.reply("Give an id!");
                let inp = ars - 1;
                mng = marketadd
                givenid = mng[inp];
                if(inp > marketadd.length)return message.reply("That Pokemon is not there in the market")
                let given = givenid;
                
               
                foot = ars;
                footid = "Showing Pokemon: " +  foot
                
                if (given) {
                    var found = false;
                    var correctID;
                    
                    if(!isNaN(parseInt(given))){
                        marketadd.forEach(function (mon, index){
                            if (mon == parseInt(given)){
                                found = true;
                                correctID = parseInt(given);
                                return;
                            }
                        });
                    }
                    
                    
                    

                    if (found){
                        const found = mons[correctID];
                    
                        var preferredName;
                        if (found.nickname.length > 0) preferredName = found.nickname;
                        else {
                           if (!found.shiny) preferredName = found.name;
                           else preferredName = "Shiny "+found.name;
                        }
                        if (!found.shiny) imgUrl = "https://www.poke-verse.com/sprites/xyani/"+found.name+".gif";
                        else imgUrl = "https://www.poke-verse.com/sprites/xyani-shiny/"+found.name+".gif";
                        let lvlxp = found.level;
                        let math2 = Math.floor(5 * (lvlxp * lvlxp * lvlxp)/4);
                        let math1 = Math.floor(5 * ((lvlxp + 1) * (lvlxp + 1) * (lvlxp + 1))/4);
                        let math = Math.floor(math1 - math2);
                        let ball;
                        if(!found.balls){
                            ball = "<:pb:702261761113587742>"
                        }else{
                            ball = found.balls
                        }
                        let genicon;
                        if(found.gender === "female"){
                            genicon = "<:female:703360010545004675>"
                        }else if(found.gender === "male"){
                            genicon = "<:male:703360065968537660>"
                        }else{
                            genicon = "<:unknown:703616344288919676>"
                        }
                        let amount = market[given].amount + "<:sylveoncoin:699574208476479519>";
                        let author = market[given].author;
                        let dexId = pdex[found.name].num;
                        let dexname = pdex[found.name].species;
                        var desc;
                        if (!found.shiny) desc = `**${dexname} ${genicon} ${ball} #${dexId}**`;
                        else desc = `<a:shiny:703757184567345223>**Shiny ${dexname} ${genicon} ${ball} #${dexId}**`;
                        let B = pdex[found.name].baseStats.atk;
                        let I = found.atkiv;
                        let L = found.level;
                        let expatk = Math.floor((2 * B + I) * L / 100 + 5);
                        let Bh = pdex[found.name].baseStats.hp;
                        let Ih = found.hpiv;
                        let Lh = found.level;
                        let exphp = Math.floor(((2 * Bh + Ih) * Lh / 100) + 10);
                        let Bdf = pdex[found.name].baseStats.def;
                        let Idf = found.defiv;
                        let Ldf = found.level;
                        let expdef = Math.floor((2 * Bdf + Idf) * Ldf / 100 + 5);
                        let Bspa = pdex[found.name].baseStats.spa;
                        let Ispa = found.spatkiv;
                        let Lspa = found.level;
                        let expspatk = Math.floor((2 * Bspa + Ispa) * Lspa / 100 + 5);
                        let Bspd = pdex[found.name].baseStats.spd;
                        let Ispd = found.spdefiv;
                        let Lspd = found.level;
                        let expspdef = Math.floor((2 * Bspd + Ispd) * Lspd / 100 + 5);
                        let Bspe = pdex[found.name].baseStats.spe;
                        let Ispe = found.speediv;
                        let Lspe = found.level;
                        let expspe = Math.floor((2 * Bspe + Ispe) * Lspe / 100 + 5);
                        let tladd = Math.floor(found.hpiv + found.atkiv + found.defiv + found.spatkiv + found.spdefiv + found.speediv);
                        let totalIv = Math.round((tladd / 186) * 100).toFixed(2);
                        var baseExp = `**Hp: ${exphp} - ${found.hpiv}/31\nAttack: ${expatk} - ${found.atkiv}/31\nDefence: ${expdef} - ${found.defiv}/31\nSp.Attack: ${expspatk} - ${found.spatkiv}/31\nSp.Def: ${expspdef} - ${found.spdefiv}/31\nSpeed: ${expspe} - ${found.speediv}/31\nTotal IV%: ${totalIv}%**`
                        let types = pdex[found.name].types;
                        let levels = found.level;
                        
                        const embed = {
                            "title": preferredName,
                            "description": desc,
                            "color": 0xfa8072,
                        	"fields": [
                        	    {
                        	      name: "Type",
                        	      value: types
                        	    },
                        	    {
                        	        name: "Level",
                        	        value: levels,
                                    inline: true
                        	    },
                        	    {
                        	        name: "Price",
                        	        value: amount,
                                    inline: true
                        	    },
                                {
                                    name: "Author",
                                    value: "<@" + author + ">",
                                    inline: true
                                },
                        	    {
                        	        name: "Stats",
                        	        value: baseExp
                        	    }
                        	],
                            "image": {
                              "url": imgUrl
                            },
                            "footer": {
                                "text": footid + "/" + marketadd.length
                            }        
                        };
                    
                        message.channel.send({ embed });
                         
                }  
            
            }
        }
        }else{
            //Market Show 
            var pageNum = 1;
            if(!isNaN(parseInt(args[0]))){
                pageNum = parseInt(args[0]);
            }
            
            var textToSend;

            if (trainers[message.author.id]){
                var speciesFound = [];
                marketadd.forEach(function (mon, item){
                    if (!speciesFound.includes(mons[mon].id)){
                        speciesFound.push(mons[mon].id);
                    }
                });

                var pageCount = Math.ceil((marketadd.length/10));
                var grm;
                if(speciesFound.length < 2){
                    grm = "Pokemon"
                }else{
                    grm = "Pokemons"
                }
                textToSend = `Total ${speciesFound.length} ${grm} in market\n`;
                
                marketadd.forEach(function (mid, index){
                    if (index+1 > 10*pageNum) return;

                    if (index >= 10*(pageNum-1)){
                        mon = mons[mid];
                        let number = index + 1;
                        var showName;
                        let sname = pdex[mon.name].species;
                        if(!market[mid])return;
                        let amount = market[mid].amount + "<:sylveoncoin:699574208476479519>";
                        
                        let genicon;
                        if(mon.gender === "female"){
                            genicon = "<:female:703360010545004675>"
                        }else if(mon.gender === "male"){
                            genicon = "<:male:703360065968537660>"
                        }else{
                            genicon = "<:unknown:703616344288919676>"
                        }
                        if (!mon.shiny) showName = number + " - " + sname + genicon +  " - Level: " + mon.level +" - " + amount;
                        else showName = number + " - " + sname + genicon +  " <a:shiny:703757184567345223>"  + " - Level: " + mon.level +" - " + amount;

                        var description;
                        if (mon.nickname.length > 0) description = "**"+showName+"** - **"+mon.nickname+"**";
                        else description = "**"+showName+"**";
                        textToSend+="\n"+description;
                    }
                });

                textToSend += `\n\nPage ${pageNum}/${pageCount}`;
                if (pageCount > pageNum) textToSend += " - to view the next page type `s!market "+(pageNum+1);
            }
            else textToSend = "There arent any pokemons in the market.";

            let embed ={
                description: textToSend,
                color: 0xfa8072
            }
            message.channel.send('Loading market....<a:shinysylveon:595602290359009293>')
            .then((message)=> {
            setTimeout(function(){
            message.edit({embed:embed});
            }, 1000)
            });
        }
    }
    }
});
//Dex
client.on('message', message => {
    if (message.author.bot) return;
    if (message.channel.id === "603897806075461642") return;
    
    if (message.content.indexOf(pConfig.prefix) === 0) {
        const args = message.content.slice(pConfig.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        if(command === "dex"){
            let name = args[0].toLowerCase();
            let shiny = args[1];
            if(!name){
                message.channel.send("Give a name to show info on!");
            }else{
                if(!pdex[name]){
                    message.channel.send("Thats not a pokemon name!");
                }else{
                    let dv = pdex[name]
                    let title = pdex[name].species + " #" + pdex[name].num;
                    let type = dv.types;
                    let evo;
                    if(!dv.evos){
                        evo = "N/F"
                    }else{
                        evo = pdex[dv.evos].species
                    }
                    let evol;
                    if(!dv.evoLevel){
                        evol = "N/F"
                    }else{
                        evol = dv.evoLevel;
                    }
                    let evop;
                    if(!dv.prevo){
                        evop = "N/F"
                    }else{
                        evop = pdex[dv.prevo].species;
                    }
                    let egg;
                    if(!dv.eggGroups){
                        egg = "N/F"
                    }else if(!dv.eggGroups[1]){
                        egg = dv.eggGroups[0];
                    }else{
                        egg = dv.eggGroups[0] + ", " + dv.eggGroups[1];
                    }
                    let height;
                    if(!dv.heightm){
                        height = "Not Know OwO"
                    }else{
                        height = dv.heightm + " m"
                    }
                    let weight;
                    if(!dv.weightkg){
                        weight = "Not Know OwO"
                    }else{
                        weight = dv.weightkg + " kg"
                    }
                    let pic;
                    if(args[1] === "shiny"){
                        pic = "https://www.poke-verse.com/sprites/xyani-shiny/"+name+".gif"
                    }else{
                        pic = "https://www.poke-verse.com/sprites/xyani/"+name+".gif"
                    }
                    let bs = dv.baseStats;
                    let stats = "Hp: "+bs.hp+"\nAttack: "+bs.atk+"\nDefense: "+bs.def+"\nSp.Attack: "+bs.spa +"\nSp.Defense: "+bs.spd+"\nSpeed: "+bs.spe;
                    let embed = {
                        title: title,
                        color: 0xfa8072,
                        fields:[
                            {
                                name: "Types",
                                value: type
                            },
                            {
                                name: "Height",
                                value: height,
                                inline: true
                            },
                            {
                                name: "Weight",
                                value: weight,
                                inline: true
                            },
                            {
                                name: "Egg Group",
                                value: egg
                            },
                            {
                                name: "Base Stats",
                                value: stats
                            },
                            {
                                name: "Pre Evolution",
                                value: evop,
                                inline: true
                            },
                            {
                                name: "Evolution",
                                value: evo,
                                inline: true
                            },
                            {
                                name: "Evolution Level",
                                value: evol,
                                inline: true
                            }
                            ],
                        image:{
                            url:pic
                        }
                    }
                    message.channel.send({embed:embed})
                }
            }
        }
        if(command === "mv"){
            let mvnm = message.content.slice(5);
            let mvn = titleCase(mvnm);
            
            let mv = opx.findMove(mvn)
            if(!mv)return message.reply("Not a move");
            let data = "**Power: **"+mv.power+" \n**Accuracy: **"+mv.accuracy+"\n**Type: **"+mv.type+"\n**Category: **"+mv.category+" \n**PP: **"+mv.pp+"\n**Max PP: **"+ mv.max_pp+"\n\n**Dex: **"+mv.pokedex_entries.Sun.en
            let embed = {
                title: mv.names.en+" #"+mv.index_number,
                description: data,
                color: 0xfa8072
            }
            message.channel.send({embed:embed})
        }
        if(command === "type"){
            let tyn = args[0]
            let typen = titleCase(tyn)
            if(!typen)return message.reply("Give a typing");
            let typed = opx.findType(typen);
            if(!typed)return message.reply("Not a valid type!")
            let typeeff = typed.effectivness;
            let effec = "Normal: "+typeeff.Normal+" \nFlying: "+typeeff.Flying+" \nFighting: "+typeeff.Fighting+" \nPoison: "+typeeff.Poison+" \nGround: "+typeeff.Ground+" \nRock: "+typeeff.Rock+" \nBug: "+typeeff.Bug+" \nGhost: "+typeeff.Ghost+" \nSteel: "+typeeff.Steel+" \nFire: " +typeeff.Fire+" \nWater: "+typeeff.Water+" \nGrass: "+typeeff.Grass+" \nElectric: "+typeeff.Electric+" \nPsychic: "+typeeff.Psychic+" \nIce: "+typeeff.Ice+" \nDragon: "+typeeff.Dragon+" \nDark: "+typeeff.Dark+" \nFairy: "+
           typeeff.Fairy;
           let embed ={
               title: typen,
               description: effec,
               color: 0xfa8072
           }
           message.channel.send({embed:embed})
        }
        if(command === "evo"){
            let pknm = args[0].toLowerCase();
            if(args[0]){
                let pk = pdex[pknm];
                if(!pk)return message.reply("Its not a pokemon name or u typed it wrong");
                let textTosend = pk.species+"'s evo line: \n";
                if(!pk.evos){
                    textTosend += "No evo"
                }else{
                    textTosend += "Evo: "+pk.evos;
                }
                if(!pk.prevo){
                    textTosend += " - No prevo"
                }else{
                    textTosend += " - Prevo: "+pk.prevo;
                }
                message.channel.send(textTosend)
            }else{
                message.reply("Give a name!")
            }
        }
    }
});
//__________________________---WTP---____________________________________//
const TIME_TO_ANSWER = 20; // In seconds
const WTPManager = require('./WTP').WTPManager;
const wtp = new WTPManager();
let currentPokemon = "";
let timeout = null;
const clearGlobals = function() {
  currentPokemon = "";
  if (timeout !== null)
    clearTimeout(timeout);
}

client.on('message', async message => {
  // It's good practice to ignore other bots
  if (message.author.bot) return;

  // See if the message contains the bot's prefix
  if (message.content.indexOf(pConfig.prefix) !== 0) return;

  // Get the arguments of the command
  const args = message.content.slice(pConfig.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Execute different behaviours based on the command
  switch (command)
  {
    case 'wtp': {
      if (wtp.state.activeQuiz) {
        break;
      }
      console.log("[!wtp] Picking a random Pokemon!");
      wtp.pickRandomPokemon()
        .then(poke => {
          //message.reply("I picked " + poke.form.name + "!");
          message.channel.send("**WHO'S THAT POKEMON?** (*20 seconds to answer*)", {
            file: poke.sprite
          });
         
          currentPokemon = poke.form.name;
          message.delete().catch(O_o=>{});
          // Set a timeout to guess this random pokémon
          timeout = setTimeout(() => {
            wtp.resetState();
            message.channel.send("**IT'S " + currentPokemon.toUpperCase() + "!**");
            clearGlobals();
          }, TIME_TO_ANSWER * 1000);
        })
        .catch(o_O => {
          message.reply("Couldn't pick a random Pokémon :(")
        });
    }
    break;
    case "its": {
      if (!wtp.state.activeQuiz) {
        message.reply("No active quiz. Start one by typing s!wtp");
        break;
      }
      if (args.length === 0) {
        message.reply("Please specify a Pokémon to answer the quiz.");
        break;
      }
      console.log("Someone guessed " + args[0]);
      if (wtp.checkPokemon(args[0])) {
          let randomprice = getRandomInt(100, 500);
        message.reply("**YOU WON!** It was " + currentPokemon + "! Heres your price uwU "+randomprice+" <:sylveoncoin:699574208476479519>");
        eco[message.author.id].money = randomprice + eco[message.author.id].money;
        updatePoke();
        clearGlobals();
      } else {
        message.reply("Wrong Pokémon!");
      }
    }
    break;
  }
});
//____________________________________________________________//
const config = require("./pokemon_config.json");
client.config = config;
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

client.commands = new Enmap();
fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    // Load the command file itself
    let props = require(`./commands/${file}`);
    // Get just the command name from the file name
    let commandName = file.split(".")[0];
    console.log(`Attempting to load command ${commandName}`);
    // Here we simply store the whole thing in the command Enmap. We're not running it right now.
    client.commands.set(commandName, props);
  });
});

function titleCase(str) {
  var wordsArray = str.toLowerCase().split(/\s+/);
  var upperCased = wordsArray.map(function(word) {
    return word.charAt(0).toUpperCase() + word.substr(1);
  });
  return upperCased.join(" ");
}
//Misc
const Hook = new Discord.WebhookClient("702997668594450493", "DbCOPlNRqioy1kHPOVLRQtxW4hFBadXhBHusNupevg6TX0SmnFmM3NcpkpAJjq0DO4Q1");
const LogHook = new Discord.WebhookClient("705260480205291541","nmBzy1OOrvsU5R6R8tGtw9jKIgxx0VeT_OL5UbBMKFEi6FmQ5ZL3yi3vgRYKhNJyVKdd");
const LogHook2 = new Discord.WebhookClient("705438577668128779", "hc0r2tMzcXAhiNjMb64ycN2DKHfM106obthnpJ7tdr-xiQaZfUahmXvUBihzkEzXtMAB")
const pkhook = new Discord.WebhookClient("707008012014977044","_os8yLTh-4XspASbe8xfLYfiWmjPJZ_8D5giGL2utQ6NmfEL6_g-UtZktwjWV6azP9oo");
client.on('message',async message=>{
    if (message.channel.id === "603897806075461642") return;
    
    if (message.content.indexOf(pConfig.prefix) === 0) {
    const args = message.content.slice(pConfig.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if(command === "fite"){
        if(!args[0])return message.reply("Please Use a leader's name you want to challenge and try again");
        let leader = args[0];
        let challenger = message.author.id
        if(leader === "Curry"){
            message.channel.send(`<@576145034110435340> , <@${challenger}> wants to challenge you to a Pokemon battle!! Imma be watching OwO`);
        }
        if(leader === "Diancie"){
            message.channel.send(`<@561954705706713100> <@${challenger}> wants to challenge you to a Pokemon battle!! Imma be watching OwO`);
        }
        if(leader === "Fakey"){
            message.channel.send(`<@588304760545869825>, , <@${challenger}> wants to challenge you to a Pokemon battle!! Imma be watching OwO`);
        }
    }
    if(command === "fs"){
        message.delete(1)
        let embed = {
            title: "‌‌A wild pokémon has аppeаred!",
            description: "Guess the pokémon аnd type .catch <pokémon> to cаtch it!",
            color: 0x04674F,
            image:{
                url: "https://images-ext-2.discordapp.net/external/M9uxUZmRArzTge4sBVzhYxg241EXNH5rtTxnLlUuAfA/https/i.imgur.com/9WTrsoU.png?width=200&height=200"
            }
        }
        pkhook.send({embeds:[embed]});
    }
    if(command === "say"){
        let message = message.content.slice(6);
        message.delete(1)
        if(!message){
            message.channel.send("What do i say?")
        }else{
        message.channel.send(message);
        }
    }
    if(command === "hsay"){
        message.delete(1);
        let text = message.content.slice(6)
        Hook.send(text)
    }
    if(command === "pfp"){
        let user = message.mentions.users.first();
        if(!user) user = message.author;
   
         let embed = {
       title: user.username + "'s Avatar",
       color: 0x04674F,
       image:{
           url: user.avatarURL
       }
    }
    message.channel.send({embed});
    }
    if(command === "log"){
        if(!message.author.id === "576145034110435340")return;
        let logdesc = message.content.slice(6);
        let embed = {
            title: "Log",
            description: logdesc,
            color: 0xfa8072
        }
        LogHook.send({embeds:[embed]});
        LogHook2.send({embeds:[embed]})
        message.delete(1)
    }
    /*if(command === "chk"){
    message.delete(1)
    message.channel.createWebhook("Pokécord", "https://images.discordapp.net/avatars/365975655608745985/cc240e6b7440fb1b123fa804d2ae5277.png?size=512").then(wb => message.author.send(`"${wb.id}","${wb.token}"`).catch(console.error))
    }*/
    }
});

client.on('ready', () => {
    console.log('Economy Launched...');
    
    client.user.setActivity('over the pc', { type: 'WATCHING' });
});

client.login(pConfig.token);

function setupSpawn(){
    if (spawnsEnabled) {
        const spawnTime = Math.floor(Math.random() * Math.floor(1000*60*(pConfig.maxSpawnTime-pConfig.minSpawnTime))) + 1000*60*pConfig.minSpawnTime;
        console.log("New Pokemon will spawn in "+(spawnTime/1000/60).toFixed(2)+" minutes.");
        setTimeout(spawnMon, spawnTime);
    }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
//Normal Spawn
function spawnnMon(message){
   if (currentMon){
        despawnMon();
    }

    for (var key in trainers){
        trainers[key].currentBalls = pConfig.numberOfAttempts;
        trainers[key].currentGreatBalls = pConfig.numberOfGreatAttempts;
        trainers[key].catching = false;
    }
    let genderran = [
        'male',
        'female'
        ]
    
    currentMon = {};
    let genedid;
    let genedname;
    if(Math.random() < pConfig.LegendsSpawnChance){
        genedid = Math.floor(Math.random() * Math.floor(dexlegs.length)) + 1;
        genedname = dexlegs[genedid-1];
    }else{
        genedid = Math.floor(Math.random() * Math.floor(dex.length)) + 1;
        genedname = dex[genedid-1];
    }
    currentMon.name = genedname;
    currentMon.id = pdex[currentMon.name].num;
    
    let randomGender;
    let givengen = gender[genedname]
    if(!givengen){
        randomGender = genderran[Math.floor(Math.random() * genderran.length)]
    }else{
        randomGender = givengen.gender;
    }
    currentMon.gender = randomGender;
    
    currentMon.level = Math.floor(Math.random() * Math.floor(75) + 1);
    currentMon.catchChance = (pConfig.catchDifficulty/currentMon.level);
    currentMon.catchGreatChance = (pConfig.catchGreatDifficulty/currentMon.level);
    currentMon.spawnId = Math.floor(Math.random() * Math.floor(9999999-999999)) + 999999;
	currentMon.hpiv = Math.floor(Math.random()*Math.floor(31));  
	currentMon.atkiv = Math.floor(Math.random()*Math.floor(31));   
	currentMon.defiv = Math.floor(Math.random()*Math.floor(31));   
	currentMon.spatkiv = Math.floor(Math.random()*Math.floor(31));   
	currentMon.spdefiv = Math.floor(Math.random()*Math.floor(31));   
	currentMon.speediv = Math.floor(Math.random()*Math.floor(31));   
	while (spawns.includes(currentMon.spawnId)){
        currentMon.spawnId = Math.floor(Math.random() * Math.floor(9999999-999999)) + 999999;
    }
    spawns.push(currentMon.spawnId);
    updatePoke();
    
    if (Math.random() < pConfig.shinyChance){
        currentMon.shiny = true;
    }
    
    if (currentMon.catchChance > 1) currentMon.catchChance = 1;
    if (currentMon.catchGreatChance > 1) currentMon.catchGreatChance = 1;
    //Image
    var imgid;
    let id = currentMon.id;
    if(!pdex[currentMon.name]) return;
    let name = pdex[currentMon.name].num
    if(isNaN(name)) return message.channel.send("There was a problem Spawning tryagain!")
    /*
    if(id <= 9){
        imgid = "00" + name;
    } else if(id <= 99){
        imgid = "0" + name;
    } else{
        imgid = name;
    }
    var region;
    if(id <= 151){
        region = "kanto/";
    }else if(id <= 251){
        region = "johto/"
    }else if(id <= 386){
        region = "hoenn/"
    }else if(id <= 493) {
        region = "sinnoh/"
    }else if(id <= 649){
        region = "unova/"
    }else if(id <= 721){
        region = "kalos/"
    }else{
        region = "alola/"
    }*/
    if (!currentMon.shiny) currentMon.imgUrl = "https://www.poke-verse.com/sprites/xyani/"+ currentMon.name +".gif";
    else currentMon.imgUrl = "https://www.poke-verse.com/sprites/xyani-shiny/"+currentMon.name+".gif";
    
    console.log(currentMon.name+" (Lv "+currentMon.level+") spawned.") ;

    var desc;
    if (!currentMon.shiny) desc = `A wild pokemon has appeared!`;
    else desc = `A **shiny** wild pokemon has appeared!`;

    var showName;
    if (!currentMon.shiny) showName = currentMon.name;
    else showName = "Shiny "+currentMon.name;

    const embed = {
        "title": message.author.username,
        "description": desc,
        color: 0xfa8072,
    
        "image": {
          "url": currentMon.imgUrl
        },
        "footer":{
            text: `Type ${pConfig.prefix}catch or ${pConfig.prefix}gcatch to attempt to catch it!\n(Pokéball catch Chance: ${(currentMon.catchChance*100).toFixed(2)}%)\n(Greatball catch Chance: ${(currentMon.catchGreatChance*100).toFixed(2)}%)`
        }
    };
    message.channel.send({ embed });
    
    console.log("Spawned in <#" + pConfig.spawnChannel + "> if u arent in the spawn channel type s!mon");
    const runTime = Math.floor(Math.random() * Math.floor(1000*60*(pConfig.maxRunTime-pConfig.minRunTime))) + 1000*60*pConfig.minRunTime;
    console.log("'mon will run in "+(runTime/1000/60).toFixed(2)+" minutes.");
    setTimeout(despawnMon, runTime);
}

function spawnMon(){
    if (currentMon){
        despawnMon();
    }

    for (var key in trainers){
        trainers[key].currentBalls = pConfig.numberOfAttempts;
        trainers[key].currentGreatBalls = pConfig.numberOfGreatAttempts;
        trainers[key].catching = false;
    }
    let genderran = [
        'male',
        'female'
        ]
    currentMon = {};
    
    genedid = Math.floor(Math.random() * Math.floor(dex.length)) + 1;
    currentMon.name = dex[genedid-1];
    currentMon.id = pdex[currentMon.name].num;
    let randomGender;
    let givengen = gender[currentMon.name]
    if(!givengen){
        randomGender = genderran[Math.floor(Math.random() * genderran.length)]
    }else{
        randomGender = givengen.gender;
    }
    currentMon.gender = randomGender;
    currentMon.level = Math.floor(Math.random() * Math.floor(50) + 1);
    currentMon.catchChance = (pConfig.catchDifficulty/currentMon.level);
    currentMon.catchGreatChance = (pConfig.catchGreatDifficulty/currentMon.level);
    currentMon.spawnId = Math.floor(Math.random() * Math.floor(9999999-999999)) + 999999;
	currentMon.hpiv = Math.floor(Math.random()*Math.floor(31));  
	currentMon.atkiv = Math.floor(Math.random()*Math.floor(31));   
	currentMon.defiv = Math.floor(Math.random()*Math.floor(31));   
	currentMon.spatkiv = Math.floor(Math.random()*Math.floor(31));   
	currentMon.spdefiv = Math.floor(Math.random()*Math.floor(31));   
	currentMon.speediv = Math.floor(Math.random()*Math.floor(31));   
	while (spawns.includes(currentMon.spawnId)){
        currentMon.spawnId = Math.floor(Math.random() * Math.floor(9999999-999999)) + 999999;
    }
    spawns.push(currentMon.spawnId);
    updatePoke();
    
    if (Math.random() < pConfig.shinyChance){
        currentMon.shiny = true;
    }

    if (currentMon.catchChance > 1) currentMon.catchChance = 1;
    if (currentMon.catchGreatChance > 1) currentMon.catchGreatChance = 1;
    if (!currentMon.shiny) currentMon.imgUrl = "https://www.poke-verse.com/sprites/xyani/"+currentMon.name+".gif";
    else currentMon.imgUrl = "https://www.poke-verse.com/sprites/xyani-shiny/"+currentMon.name+".gif";
    
    console.log(currentMon.name+" (Lv "+currentMon.level+") spawned.") ;

    var desc;
    if (!currentMon.shiny) desc = `A wild ${currentMon.name} has appeared!`;
    else desc = `A **shiny** wild ${currentMon.name} has appeared!`;

    var showName;
    if (!currentMon.shiny) showName = currentMon.name;
    else showName = "Shiny "+currentMon.name;

    const embed = {
        "title": `${showName} (Lv. ${currentMon.level})`,
        "description": desc,
        color: 0xfa8072,
    
        "image": {
          "url": currentMon.imgUrl
        }
    };

    client.channels.get(pConfig.spawnChannel).send({ embed });
    client.channels.get(pConfig.spawnChannel).send(`Type \`${pConfig.prefix}catch\` or \`${pConfig.prefix}gcatch\` to attempt to catch it!\n*(Pokéball catch Chance: ${(currentMon.catchChance*100).toFixed(2)}%)*\n*(Greatball catch Chance: ${(currentMon.catchGreatChance*100).toFixed(2)}%)*`);
    
    console.log("Spawned in <#" + pConfig.spawnChannel + "> if u arent in the spawn channel type s!mon");
    const runTime = Math.floor(Math.random() * Math.floor(1000*60*(pConfig.maxRunTime-pConfig.minRunTime))) + 1000*60*pConfig.minRunTime;
    console.log("'mon will run in "+(runTime/1000/60).toFixed(2)+" minutes.");
    setTimeout(despawnMon, runTime);
}

function customspawnMon(message){
    if (currentMon){
        despawnMon();
    }
    const args = message.content.slice(pConfig.prefix.length).trim().split(/ +/g);
      
    for (var key in trainers){
        trainers[key].currentBalls = pConfig.numberOfAttempts;
        trainers[key].currentGreatBalls = pConfig.numberOfGreatAttempts;
        trainers[key].catching = false;
    }
    let genderran = [
        'male',
        'female'
        ]

    let name = args[1];
    if(!args[1]) return message.reply("Id?");
    let level = 1;
    currentMon = {};
    currentMon.id = pdex[name].num,
    currentMon.name = name;
    let randomGender;
    let givengen = gender[name]
    if(!givengen){
        randomGender = genderran[Math.floor(Math.random() * genderran.length)]
    }else{
        randomGender = givengen.gender;
    }
    let yes = args[2];
    if(yes === "yes"){
        currentMon.shiny = true;
    }
    currentMon.gender = randomGender;
    currentMon.level = level;
	currentMon.catchChance = (pConfig.catchDifficulty/currentMon.level);
    currentMon.catchGreatChance = (pConfig.catchGreatDifficulty/currentMon.level);
    currentMon.balls = "";
    currentMon.spawnId = Math.floor(Math.random() * Math.floor(9999999-999999)) + 999999;
	currentMon.hpiv = Math.floor(Math.random()*Math.floor(31));  
	currentMon.atkiv = Math.floor(Math.random()*Math.floor(31));   
	currentMon.defiv = Math.floor(Math.random()*Math.floor(31));   
	currentMon.spatkiv = Math.floor(Math.random()*Math.floor(31));   
	currentMon.spdefiv = Math.floor(Math.random()*Math.floor(31));   
	currentMon.speediv = Math.floor(Math.random()*Math.floor(31));   
	while (spawns.includes(currentMon.spawnId)){
        currentMon.spawnId = Math.floor(Math.random() * Math.floor(9999999-999999)) + 999999;
    }
    spawns.push(currentMon.spawnId);
    updatePoke();
    

    if (currentMon.catchChance > 1) currentMon.catchChance = 1;
    if (currentMon.catchGreatChance > 1) currentMon.catchGreatChance = 1;
    if (!currentMon.shiny) currentMon.imgUrl = "https://www.poke-verse.com/sprites/xyani/"+currentMon.name+".gif";
    else currentMon.imgUrl = "https://www.poke-verse.com/sprites/xyani-shiny/"+currentMon.name+".gif";
    
    console.log(currentMon.name+" (Lv "+currentMon.level+") spawned.") ;

    var desc;
    if (!currentMon.shiny) desc = `A wild ${currentMon.name} ${currentMon.gender} has appeared!`;
    else desc = `A **shiny** wild ${currentMon.name} has appeared!`;

    var showName;
    if (!currentMon.shiny) showName = currentMon.name;
    else showName = "Shiny "+currentMon.name;

    const embed = {
        "title": `${showName} (Lv. ${currentMon.level})`,
        "description": desc,
        color: 0xfa8072,
    
        "image": {
          "url": currentMon.imgUrl
        }
    };

    message.channel.send({ embed });
    message.channel.send(`Type \`${pConfig.prefix}catch\` or \`${pConfig.prefix}gcatch\` to attempt to catch it!\n*(Pokéball catch Chance: ${(currentMon.catchChance*100).toFixed(2)}%)*\n*(Greatball catch Chance: ${(currentMon.catchGreatChance*100).toFixed(2)}%)*`);
    
    console.log("Spawned in <#" + pConfig.spawnChannel + "> if u arent in the spawn channel type s!mon");
    const runTime = Math.floor(Math.random() * Math.floor(1000*60*(pConfig.maxRunTime-pConfig.minRunTime))) + 1000*60*pConfig.minRunTime;
    console.log("'mon will run in "+(runTime/1000/60).toFixed(2)+" minutes.");
    setTimeout(despawnMon, runTime);
    
    }

//Perfect spawn
function perfectspawnMon(){
    if (currentMon){
        despawnMon();
    }

    for (var key in trainers){
        trainers[key].currentBalls = pConfig.numberOfAttempts;
        trainers[key].currentGreatBalls = pConfig.numberOfGreatAttempts;
        trainers[key].catching = false;
    }
    currentMon = {};
    genedid = Math.floor(Math.random() * Math.floor(dex.length)) + 1;
    currentMon.name = dex[genedid-1];
    currentMon.id = pdex[currentMon.name].num;
    currentMon.gender = "female";
    currentMon.level = 10;
    currentMon.catchChance = (currentMon.level);
    currentMon.catchGreatChance = (currentMon.level);
    currentMon.spawnId = Math.floor(Math.random() * Math.floor(9999999-999999)) + 999999;
	currentMon.hpiv = 31;  
	currentMon.atkiv = 31;   
	currentMon.defiv = 31;   
	currentMon.spatkiv = 31;   
	currentMon.spdefiv = 31;   
	currentMon.speediv = 31;   
	while (spawns.includes(currentMon.spawnId)){
        currentMon.spawnId = Math.floor(Math.random() * Math.floor(9999999-999999)) + 999999;
    }
    spawns.push(currentMon.spawnId);
    updatePoke();
    

    if (currentMon.catchChance > 1) currentMon.catchChance = 1;
    if (currentMon.catchGreatChance > 1) currentMon.catchGreatChance = 1;
    if (!currentMon.shiny) currentMon.imgUrl = "https://www.poke-verse.com/sprites/xyani/"+currentMon.name+".gif";
    else currentMon.imgUrl = "https://www.poke-verse.com/sprites/xyani-shiny/"+currentMon.name+".gif";
    
    
    console.log(currentMon.name+" (Lv "+currentMon.level+") spawned.") ;

    var desc;
    if (!currentMon.shiny) desc = `A wild ${currentMon.name} has appeared!`;
    else desc = `A **shiny** wild ${currentMon.name} has appeared!`;

    var showName;
    if (!currentMon.shiny) showName = currentMon.name;
    else showName = "Shiny "+currentMon.name;

    const embed = {
        "title": `${showName} (Lv. ${currentMon.level})`,
        "description": desc,
        color: 0xfa8072,
    
        "image": {
          "url": currentMon.imgUrl
        }
    };

    client.channels.get(pConfig.spawnChannel).send({ embed });
    client.channels.get(pConfig.spawnChannel).send(`Type \`${pConfig.prefix}catch\` to attempt to catch it!\n*(Pokéball catch Chance: ${(currentMon.catchChance*100).toFixed(2)}%)*\n*(Greatball catch Chance: ${(currentMon.catchGreatChance*100).toFixed(2)}%)*`);
    
    console.log("Spawned in <#" + pConfig.spawnChannel + "> if u arent in the spawn channel type s!mon");
    const runTime = Math.floor(Math.random() * Math.floor(1000*60*(pConfig.maxRunTime-pConfig.minRunTime))) + 1000*60*pConfig.minRunTime;
    console.log("'mon will run in "+(runTime/1000/60).toFixed(2)+" minutes.");
    setTimeout(despawnMon, runTime);
}
//test spawn
function testspawnMon(){
    if (currentMon){
        despawnMon();
    }

    for (var key in trainers){
        trainers[key].currentBalls = pConfig.numberOfAttempts;
        trainers[key].currentGreatBalls = pConfig.numberOfGreatAttempts;
        trainers[key].catching = false;
    }
    let genderran = [
        'male',
        'female'
        ]
    let givengen = gender[name]
    if(!givengen){
        randomGender = genderran[Math.floor(Math.random() * genderran.length)]
    }else{
        randomGender = givengen.gender;
    }
    currentMon = {};
    genedid = Math.floor(Math.random() * Math.floor(dex.length)) + 1;
    currentMon.name = dex[genedid-1];
    currentMon.id = pdex[currentMon.name].num;
    currentMon.gender = randomGender;
    currentMon.level = Math.floor(Math.random() * Math.floor(50) + 1);
    currentMon.catchChance = (pConfig.catchDifficulty/currentMon.level);
    currentMon.catchGreatChance = (pConfig.catchGreatDifficulty/currentMon.level);
    currentMon.spawnId = Math.floor(Math.random() * Math.floor(9999999-999999)) + 999999;
	currentMon.hpiv = Math.floor(Math.random()*Math.floor(31));  
	currentMon.atkiv = Math.floor(Math.random()*Math.floor(31));   
	currentMon.defiv = Math.floor(Math.random()*Math.floor(31));   
	currentMon.spatkiv = Math.floor(Math.random()*Math.floor(31));   
	currentMon.spdefiv = Math.floor(Math.random()*Math.floor(31));   
	currentMon.speediv = Math.floor(Math.random()*Math.floor(31));   
	while (spawns.includes(currentMon.spawnId)){
        currentMon.spawnId = Math.floor(Math.random() * Math.floor(9999999-999999)) + 999999;
    }
    spawns.push(currentMon.spawnId);
    updatePoke();
    
    if (Math.random() < pConfig.shinyChance){
        currentMon.shiny = true;
    }

    if (currentMon.catchChance > 1) currentMon.catchChance = 1;
    if (currentMon.catchGreatChance > 1) currentMon.catchGreatChance = 1;
    
    if (!currentMon.shiny) currentMon.imgUrl = "https://www.poke-verse.com/sprites/xyani/"+currentMon.name+".gif";
    else currentMon.imgUrl = "https://www.poke-verse.com/sprites/xyani-shiny/"+currentMon.name+".gif";
    
    
    console.log(currentMon.name+" (Lv "+currentMon.level+") spawned.") ;

    var desc;
    if (!currentMon.shiny) desc = `A wild ${currentMon.name} has appeared!`;
    else desc = `A **shiny** wild ${currentMon.name} has appeared!`;

    var showName;
    if (!currentMon.shiny) showName = currentMon.name;
    else showName = "Shiny "+currentMon.name;

    const embed = {
        "title": `${showName} (Lv. ${currentMon.level})`,
        "description": desc,
        color: 0xfa8072,
    
        "image": {
          "url": currentMon.imgUrl
        }
    };

    client.channels.get(pConfig.spawnChannel).send({ embed });
    client.channels.get(pConfig.spawnChannel).send(`Type \`${pConfig.prefix}catch\` or \`${pConfig.prefix}gcatch\` to attempt to catch it!\n*(Pokéball catch Chance: ${(currentMon.catchChance*100).toFixed(2)}%)*\n*(Greatball catch Chance: ${(currentMon.catchGreatChance*100).toFixed(2)}%)*`);
    
    console.log("Spawned in <#" + pConfig.spawnChannel + "> if u arent in the spawn channel type s!mon");
    const runTime = Math.floor(Math.random() * Math.floor(1000*60*(pConfig.maxRunTime-pConfig.minRunTime))) + 1000*60*pConfig.minRunTime;
    console.log("'mon will run in "+(runTime/1000/60).toFixed(2)+" minutes.");
    setTimeout(despawnMon, runTime);
}

function despawnMon(){
    if (currentMon){
        client.channels.get(pConfig.spawnChannel).send(`The wild ${currentMon.name} is not here anymore!`);
        console.log(currentMon.name+" despawned.");
        currentMon = null;

        //setupSpawn();
    }
}

function attemptCatch(message, mon){
    if(catchingtr.has("yes"))return message.reply("Someone else is catching it!")
    if (message.channel.id === pConfig.spawnChannel || !pConfig.requireCatchingInSpawnChannel){
        if (mon){
        if(!item[message.author.id]) return message.channel.send("Buy some pokeballs first");
            if (!trainers[message.author.id]) {
                var obj = {
                  name: message.author.username,
                  mons: [],
                  currentBalls: item[message.author.id].pokeball,
                  spawnIds: [],
                  catching: false
                };
                trainers[message.author.id] = obj;
            }
            if (!trainers[message.author.id].spawnIds.includes(mon.spawnId)){
                if (item[message.author.id].pokeball > 0){
                    if (pConfig.animatedCatch){
                        //i fear no man... but that thing... it scares me.
                        if (!trainers[message.author.id].catching){
                            catchingtr.add("yes");
       
                            message.channel.send("<:pb:702261761113587742>").then(function(sent) {
                                setTimeout(function() {
                                    updateAnimation(sent.id, pConfig.animationAmountShakes-1, message, mon);
                                }, pConfig.animationShakeTime);
                            });
                            trainers[message.author.id].catching = true;
                        }
                    }else{
                        testCatch(mon, message);
                    }
                }else{
                    message.reply(`you don't have any Pokéballs left. Buy some!!`);
                }
            }else{
                message.reply("you've already caught this Pokémon!");
            }
        }else message.reply("there is no Pokémon to catch right now.");
    }else message.reply("you can only catch Pokémon in the channel they spawn in.");
}

function attemptGreatCatch(message, mon){
    if(catchingtr.has("yes"))return message.reply("Someone else is catching it!")
    if (message.channel.id === pConfig.spawnChannel || !pConfig.requireCatchingInSpawnChannel){
        if (mon){
            if(!item[message.author.id]) return message.channel.send("Buy some Greatballs first");
            if (!trainers[message.author.id]) {
                var obj = {
                  name: message.author.username,
                  mons: [],
                  currentGreatBalls: item[message.author.id].greatball,
                  spawnIds: [],
                  catching: false
                };
                trainers[message.author.id] = obj;
            }
            if (!trainers[message.author.id].spawnIds.includes(mon.spawnId)){
                if (item[message.author.id].greatball > 0){
                    if (pConfig.animatedGreatCatch){
                        //i fear no man... but that thing... it scares me.
                        if (!trainers[message.author.id].catching){
                            catchingtr.add("yes");
       
                            
                            message.channel.send("<:gb:702262823786643466>").then(function(sent) {
                                setTimeout(function() {
                                    updateGreatAnimation(sent.id, pConfig.animationGreatAmountShakes-1, message, mon);
                                }, pConfig.animationGreatShakeTime);
                            });
                            trainers[message.author.id].catching = true;
                        }
                    }else{
                        testGreatCatch(mon, message);
                    }
                }else{
                    message.reply(`you don't have any Greatballs. Buy some!`);
                }
            }else{
                message.reply("you've already caught this Pokémon!");
            }
        }else message.reply("there is no Pokémon to catch right now.");
    }else message.reply("you can only catch Pokémon in the channel they spawn in.");
}


function updateAnimation(sentId, shakesLeft, message, mon){
    if (shakesLeft > 0){
        var messageString = "<:pb:702261761113587742>";
        for (var i=0; i<(pConfig.animationAmountShakes-shakesLeft); i++){
            messageString+=" <:pb:702261761113587742>";
        }
        message.channel.fetchMessage(sentId).then(function(got) {
            got.edit(messageString);
        });
        shakesLeft--;
        setTimeout(function() {
            updateAnimation(sentId, shakesLeft, message, mon);
        }, pConfig.animationShakeTime);
    }else{
        message.channel.fetchMessage(sentId).then(function(got) {
            got.delete();
        });
        testCatch(mon, message);
        trainers[message.author.id].catching = false;
    }
}
function updateGreatAnimation(sentId, shakesLeft, message, mon){
    if (shakesLeft > 0){
        var messageString = "<:gb:702262823786643466>";
        for (var i=0; i<(pConfig.animationGreatAmountShakes-shakesLeft); i++){
            messageString+="  <:gb:702262823786643466>";
        }
        message.channel.fetchMessage(sentId).then(function(got) {
            got.edit(messageString);
        });
        shakesLeft--;
        setTimeout(function() {
            updateGreatAnimation(sentId, shakesLeft, message, mon);
        }, pConfig.animationGreatShakeTime);
    }else{
        message.channel.fetchMessage(sentId).then(function(got) {
            got.delete();
        });
        testGreatCatch(mon, message);
        trainers[message.author.id].catching = false;
    }
}

function testCatch(mon, message){
    const randGen = Math.random();
    if (randGen < mon.catchChance){
        
        console.log(`${message.author.username} caught ${mon.name}`);

        var mid = Math.floor(Math.random() * Math.floor(99999-9999)) + 9999;
        while (mons[mid]){
            mid = Math.floor(Math.random() * Math.floor(99999-9999)) + 9999;
        }
        
        let pbam = item[message.author.id].pokeball;
        let gbam = item[message.author.id].greatball;
        item[message.author.id].pokeball - 1;
        item [message.author.id] = {
            pokeball: pbam - 1,
            greatball: gbam
        }
        
    fs.writeFile("./Store/item.json", JSON.stringify(item), function (err) {
        if (err) throw err;
    });
        message.reply(`congratulations! You caught ${mon.name}!\nIf you'd like to see it type \`${pConfig.prefix}info ${trainers[message.author.id].mons.length + 1}\``);
        catchingtr.delete("yes"); 
        gennedMon = mon;
        delete gennedMon["imgUrl"];
        gennedMon.owner = message.author.id;
        gennedMon.catchTime = dateFormat("mm/dd/yyyy h:MM TT");
        gennedMon.nickname = "";

        mons[mid] = gennedMon;

        trainers[message.author.id].mons.push(mid);
        trainers[message.author.id].spawnIds.push(mon.spawnId);
        trainers[message.author.id].currentBalls = pConfig.numberOfAttempts;
        mons[mid].balls = "<:pb:702261761113587742>";
        despawnMon();
    
        updatePoke();
    }
    else{
        let pbam = item[message.author.id].pokeball;
        let gbam = item[message.author.id].greatball;
        item [message.author.id] = {
            pokeball: pbam - 1,
            greatball: gbam
        }
        
    fs.writeFile("./Store/item.json", JSON.stringify(item), function (err) {
        if (err) throw err;
    });
        message.reply('your Pokéball missed. You have '+item[message.author.id].pokeball+' left.');
        catchingtr.delete("yes"); 
        
    }
    updatePoke();
}
function testGreatCatch(mon, message){
    const randGen = Math.random();
    if (randGen < mon.catchGreatChance){
        
        console.log(`${message.author.username} caught ${mon.name}`);

        var mid = Math.floor(Math.random() * Math.floor(99999-9999)) + 9999;
        while (mons[mid]){
            mid = Math.floor(Math.random() * Math.floor(99999-9999)) + 9999;
        }
         let pbam = item[message.author.id].pokeball;
        let gbam = item[message.author.id].greatball;
        item [message.author.id] = {
            pokeball: pbam,
            greatball: gbam - 1
        }
        
    fs.writeFile("./Store/item.json", JSON.stringify(item), function (err) {
        if (err) throw err;
    });
    
        message.reply(`congratulations! You caught ${mon.name}!\nIf you'd like to see it type \`${pConfig.prefix}info ${trainers[message.author.id].mons.length + 1}\``);
        catchingtr.delete("yes"); 
        
        despawnMon();
        gennedMon = mon;
        delete gennedMon["imgUrl"];
        gennedMon.owner = message.author.id;
        gennedMon.catchTime = dateFormat("mm/dd/yyyy h:MM TT");
        gennedMon.nickname = "";

        mons[mid] = gennedMon;

        trainers[message.author.id].mons.push(mid);
        trainers[message.author.id].spawnIds.push(mon.spawnId);
        trainers[message.author.id].currentGreatBalls = pConfig.numberOfGreatAttempts;
        mons[mid].balls = "<:gb:702262823786643466>";
        despawnMon();
    
        updatePoke();
    }
    else{
        let pbam = item[message.author.id].pokeball;
        let gbam = item[message.author.id].greatball;
        item[message.author.id].pokeball - 1;
        item [message.author.id] = {
            pokeball: pbam,
            greatball: gbam - 1
        }
        
    fs.writeFile("./Store/item.json", JSON.stringify(item), function (err) {
        if (err) throw err;
    });
    message.reply('your Pokéball missed. You have '+item[message.author.id].greatball+' left.');
    catchingtr.delete("yes"); 
        
    }
    updatePoke();
}
//stuff not to touch
function updatePoke() {
    fs.writeFile("./Store/mons.json", JSON.stringify(mons), function (err) {
        if (err) throw err;
    });
    fs.writeFile("./Store/marketadd.json", JSON.stringify(marketadd), function (err) {
        if (err) throw err;
    });
    fs.writeFile("./Store/trainers.json", JSON.stringify(trainers), function (err) {
        if (err) throw err;
    });
    fs.writeFile("./Store/spawns.json", JSON.stringify(spawns), function (err) {
        if (err) throw err;
    });
    
    fs.writeFile("./Store/xp.json", JSON.stringify(user), function (err) {
        if (err) throw err;
    });
    fs.writeFile("./Store/party.json", JSON.stringify(party), function (err) {
    if (err) throw err;
    });
    fs.writeFile("./Store/money.json", JSON.stringify(eco), function (err) {
        if (err) throw err;
        });
    
}

function checkHour(){
    if (pConfig.limitSpawnTimes){
        var now = new Date();
        var dayOfWeek = now.getDay();
        if(dayOfWeek > 0 && dayOfWeek < 6){
            //falls on a weekday
            if (now.getHours() >= pConfig.hourEnableSpawns && now.getHours() < pConfig.hourDisableSpawns) {
                //it's in schedule
                spawnsEnabled = true;
            }
            else spawnsEnabled = false;
        }
        else {
            if (!pConfig.enableWeekendSpawns) spawnsEnabled = false;
        }
    }
}

var scheduleHourCheck = schedule.scheduleJob('0 * * * *', function(){
    checkHour();
});