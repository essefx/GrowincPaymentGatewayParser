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

    let parsed_param_decoded = '{"MALLID":"11847610","CHAINMERCHANT":"NA","AMOUNT":777700,"PURCHASEAMOUNT":777700,"TRANSIDMERCHANT":"0012800826","PAYMENTTYPE":"SALE","WORDS":"66810ab5503de859e94e09e4ced015c04a9bec61","REQUESTDATETIME":"20210208231346","CURRENCY":"360","PURCHASECURRENCY":"360","SESSIONID":"test_session","NAME":"LOREM IPSUM","EMAIL":"lorem@ipsum.com","ADDITIONALDATA":"","BASKET":"item 1,777700.00,1,777700.00","SHIPPING_ADDRESS":"","SHIPPING_CITY":"","SHIPPING_STATE":"","SHIPPING_COUNTRY":"","SHIPPING_ZIPCODE":"","PAYMENTCHANNEL":"","ADDRESS":null,"CITY":"","STATE":"","COUNTRY":"IDN","ZIPCODE":"","HOMEPHONE":"","MOBILEPHONE":"088812345678","WORKPHONE":"","BIRTHDATE":""}';
    let parsed_url_decoded = 'https://staging.doku.com/Suite/Receive';

    try {
        if (typeof browser[client_id] == 'undefined' || browser[client_id] === null) {
            browser[client_id] = await puppeteer.launch(browser_args);
            // console.log(browser[client_id]);
            pages = await browser[client_id].pages(); // Initial pages
            page = pages[0];
            await page.setUserAgent('Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3264.0 Safari/537.36');
            await page.setViewport({
                width: 1440,
                height: 768
            });

            helper.debug('ParseURL() url decoded: ' + parsed_url_decoded);
            helper.debug('ParseURL() param decoded: ' + parsed_param_decoded);
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
            // }
            // Go
            await page.goto(parsed_url_decoded, {
                waitUntil: 'networkidle2',
                timeout: 0
            }).then(async function () {
                // console.log('test');
                helper.debug('ParseURL() checking element ' + parsed_type + ' for ' + parsed_vendor + '..');
                // Switch for type
                switch (parsed_vendor) {
                    case 'doku':
                        switch (parsed_type) {
                            case 'va':
                                switch (parsed_bank) {
                                    case 'danamon':
                                        // await page.waitFor(3000);
                                        await page.waitForNavigation({ waitUntil: 'load' });
                                        await page.click('#menu-banktransfer');
                                        await page.waitFor(100);
                                        await page.click('#formDanamonVA');
                                        await page.waitFor(3000);
                                        var element_found = await page.evaluate(() => document.querySelector('.numva').innerHTML);
                                        // console.log(element_found);
                                        await page.close();
                                        await browser[client_id].close();

                                        if (element_found) {
                                            parsed_number = await helper.trimText(element_found);
                                            helper.debug('ParseURL() va found: ' + parsed_number);


                                            // debug('ParseURL() result: ');
                                            // debug(result);
                                        } else {
                                            helper.debug('ParseURL() va not found');
                                        }

                                        result.push({
                                            status: '000',
                                            data: {
                                                payment_url: parsed_url_decoded,
                                                va_number: {
                                                    danamon: parsed_number,
                                                },
                                            }
                                        });
                                        break;

                                    case 'cimb':
                                        // await page.waitFor(3000);
                                        await page.waitForNavigation({ waitUntil: 'load' });
                                        await page.click('#menu-banktransfer');
                                        await page.waitFor(100);
                                        await page.click('#formSinarmas');
                                        await page.waitFor(3000);
                                        var element_found = await page.evaluate(() => document.querySelector('.numva').innerHTML);
                                        console.log(element_found);
                                        await page.close();
                                        await browser[client_id].close();

                                        if (element_found) {
                                            parsed_number = await helper.trimText(element_found);
                                            helper.debug('ParseURL() va found: ' + parsed_number);


                                            // debug('ParseURL() result: ');
                                            // debug(result);
                                        } else {
                                            helper.debug('ParseURL() va not found');
                                        }

                                        result.push({
                                            status: '000',
                                            data: {
                                                payment_url: parsed_url_decoded,
                                                va_number: {
                                                    cimb: parsed_number,
                                                },
                                            }
                                        });
                                        break;

                                    case 'permata':
                                        // await page.waitFor(3000);
                                        await page.waitForNavigation({ waitUntil: 'load' });
                                        await page.click('#menu-banktransfer');
                                        await page.waitFor(100);
                                        await page.click('#formPermataMVA');
                                        await page.waitFor(3000);
                                        var element_found = await page.evaluate(() => document.querySelector('.numva').innerHTML);
                                        console.log(element_found);
                                        await page.close();
                                        await browser[client_id].close();

                                        if (element_found) {
                                            parsed_number = await helper.trimText(element_found);
                                            helper.debug('ParseURL() va found: ' + parsed_number);


                                            // debug('ParseURL() result: ');
                                            // debug(result);
                                        } else {
                                            helper.debug('ParseURL() va not found');
                                        }

                                        result.push({
                                            status: '000',
                                            data: {
                                                payment_url: parsed_url_decoded,
                                                va_number: {
                                                    permata: parsed_number,
                                                },
                                            }
                                        });
                                        break;

                                    case 'mandiri':
                                        // await page.waitFor(3000);
                                        await page.waitForNavigation({ waitUntil: 'load' });
                                        await page.click('#menu-banktransfer');
                                        await page.waitFor(100);
                                        await page.click('#formmandiriVA');
                                        await page.waitFor(3000);
                                        var element_found = await page.evaluate(() => document.querySelector('.numva').innerHTML);
                                        console.log(element_found);
                                        await page.close();
                                        await browser[client_id].close();

                                        if (element_found) {
                                            parsed_number = await helper.trimText(element_found);
                                            helper.debug('ParseURL() va found: ' + parsed_number);


                                            // debug('ParseURL() result: ');
                                            // debug(result);
                                        } else {
                                            helper.debug('ParseURL() va not found');
                                        }

                                        result.push({
                                            status: '000',
                                            data: {
                                                payment_url: parsed_url_decoded,
                                                va_number: {
                                                    mandiri: parsed_number,
                                                },
                                            }
                                        });
                                        break;

                                    case 'bca':
                                        // await page.waitFor(3000);
                                        await page.waitForNavigation({ waitUntil: 'load' });
                                        await page.click('#menu-banktransfer');
                                        await page.waitFor(100);
                                        await page.click('#formBCAVA');
                                        await page.waitFor(3000);
                                        var element_found = await page.evaluate(() => document.querySelector('.numva').innerHTML);
                                        console.log(element_found);
                                        await page.close();
                                        await browser[client_id].close();

                                        if (element_found) {
                                            parsed_number = await helper.trimText(element_found);
                                            helper.debug('ParseURL() va found: ' + parsed_number);


                                            // debug('ParseURL() result: ');
                                            // debug(result);
                                        } else {
                                            helper.debug('ParseURL() va not found');
                                        }

                                        result.push({
                                            status: '000',
                                            data: {
                                                payment_url: parsed_url_decoded,
                                                va_number: {
                                                    bca: parsed_number,
                                                },
                                            }
                                        });
                                        break;

                                    case 'bri':
                                        // await page.waitFor(3000);
                                        await page.waitForNavigation({ waitUntil: 'load' });
                                        await page.click('#menu-banktransfer');
                                        await page.waitFor(100);
                                        await page.click('#formBRIVA');
                                        await page.waitFor(3000);
                                        var element_found = await page.evaluate(() => document.querySelector('.numva').innerHTML);
                                        console.log(element_found);
                                        await page.close();
                                        await browser[client_id].close();

                                        if (element_found) {
                                            parsed_number = await helper.trimText(element_found);
                                            helper.debug('ParseURL() va found: ' + parsed_number);


                                            // debug('ParseURL() result: ');
                                            // debug(result);
                                        } else {
                                            helper.debug('ParseURL() va not found');
                                        }

                                        result.push({
                                            status: '000',
                                            data: {
                                                payment_url: parsed_url_decoded,
                                                va_number: {
                                                    bri: parsed_number,
                                                },
                                            }
                                        });
                                        break;
                                }
                                break;

                            case 'convenience':
                                switch (parsed_bank) {
                                    case 'indomaret':
                                        // await page.waitFor(3000);
                                        await page.waitForNavigation({ waitUntil: 'load' });
                                        await page.click('#menu-alfa');
                                        await page.waitFor(200);
                                        await page.click('#formIndomaret');
                                        await page.waitFor(3000);
                                        var element_found = await page.evaluate(() => document.querySelector('.numva').innerHTML);
                                        console.log(element_found);
                                        await page.close();
                                        await browser[client_id].close();

                                        if (element_found) {
                                            parsed_number = await helper.trimText(element_found);
                                            helper.debug('ParseURL() va found: ' + parsed_number);


                                            // debug('ParseURL() result: ');
                                            // debug(result);
                                        } else {
                                            helper.debug('ParseURL() va not found');
                                        }

                                        result.push({
                                            status: '000',
                                            data: {
                                                payment_url: parsed_url_decoded,
                                                va_number: {
                                                    indomaret: parsed_number,
                                                },
                                            }
                                        });
                                        break;

                                    case 'alfamart':
                                        // await page.waitFor(3000);
                                        await page.waitForNavigation({ waitUntil: 'load' });
                                        await page.click('#menu-alfa');
                                        await page.waitFor(200);
                                        await page.click('#formAlfaMVA');
                                        await page.waitFor(3000);
                                        var element_found = await page.evaluate(() => document.querySelector('.numva').innerHTML);
                                        console.log(element_found);
                                        await page.close();
                                        await browser[client_id].close();

                                        if (element_found) {
                                            parsed_number = await helper.trimText(element_found);
                                            helper.debug('ParseURL() va found: ' + parsed_number);


                                            // debug('ParseURL() result: ');
                                            // debug(result);
                                        } else {
                                            helper.debug('ParseURL() va not found');
                                        }

                                        result.push({
                                            status: '000',
                                            data: {
                                                payment_url: parsed_url_decoded,
                                                va_number: {
                                                    alfamart: parsed_number,
                                                },
                                            }
                                        });
                                        break;
                                }
                                break;
                        }
                        // console.log(browser[client_id]);
                        browser[client_id] = null
                        break;
                }

            }).then(async function () {
            }).catch(function (e) {
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