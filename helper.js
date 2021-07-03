const moment = require('moment');
const url = require("url").URL;
const fs = require('fs');

/*------------------------------v Start of Helper v---------- */

function debug(pid, msg1, msg2 = '', msg3 = '') {
    let time = moment().format("YYYY/MM/DD hh:mm:ss");
    console.log(time, msg1, msg2, msg3);
    let date = moment().format("YYYY-MM-DD");
    appendLog('./_/' + date + '.txt', "\r\n" + time + ' ' + pid + ' ' + JSON.stringify([msg1, msg2, msg3]));
}

async function trimText(html) {
    html = html.replace(/\r\n|\r/g, "\n");
    html = html.replace(/\ +/g, " ");
    html = html.trim();
    html = html.replace(/^\s+|\s+$/gm, ''); // Trim spaces
    html = html.replace(/(\r\n|\n|\r)/gm, ""); // Trim line breaks
    return html;
}

const stringIsAValidUrl = (s) => {
    try {
        new URL(s);
        return true;
    } catch (err) {
        return false;
    }
};

function isJson(item) {
    item = typeof item !== "string" ?
        JSON.stringify(item) :
        item;
    try {
        item = JSON.parse(item);
    } catch (e) {
        return false;
    }
    if (typeof item === "object" && item !== null) {
        return true;
    }
    return false;
}

function appendLog(file, content) {
    fs.appendFile(file, content, err => {
        if (err) {
            console.error(err)
            return
        }
    })
}

/*------------------------------^ End of Helper ^---------- */

//EXPORT HELPER

module.exports = {
    debug,
    trimText,
    stringIsAValidUrl,
    isJson,
    appendLog
}