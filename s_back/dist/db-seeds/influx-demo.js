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
exports.JExtract = void 0;
const fs = require('fs');
[];
class JExtract {
    constructor() {
        //this.fList()
        console.log("done");
    }
    treatFile(fn) {
        return __awaiter(this, void 0, void 0, function* () {
            let OutData = [];
            try {
                yield fs.readFile(fn, (err, data) => {
                    console.log("Processing File...");
                    let jData = JSON.parse(data);
                    let currentDate = "";
                    let index = 0;
                    console.log(jData.length);
                    jData.forEach((e) => {
                        if (e.TS !== currentDate) {
                            OutData.push({ TS: e.TS, values: [{ capter: e.Name, value: parseFloat(e.Value) }] });
                            index++;
                        }
                        else {
                            OutData[index].values.push({ capter: e.Name, value: parseFloat(e.Value) });
                        }
                    });
                }); //ERR, where ?
                console.log("Finally : " + OutData.length);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    mergeFiles(f1, f2) {
        for (var i = 0; i < f2.length; i++) {
            f1[i].values.concat(f2[i].values);
        }
        return f1;
    }
    fList() {
        return __awaiter(this, void 0, void 0, function* () {
            let fl = ["./src/db-seeds/data-2019/2-ba.json", "./src/db-seeds/data-2019/2-bat.json", "./src/db-seeds/data-2019/2b.json",
                "./src/db-seeds/data-2019/2bat.json", "./src/db-seeds/data-2019/3bat.json", "./src/db-seeds/data-2019/3batiments.json", "./src/db-seeds/data-2019/4bat.json",
                "./src/db-seeds/data-2019/5bat.json", "./src/db-seeds/data-2019/8bat.json", "./src/db-seeds/data-2019/9bat.json"];
            let f1 = this.treatFile("./src/db-seeds/data-2019/1bat.json");
            fl.forEach(f2 => {
                this.mergeFiles(f1, this.treatFile(f2));
            });
            return f1;
        });
    }
}
exports.JExtract = JExtract;
