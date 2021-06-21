// Init app
var express = require('express');
var app = express();
var puppeteer = require('puppeteer');
var moment = require('moment');

// Init browser
var app_port = 13579;
var client_id = 'bot1';
var browser = {};
var browser_args = {
	headless: true,
	userDataDir: "./browser_data/" + client_id,
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
//
var pages;
var page;
//
var parsed_vendor;
var parsed_type;
var parsed_url;
var parsed_url_decoded;
//
var result = [];



/*==========================================================================================
								 Start of Routes
==========================================================================================**/

	app.get('/', async function(req, res) {
		res.send('PG parser');
	});

	app.get('/parse/:vendor/:type/:url', async function (req, res) {
		await process.stdout.write('\033c');
		if (req.params.vendor) parsed_vendor = req.params.vendor;
		if (req.params.type) parsed_type = req.params.type;
		if (req.params.url) parsed_url = req.params.url;
		//
		await ParseURL();
		res.setHeader('Content-Type', 'application/json');
		res.send(result[0]);
	});

	app.listen(app_port, () => debug(`ParseURL listening on port ${app_port}!`));

	module.exports = init;

/*=================================   End of Routes   ==================================*/



/*==========================================================================================
								 Start of Functions
==========================================================================================**/

	(async () => {
		init();
	})();

	async function init() {
		//
	}

	async function ParseURL() {
		try {
			result = [];
			// Randomize client_id
			var date = new Date();
			var time = date.getTime();
			client_id = time;
			//
			let data = parsed_url;
			let buff = new Buffer(data, 'base64');
			let parsed_url_decoded = buff.toString('ascii');
			//
debug('ParseURL() parsing: ' + parsed_url_decoded);
			parsed_data = [];
			if (typeof browser[client_id] == 'undefined' || browser[client_id] === null) {
				browser[client_id] = await puppeteer.launch(browser_args);
				pages = await browser[client_id].pages(); // Initial pages
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
				}).then(async function () {
debug('ParseURL() checking element..');
					await page.waitFor(3000);
					var element_found = await page.evaluate(() => document.querySelector('span[class="code"]').innerHTML); // Check if form exists
					if (element_found) {
						parsed_number = await trimText(element_found);
debug('ParseURL() element found: ' + parsed_number);
						result.push({
							status: '000',
							data: {
								payment_url: parsed_url_decoded,
								va_number: parsed_number,
							}
						});
debug('ParseURL() result: ');
debug(result);
					}
					await browser[client_id].close();
				}).then(async function () {
				}).catch(function (e) {
					return 'err ParseURL() ' + e.message;
				});
			}
		} catch (e) {
			throw new Error('err ParseURL() ' + e.message);
		}
	}

	async function findText(page, selector, text) {
		try {
			var el = await page.$$(selector);
	debug('findText() looking for: "' + text + '" in #' + selector);
			for (let i = 0; i < el.length; i++) {
	debug('findText() el.length: ' + el.length);
				let html = await (await el[i].getProperty('textContent')).jsonValue();
				html = await trimText(html);
				if (html.indexOf(text.toLowerCase()) > -1) {
	debug('findText() found: ' + text + ': ' + html);
					return html;
				}
			}
		} catch (e) {
			throw new Error('ERR findText() ' + e.message);
		}
	}

/*=================================   End of Functions   ==================================*/



/*==========================================================================================
											Start of Helper
==========================================================================================**/

	async function debugPages(pages) {
		for (let i = 0; i < pages.length; i++) {
	debug('Page#' + i + ', URL:' + pages[i].url() + ', Content:' + (await pages[i].content()));
		}
	}

	async function trimText(html) {
		html = html.replace(/\r\n|\r/g, "\n");
		html = html.replace(/\ +/g, " ");
		html = html.trim();
		html = html.replace(/^\s+|\s+$/gm, ''); // Trim spaces
		html = html.replace(/(\r\n|\n|\r)/gm, ""); // Trim line breaks
		return html;
	}

	function sleep(ms) {
		return new Promise(resolve => {
			setTimeout(resolve, ms)
		})
	}

	function debug(msg1, msg2, msg3) {
		console.log(moment().format("YYYY/MM/DD hh:mm:ss"), msg1, (msg2 !== undefined ? msg2 : ''), (msg3 !== undefined ? msg3 : ''));
	}

/*=================================   End of Helper   ==================================*/
