// author: vk.com/tern.trade
const FileSystem = require("fs");
const request = require("request-promise");
const config = require('./config');
const rp = require('readline-sync');
const SteamUser = require('steam-user');
const GlobalOffensive = require('globaloffensive');

let items_name = []
// read items from file
const items = FileSystem.readFileSync(config.file_path, 'utf-8').trim().split('\n')
for (item in items) {
    items_name.push(items[item].replace('\r', ''))
}
console.log('Your selected items:\n' + items_name.join('\n'));
let items_info = {}
let casket_assets = []
// func for delay between input unto Storage
function sleep(ms) {
    ms += new Date().getTime();
    while (new Date() < ms){}
} 
// get account creds.
const login = config.accountName
const password = config.password
const steam_id = config.steam_id
// get inventory and input items into storage
async function main() {
    //get steam inventory
    let res = await request.get({
    url: `https://steamcommunity.com/inventory/${steam_id}/730/2?l=english&count=1000`,
    json: true,
    gzip: true
    })
    // do dict {item_name: []}
    for (item_name in items_name) {
        items_info[items_name[item_name]] = []
    }
    // fill items_dict to {item_name:[assets...] and storage_list to [storage assets...]}
    for (item in res['descriptions']) {
        market_name = res['descriptions'][item]['market_hash_name']
        if (items_name.includes(market_name)) {
            instance_id = res['descriptions'][item]['instanceid']
            class_id = res['descriptions'][item]['classid']
            for (id_info in res['assets']) {
                if (res['assets'][id_info]['instanceid'] == instance_id && res['assets'][id_info]['classid'] == class_id) {
                    items_info[market_name].push(parseInt(res['assets'][id_info]['assetid']))
                }
            }
        }
        else if (market_name == 'Storage Unit') {
            instance_id = res['descriptions'][item]['instanceid']
            class_id = res['descriptions'][item]['classid']
            for (id_info in res['assets']) {
                if (res['assets'][id_info]['instanceid'] == instance_id && res['assets'][id_info]['classid'] == class_id) {
                    casket_assets.push(parseInt(res['assets'][id_info]['assetid']))
                }
            }
        }  
    }
    // ask user for current storage asset id
    console.log('Your Storage ids:\n' + casket_assets.join('\n'));
    work_casket = parseInt(rp.question('Select Storage id: '));
    // put items into storage
    for (item_name in items_info) {
        for (asset_id in items_info[item_name]) {
                csgo.addToCasket(work_casket, items_info[item_name][asset_id])
                console.log(`Successfully add ${item_name} (${items_info[item_name][asset_id]}) to Storage (${work_casket})`)  
                // delay to avoid ip ban 
                sleep(500)
        }
    }
    
}
// auth in steam
const code = rp.question('Input 2FA code: ')
let user = new SteamUser();
let csgo = new GlobalOffensive(user);
const logInOptions = {
    accountName: login,
        password: password,
        twoFactorCode: code
    };
user.logOn(logInOptions);
// set online on account and play csgo when account logged
user.on('loggedOn', () => {
    user.on('accountInfo', (username) => {
        console.log("Logged into Steam as " + username);
    });
    user.setPersona(SteamUser.EPersonaState.Online);
    user.gamesPlayed([730]);
});
// start programm when account started play csgo 
csgo.on('connectedToGC', () => {
    console.log('Connected to GC!');
  
    if(csgo.haveGCSession) {
        console.log('Have Session!');
        // start!!!
        main()
    };
});
// author: vk.com/tern.trade