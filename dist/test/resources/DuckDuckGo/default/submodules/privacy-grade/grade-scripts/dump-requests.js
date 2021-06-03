"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const puppeteer = require('puppeteer');
const listManager = require('./shared/list-manager');
const scriptUtils = require('./shared/utils');
const program = require('commander');
const fs = require('fs');
const execSync = require('child_process').execSync;
const chalk = require('chalk');
const https = require('../src/https');
const trackers = require('../src/trackers');
const surrogates = require('../src/surrogates');
let browser;
program
    .option('-f, --file <name>', 'Text file with newline-separated hostnames (required)')
    .option('-o, --output <name>', 'Output name, e.g. "test" will output files at "test-sites" (required)')
    .option('-t, --allow-trackers', 'Don\'t run tracker blocking')
    .parse(process.argv);
const fileName = program.file;
const output = program.output;
const outputPath = `${output}-sites`;
const allowTrackers = program.allowTrackers;
if (!fileName || !output) {
    return program.help();
}
const handleRequest = (requests, siteToCheck, request) => {
    let url = request.url();
    let type = request.resourceType();
    // we don't care about main frame requests
    if (type === 'document') {
        request.continue();
        return;
    }
    // is this request from an iframe?
    let frame = request.frame();
    let frameUrl = null;
    // parentFrame() returns null when frame is top
    if (frame && frame.parentFrame()) {
        frameUrl = frame.url();
    }
    requests.push([url, type, frameUrl]);
    let upgradedUrl;
    let tracker;
    try {
        upgradedUrl = https.getUpgradedUrl(url);
    }
    catch (e) {
        console.log(`error getting HTTPS upgraded URL for ${url}: ${e.message}`);
    }
    if (upgradedUrl && url !== upgradedUrl) {
        url = upgradedUrl;
    }
    try {
        tracker = trackers.isTracker(url, siteToCheck, type);
    }
    catch (e) {
        console.log(`error getting tracker for ${url}: ${e.message}`);
    }
    if (tracker && tracker.block && !allowTrackers) {
        if (tracker.redirectUrl) {
            url = tracker.redirectUrl;
        }
        else {
            request.abort();
            return;
        }
    }
    request.continue({
        url: url
    });
};
const setup = () => __awaiter(void 0, void 0, void 0, function* () {
    // load any lists and plug them into any classes that wait for them
    yield listManager.loadLists();
    https.addLists(listManager.getList('https'));
    trackers.addLists({
        entityList: listManager.getList('entityList'),
        whitelist: listManager.getList('whitelist')
    });
    surrogates.addLists(listManager.getList('surrogates'));
    // set up headless browser
    browser = yield puppeteer.launch({
        args: ['--no-sandbox']
    });
    execSync(`mkdir -p ${outputPath}`);
});
const teardown = () => __awaiter(void 0, void 0, void 0, function* () {
    yield browser.close();
});
const refreshBrowser = () => __awaiter(void 0, void 0, void 0, function* () {
    yield browser.close();
    browser = yield puppeteer.launch({
        args: ['--no-sandbox']
    });
});
const getSiteData = (siteToCheck) => __awaiter(void 0, void 0, void 0, function* () {
    const page = yield browser.newPage();
    const url = `http://${siteToCheck}`;
    let requests = [];
    let failed = false;
    let userAgent = yield browser.userAgent();
    yield page.emulate({
        // just in case some sites block headless visits
        userAgent: userAgent.replace('Headless', ''),
        viewport: {
            width: 1440,
            height: 812
        }
    });
    yield page.setRequestInterception(true);
    page.on('request', handleRequest.bind(null, requests, siteToCheck));
    page.on('response', (response) => {
        if (!scriptUtils.responseIsOK(response, siteToCheck)) {
            console.log(chalk.red(`got ${response.status()} for ${response.url()}`));
            failed = true;
        }
    });
    // if any prompts open on page load, they'll make the page hang unless closed
    page.on('dialog', (dialog) => {
        dialog.dismiss();
    });
    // wait for the page to load and then an extra 3s, to be sure
    try {
        yield page.goto(url, { timeout: 10000, waitUntil: 'load' });
    }
    catch (e) {
        console.log(chalk.red(`timed out for ${url}`));
    }
    yield page.waitFor(3000);
    page.removeAllListeners();
    yield page.close();
    // ignore requests for failed pages (e.g. if we saw their 404 page)
    if (failed) {
        requests = [];
    }
    return { url, requests };
});
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    let sites;
    try {
        sites = fs.readFileSync(fileName, { encoding: 'utf8' }).trim().split('\n');
    }
    catch (e) {
        console.log(chalk.red(`Error getting sites from file ${fileName}: ${e.message}`));
        return;
    }
    yield setup();
    let sitesChecked = 0;
    let rank = 0;
    for (let siteToCheck of sites) {
        let failed = false;
        rank += 1;
        if (sitesChecked && sitesChecked % 20 === 0) {
            console.log(`checked ${sitesChecked}, refreshing browser instance...`);
            yield refreshBrowser();
        }
        if (scriptUtils.dataFileExists(siteToCheck, outputPath))
            continue;
        let data = yield getSiteData(siteToCheck);
        sitesChecked += 1;
        if (!data.requests.length) {
            console.log(chalk.red(`couldn't get requests for ${siteToCheck}`));
            failed = true;
        }
        if (failed) {
            data = { url: `http://${siteToCheck}`, failed: true };
        }
        else {
            console.log(chalk.green(`got ${data.requests.length} requests for ${siteToCheck}`));
            data.hasIFrameRequests = data.requests.some((requestData) => !!requestData[2]);
        }
        data.rank = rank;
        fs.writeFileSync(`${outputPath}/${siteToCheck}.json`, JSON.stringify(data));
    }
    yield teardown();
});
run();
//# sourceMappingURL=dump-requests.js.map