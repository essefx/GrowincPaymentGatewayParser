// INIT APP

const express = require('express');
const app = express();

const app_port = 13578;

// CALL CONTROLLER AND HELPER

const helper = require('./helper');
const parseurl = require('./parseurl')

// END INIT APP

/*==========================================================================================
                                 Start of Routes
==========================================================================================**/

app.get('/', async function (req, res) {
    res.send('PG parser');
});

app.get('/parse/:vendor/:type/:bank/:url/:param', parseurl.ParseURL);

app.listen(app_port, () => helper.debug(`ParseURL listening on port ${app_port}!`));

/*=================================   End of Routes   =====================================*/