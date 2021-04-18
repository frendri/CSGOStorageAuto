// author: vk.com/tern.trade
const request = require("request-promise");
const config = require('./config');
const rp = require('readline-sync');
const SteamUser = require('steam-user');
const GlobalOffensive = require('globaloffensive');

const login = config.accountName
const password = config.password
const steam_id = config.steam_id

// auth in steam
let casket_assets = []

function sleep(ms) {
    ms += new Date().getTime();
    while (new Date() < ms){}
} 

async function main() {
    let res = await request.get({
        url: `https://steamcommunity.com/inventory/${steam_id}/730/2?l=english&count=1000`,
        json: true,
        gzip: true
    })
    for (item in res['descriptions']) {
        market_name = res['descriptions'][item]['market_hash_name']
        if (market_name == 'Storage Unit') {
            instance_id = res['descriptions'][item]['instanceid']
            class_id = res['descriptions'][item]['classid']
            for (id_info in res['assets']) {
                if (res['assets'][id_info]['instanceid'] == instance_id && res['assets'][id_info]['classid'] == class_id) {
                    casket_assets.push(parseInt(res['assets'][id_info]['assetid']))
                }
            }
        }
    }
    console.log('Your Storage ids:\n' + casket_assets.join('\n'));
    work_casket = parseInt(rp.question('Select Storage id: '));
    casket_info = csgo.getCasketContents(work_casket, function(err, casket_items) {
        for (casket_item in casket_items) {
            csgo.removeFromCasket(work_casket, casket_items[casket_item]['id'])
            console.log(`Succesfully remove ${casket_items[casket_item]['id']} from Storage Unit (${work_casket})`);
            sleep(500)
        }
    })
}

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