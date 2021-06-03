"use strict";
/**
 * Loads any lists that would normally be loaded/updated on the fly
 * in the app/extension
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const request = require('request');
const fs = require('fs');
const baseUrl = 'https://duckduckgo.com/contentblocking';
const listsToLoad = {
    surrogates: `${baseUrl}.js?l=surrogates`,
    entityList: `${baseUrl}/entityList.json`,
    trackerList: `${baseUrl}/trackerList.json`
};
let loadedLists = {};
let load = (listName) => {
    return new Promise((resolve, reject) => {
        request({
            method: 'get',
            url: listsToLoad[listName],
            gzip: true
        }, (err, res, body) => {
            if (err) {
                return reject(err);
            }
            let response;
            // parse JSON response if it's JSON (some are plain text)
            try {
                response = JSON.parse(body);
            }
            catch (e) {
                response = body;
            }
            resolve(response);
        });
    });
};
let getSymlinkedLocalList = (fileName) => {
    let path = `data/symlinked/${fileName}`;
    let list;
    try {
        list = fs.readFileSync(path, { encoding: 'utf8' });
    }
    catch (e) {
        console.warn(`couldn't find and parse list ${fileName}, tried looking in: ${path}`);
        return;
    }
    if (fileName.match(/\.txt$/)) {
        list = list.trim().split('\n');
    }
    else if (fileName.match(/\.json$/)) {
        list = JSON.parse(list);
    }
    return list;
};
let loadLists = () => __awaiter(void 0, void 0, void 0, function* () {
    for (let listName in listsToLoad) {
        loadedLists[listName] = yield load(listName);
    }
    // large https lists don't have an endpoint just yet
    loadedLists.https = getSymlinkedLocalList('https_list.txt');
    loadedLists.httpsAutoUpgrade = getSymlinkedLocalList('https_autoupgrade_list.txt');
});
let getList = (listName) => loadedLists[listName];
module.exports = {
    loadLists,
    getList
};
//# sourceMappingURL=list-manager.js.map