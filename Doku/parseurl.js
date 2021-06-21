//INIT APP

const puppeteer = require('puppeteer');
const parse = require('json-to-query-string');

//CALL HELPER

const helper = require('./helper');

//INIT BROWSER

let client_id = 'bot1';
let browser = {};
let browser_args = {
    headless: false,
    userDataDir: "./browser_data_13578/" + client_id,
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
let parsed_bank;
let parsed_url;
let parsed_url_decoded;
let parsed_param;

/*==========================================================================================
											Start of Functions
==========================================================================================**/

async function ParseURL(req, res) {
    if (req.params.vendor) parsed_vendor = req.params.vendor;
    if (req.params.type) parsed_type = req.params.type;
    if (req.params.bank) parsed_bank = req.params.bank;
    if (req.params.url) parsed_url = req.params.url;
    if (req.params.param) parsed_param = req.params.param;
    result = [];

    // Overide for testing
    let parsed_param_decoded = '{"MALLID":"11847610","CHAINMERCHANT":"NA","AMOUNT":777700,"PURCHASEAMOUNT":777700,"TRANSIDMERCHANT":"0012800826","PAYMENTTYPE":"SALE","WORDS":"66810ab5503de859e94e09e4ced015c04a9bec61","REQUESTDATETIME":"20210208231346","CURRENCY":"360","PURCHASECURRENCY":"360","SESSIONID":"test_session","NAME":"LOREM IPSUM","EMAIL":"lorem@ipsum.com","ADDITIONALDATA":"","BASKET":"item 1,777700.00,1,777700.00","SHIPPING_ADDRESS":"","SHIPPING_CITY":"","SHIPPING_STATE":"","SHIPPING_COUNTRY":"","SHIPPING_ZIPCODE":"","PAYMENTCHANNEL":"","ADDRESS":null,"CITY":"","STATE":"","COUNTRY":"IDN","ZIPCODE":"","HOMEPHONE":"","MOBILEPHONE":"088812345678","WORKPHONE":"","BIRTHDATE":""}';
    let parsed_url_decoded = 'https://staging.doku.com/Suite/Receive';

    try {
        if (typeof browser[client_id] == 'undefined' || browser[client_id] === null) {

            browser[client_id] = await puppeteer.launch(browser_args);
            pages = await browser[client_id].pages(); // Initial pages
            page = pages[0];
            await page.setUserAgent('Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3264.0 Safari/537.36');
            await page.setViewport({
                width: 1440,
                height: 768
            });

            helper.debug('ParseURL() url decoded: ' + parsed_url_decoded);
            helper.debug('ParseURL() param decoded: ' + parsed_param_decoded);

            /*------------------------------v Start of Section v---------- */
            await page.setRequestInterception(true);
            page.once('request', interceptedRequest => {
                var data = {
                    'method': 'POST',
                    // 'postData': parsed_param_decoded,
                    'postData': parse(JSON.parse(parsed_param_decoded)),
                    headers: {
                        ...interceptedRequest.headers(),
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                };
                interceptedRequest.continue(data);
                page.setRequestInterception(false);
            });
            /*------------------------------^ End of Section ^---------- */

            // Go
            await page.goto(parsed_url_decoded, {
                waitUntil: 'networkidle2',
                timeout: 0
            }).then(async function() {
                helper.debug('ParseURL() checking element ' + parsed_type + ' for ' + parsed_vendor + '..');
                // Switch for type
                switch (parsed_vendor) {
                    case 'doku':
                        switch (parsed_type) {
                            case 'va':
                                /*------------------------------v Start of VA v---------- */
                                await page.waitForNavigation({ waitUntil: 'load' });
                                await page.click('#menu-banktransfer');
                                await page.waitFor(100);
                                switch (parsed_bank) {
                                    case 'danamon':
                                        await page.click('#formDanamonVA');
                                        break;
                                    case 'cimb':
                                        await page.click('#formSinarmas');
                                        break;
                                    case 'permata':
                                        await page.click('#formPermataMVA');
                                        break;
                                    case 'mandiri':
                                        await page.click('#formmandiriVA');
                                        break;
                                    case 'bca':
                                        await page.click('#formBCAVA');
                                        break;
                                    case 'bri':
                                        await page.click('#formBRIVA');
                                        break;
                                }
                                await page.waitForSelector('div[class="numva"]');
                                var element_found = await page.evaluate(() => document.querySelector('.numva').innerHTML);
                                if (element_found) {
                                    parsed_number = await helper.trimText(element_found);
                                    helper.debug('ParseURL() va found: ' + parsed_number);
                                } else {
                                    helper.debug('ParseURL() va not found');
                                }
                                result.push({
                                    status: '000',
                                    data: {
                                        payment_url: parsed_url_decoded,
                                        va_number: parsed_number,
                                    }
                                });
                                break;
                                /*------------------------------^ End of VA ^---------- */
                            case 'cstore':
                                /*------------------------------v Start of Convenience store v---------- */
                                await page.waitForNavigation({ waitUntil: 'load' });
                                await page.click('#menu-alfa');
                                await page.waitFor(100);
                                switch (parsed_bank) {
                                    case 'alfamart':
                                        await page.click('#formAlfaMVA');
                                        break;
                                    case 'indomaret':
                                        await page.click('#formIndomaret');
                                        break;
                                }
                                await page.waitForSelector('div[class="numva"]');
                                var element_found = await page.evaluate(() => document.querySelector('.numva').innerHTML);
                                if (element_found) {
                                    parsed_number = await helper.trimText(element_found);
                                    helper.debug('ParseURL() paycode found: ' + parsed_number);
                                } else {
                                    helper.debug('ParseURL() paycode not found');
                                }
                                result.push({
                                    status: '000',
                                    data: {
                                        payment_url: parsed_url_decoded,
                                        pay_code: parsed_number,
                                    }
                                });
                                break;
                                /*------------------------------^ End of Convenience store ^---------- */
                        }
                        break;
                }
                await page.close();
                await browser[client_id].close();
                browser[client_id] = null
            }).then(async function() {
                //
            }).catch(function(e) {
                return 'err ParseURL() ' + e.message;
            });
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(result[0]);
    } catch (e) {
        throw new Error('err ParseURL() ' + e.message);
    }
}

/*=================================   End of Functions   ==================================*/

//EXPORT FUNCTION

module.exports = {
    ParseURL
}