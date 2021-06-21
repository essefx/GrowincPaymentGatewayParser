// INIT APP

const moment = require('moment');

/*==========================================================================================
											Start of Helper
==========================================================================================**/

function debug(msg1, msg2, msg3) {
    console.log(moment().format("YYYY/MM/DD hh:mm:ss"), msg1, (msg2 !== undefined ? msg2 : ''), (msg3 !== undefined ? msg3 : ''));
}

async function trimText(html) {
    html = html.replace(/\r\n|\r/g, "\n");
    html = html.replace(/\ +/g, " ");
    html = html.trim();
    html = html.replace(/^\s+|\s+$/gm, ''); // Trim spaces
    html = html.replace(/(\r\n|\n|\r)/gm, ""); // Trim line breaks
    return html;
}

/*=================================   End of Helper   ==================================*/

//EXPORT HELPER

module.exports = {
    debug,
    trimText
}