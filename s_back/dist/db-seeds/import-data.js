"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataExporter = void 0;
const lodash_1 = require("lodash");
const fs_1 = require("fs");
const data_1 = require("../models/data");
const moment = require("moment");
/**
 * @deprecated OLD, used with mongo based app (see 0.1.0)
 * kept in case of db change
 */
exports.dataExporter = ((type, filename) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: get the input json file as a parameter
    try {
        let dataToExport = fs_1.readFileSync(__dirname + '/' + filename);
        console.log(`[${type}] Fichier chargé`.blue);
        dataToExport = JSON.parse(dataToExport);
        dataToExport = yield Promise.all(dataToExport.map((e, i) => __awaiter(void 0, void 0, void 0, function* () {
            return (yield Promise.all(Object.keys(e)
                .map(key => ({
                name: key.toString(),
                value: Number(e[key]),
                date: moment(e.date, "DD/MM/YYYY hh:mm:ss").toDate()
            })))).filter(e => e && e.value && !isNaN(e.value) && e.date instanceof Date && !isNaN(e.date.getTime()));
        })));
        dataToExport = lodash_1.flatten(dataToExport);
        dataToExport = lodash_1.sortBy(dataToExport, e => e.date);
        const seperatedData = seperateByName(dataToExport);
        const keys = Object.keys(seperatedData);
        let res = [];
        for (let j = 0; j < keys.length; ++j) {
            const resp = counterToDaily(seperatedData[keys[j]]);
            res.push(resp);
        }
        res = lodash_1.flatten(res);
        console.log(`[${type}] Trasformed data`.cyan);
        const Data = data_1.dataModel(type);
        yield Data.insertMany(res);
        console.log(`[${type}] Success`.green);
    }
    catch (err) {
        if (err) {
            console.log('Failed'.red);
            console.log(err);
        }
        else {
        }
    }
}));
function seperateByName(arr) {
    const res = {};
    for (let i = 0; i < arr.length; i++) {
        const e = arr[i];
        if (!res[e.name]) {
            res[e.name] = [];
        }
        res[e.name].push(e);
    }
    return res;
}
function counterToDaily(arr) {
    const res = [];
    let prev = arr[0];
    let firstIndex = 0;
    for (let i = 0; i < arr.length; i++) {
        prev = arr[i];
        if (prev) {
            firstIndex = i;
            break;
        }
    }
    let time = prev.date.getTime() + (1000 * 60 * 60);
    let dataMissingCounter = 0;
    // DEBUG
    let b = true;
    let reset = 0;
    for (let i = firstIndex + 1; i < arr.length; i++) {
        const e = arr[i];
        if (time != e.date.getTime()) {
            dataMissingCounter += Math.abs(e.date.getTime() - time) / (1000 * 60 * 60);
            time = e.date.getTime();
        }
        if (time == e.date.getTime() && e.value && !isNaN(e.value) && e.value >= prev.value) {
            if (dataMissingCounter) {
                // Calculate the delta and push element to the array and finally reset the counter
                const delta = Math.abs(e.value - prev.value);
                const value = delta / dataMissingCounter;
                for (let j = 0; j <= dataMissingCounter; j++) {
                    res.push({
                        name: e.name,
                        date: new Date(prev.date.getTime() + (j * (1000 * 60 * 60))),
                        value
                    });
                }
                dataMissingCounter = 0;
            }
            else {
                res.push({
                    name: e.name,
                    value: e.value - prev.value,
                    date: e.date
                });
            }
            prev = e;
            time += 1000 * 60 * 60; // +1 hour
        }
        else if (e.value && !isNaN(e.value) && e.value < prev.value) {
            // TODO: check if i should see 10 or 20 element forward to detect errors or it's fine
            reset++;
            prev = e;
            e.value = 0;
            dataMissingCounter++;
        }
        else {
            console.log('Blocked'.rainbow);
        }
    }
    return res;
}
