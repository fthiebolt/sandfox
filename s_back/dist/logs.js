"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Logs {
    constructor() {
        var fs = require('fs');
        var util = require('util');
        var log_file = fs.createWriteStream(__dirname + '/debug.log', { flags: 'w' });
        var log_stdout = process.stdout;
    }
    loggy(d) {
        this.log_file.write(this.util.format(d) + '\n');
        this.log_stdout.write(this.util.format(d) + '\n');
    }
    ;
}
exports.Logs = Logs;
