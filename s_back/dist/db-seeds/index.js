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
const dotenv_1 = require("dotenv");
require("colors");
const capter_1 = require("../models/capter");
const database_1 = require("../database");
const unit_1 = require("../models/unit");
const import_data_1 = require("./import-data");
const capters_1 = require("./capters");
const units_1 = require("./units");
/**
 * @deprecated OLD, used with mongo based app (see 0.1.0)
 * kept in case of db change
 */
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        dotenv_1.config();
        const database = new database_1.Database();
        yield database.connect({ useNewUrlParser: true });
        for (let i = 0; i < capters_1.captersList.length; i++) {
            const e = capters_1.captersList[i];
            const Capter = capter_1.capterModel(e.name);
            yield Capter.insertMany(e.list);
            yield import_data_1.dataExporter(e.name, e.name + '.json');
        }
        yield unit_1.Unit.insertMany(units_1.units);
        console.log("SUCCESS".bgGreen);
        process.exit(0);
    }
    catch (err) {
        console.log('Failed to export data');
        console.log(err);
    }
}))();
