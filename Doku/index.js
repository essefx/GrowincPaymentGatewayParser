// INIT APP

const express = require('express');
const app = express();

// CALL CONTROLLER AND HELPER

const parser = require('./parser');
const helper = require('./helper');
const config = require('./config.json');

let app_port = config.app_port;

// END INIT APP

/*==========================================================================================
                                 Start of Routes
==========================================================================================**/

app.get('/', async function(req, res) {
    res.send('PG parser');
});

app.get('/parse/:vendor/:type/:bank/:url/:param', parser.Parser);

app.listen(app_port, () => helper.debug(`Parser listening on port ${app_port}!`));

/*=================================   End of Routes   =====================================*/