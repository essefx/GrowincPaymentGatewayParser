const puppeteer = require('puppeteer');
const parse = require('json-to-query-string');
//
const helper = require('../helper');
const config = require('./config.json');

let browser = {};
let browser_args = {
    headless: config.is_headless,
    userDataDir: "./browser_data/" + config.vendor_name + "/" + config.app_port + "/" + config.client_id,
    args: [
        '--no-sandbox',
        '--disable-infobars',
        '--window-position=50,50',
        '--window-size=1000,1000',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
    ],
    handleSIGHUP: false,
    handleSIGINT: false,
    handleSIGTERM: false,
};

let pages;
let page;
let parsed_vendor;
let parsed_type;
let parsed_channel;
let parsed_url, parsed_url_decoded;
let parsed_param, parsed_param_decoded;

/*------------------------------v Start of Parser v---------- */
async function Parser(req, res) {

    try {

        // Randomize process ID
        var date = new Date();
        var time = date.getTime();
        pid = config.client_id + '-' + config.app_port + '-' + time;

        // Debug
        helper.debug(pid, `---------- CREATE ----------`);

        // Init
        if (req.params.vendor) parsed_vendor = req.params.vendor;
        if (req.params.type) parsed_type = req.params.type;
        if (req.params.bank) parsed_channel = req.params.bank;
        if (req.params.url) parsed_url = req.params.url;
        if (req.params.param) parsed_param = req.params.param;
        result = [];

        // Decode & validate input
        let parsed_url_decoded = Buffer.from(parsed_url, 'base64').toString('ascii');
        if (!helper.stringIsAValidUrl(parsed_url_decoded)) {
            helper.debug(pid, `ERR Parser() invalid parsed_url_decoded: ${parsed_url_decoded}`);
            throw new Error(`Invalid URL ${parsed_url_decoded}`);
        }
        let parsed_param_decoded = Buffer.from(parsed_param, 'base64').toString('ascii');

        if (typeof browser[pid] == 'undefined' || browser[pid] === null) {

            browser[pid] = await puppeteer.launch(browser_args);
            pages = await browser[pid].pages(); // Initial pages
            page = pages[0];
            await page.setUserAgent('Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3264.0 Safari/537.36');
            await page.setViewport({
                width: 1440,
                height: 768
            });

            // Go
            await page.goto(parsed_url_decoded, {
                waitUntil: 'networkidle2',
                timeout: 0
            }).then(async function() {
                helper.debug(pid, `INFO Parser() checking element ${parsed_type} for ${parsed_vendor}`);
                await page.setDefaultNavigationTimeout(15000);
                // Switch for type
                switch (parsed_vendor) {
                    case 'tctp':
                        /*------------------------------v Start of 2C2P v---------- */
                        switch (parsed_type) {
                            case 'va':
                                /*------------------------------v Start of VA v---------- */
                                await page.waitForNavigation({ waitUntil: 'load' });
                                var element_found = await page.evaluate(() => document.querySelector('.code').innerHTML);
                                if (element_found) {
                                    parsed_number = await helper.trimText(element_found);
                                    helper.debug(pid, `INFO Parser() data found: ${parsed_number}`);
                                    result.push({
                                        status: '000',
                                        data: {
                                            payment_url: parsed_url_decoded,
                                            channel: parsed_channel,
                                            pay_code: parsed_number,
                                        }
                                    });
                                } else {
                                    throw new Error(`Data not found`);
                                }
                                break;
                                /*------------------------------^ End of VA ^---------- */
                        }
                        break;
                        /*------------------------------^ End of 2C2P ^---------- */
                    default:
                        throw new Error(`Undefined vendor ${parsed_vendor}`);
                }
            }).then(async function() {
                //
            }).catch(function(e) {
                result.push({
                    status: '001',
                    error: e.message,
                    data: {
                        payment_url: parsed_url_decoded,
                    }
                });
                helper.debug(pid, `ERR Parser() error occured:`, e.message, e.lineNumber);
            });
            //
            await page.close();
            await browser[pid].close();
            browser[pid] = null;
        }
    } catch (e) {
        result.push({
            status: '999',
            error: e.message,
            data: {
                payment_url: parsed_url_decoded,
            }
        });
        helper.debug(pid, `ERR Parser() error occured:`, e.message, e.lineNumber);
    }
    helper.debug(pid, `SUCCESS Parser() result:`, result);
    res.setHeader('Content-Type', 'application/json');
    res.send(result[0]);

}
/*------------------------------^ End of Parser ^---------- */

module.exports = {
    Parser
}