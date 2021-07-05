const express = require('express');
const helper = require('./helper');
//
const vendors = [
    'Doku',
    //  'Faspay',
    //  'iPay88',
    //  'TCTP',
];

/*------------------------------v Start of Each Vendors v---------- */
vendors.forEach(vendor => {
    const app = express();
    const config = require(`./${vendor}/config.json`);
    const parser = require(`./${vendor}/parser`);
    //
    const port = config.app_port;
    //
    app.get('/', async function(req, res) {
        res.send(`Parser.JS for ${vendor}`);
    });
    app.get('/parse/:vendor/:type/:bank/:url/:param', parser.Parser);
    app.listen(port, () => helper.debug('BOOT', `Parser.JS for ${vendor} listening on port: ${port}`));
});
/*------------------------------^ End of Each Vendors ^---------- */