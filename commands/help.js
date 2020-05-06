exports.run = (client, message, args) => {
    let gmodule = args[0];
            if(gmodule === "pokemon"){
                let embed = {
                    title: "Pokemon Module",
                    color: 0xfa8072,
                    fields: [
                    {
                       name: "Pokemon Module",  value: "**The pokemon related commands**" 
                    },
                    {
                        name: "s!spawn",
                        value: "To spawn a pokemon"
                    },
                    {
                        name:"s!buy",
                        value: "To buy pokeballs and stuff from shop"
                    },
                    {
                        name: "s!mart",
                        value: "The PokeMart"
                    },
                    {
                        name: "s!catch",
                        value: "To catch a spawned mon."
                    },
                    {
                        name: "s!gcatch",
                        value: "To catch using greatball"
                    },
                    {
                        name: "s!pc",
                        value: "Check your caught Pokemons"
                    },
                    {
                       name: "s!nickname",
                       value: "Nickname a Pokemon by pc id\nUsage: `s!nickname <id> <nickname>`"
                    },
                    {
                        name: "s!select",
                        value: "Select a pokemon\nUsage: `s!select <id>`"
                    },
                    {
                        name: "s!info",
                        value: "Show selected mon or the given mon\nUsage: `s!info <id>`"  
                    },
                    {
                        name: "s!party",
                        value: "Party\nAdditions: `add`\nUsage: `s!part add <id> <slot>`"
                    },
                    {
                        name: "s!give",
                        value: "Give someone a Pokemon you own\nUsage: `s!give @user <id>`"
                    },
                    {
                        name: "s!market",
                        value: "Pokemon gts\nAdditions: `add, buy`\nUsage: `s!market add <id>\ns!market buy <market id>`"
                    }
                    ]
                }
                message.channel.send({embed:embed})
            }else if (gmodule === "eco"){
            let embed = {
                title: "Economy Module",
                color: 0xfa8072,
                fields:[
                    {
                        name: "s!bal",
                        value: "Available balance in Wallet"
                    },
                    {
                        name: "s!work",
                        value: "To work and earn money.\nCooldown: 1 min"
                    },
                    {
                        name: "s!dep",
                        value: "To deposit all your wallet money to bank"
                    },
                    {
                        name: "s!withdraw",
                        value: "To withdraw your bank money"
                    },
                    {
                        name: "s!pay",
                        value: "To pay someone from your wallet.\nUsage: `s!pay @user <amount>`"
                    }
                    ]
            }
            message.channel.send({embed:embed})
            }else if(gmodule === "rpg"){
                let embed = {
                    title: "RPG Module",
                    color: 0xfa8072,
                    fields:[
                    {
                        name: "s!chop",
                        value: "Chop trees cuz wynaut"
                    },
                    {
                        name: "s!inv",
                        value: "Your inventory"
                    }
                    ]
                }
                message.channel.send({embed:embed});    
            }else{
                let embed = {
                    title: "Help Embed",
                    description: "There are three modules, `pokemon`, `pokedex`, `rpg` and `economy`\nFor Pokemon commands do `s!help pokemon`\nFor Pokedex commands do `s!help dex` `not yet added just wait a bit`\nFor Economy commands do `s!help eco`\nFor RPG commands do `s!help rpg`",
                    color: 0xfa8072
                }
                message.channel.send({embed:embed})
            }
}