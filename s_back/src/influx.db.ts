import { ICapter, IData, IController, INotification } from "./interfaces";
import { UnitConv } from "./models";

import {FluxTableMetaData, FluxResultObserver, QueryApi, WriteApi, Point} from '@influxdata/influxdb-client'
import { InfluxDB } from '@influxdata/influxdb-client'
import { IBuilding } from "./interfaces/building";
import { string, boolean } from "joi";
import { random } from "colors";
import { cpus, type } from "os";
import { resolve } from "dns";
import { rejects } from "assert";

require('dotenv').config()

const DEMO = true; //demoMode else goes to NeoData
const TOKEN = process.env.INFLUX_TOKEN_DEMO;
const ORG = process.env.INFLUX_ORG_DEMO;
const BUCKET = process.env.INFLUX_BUCKET_DEMO;
const URL= process.env.INFLUX_URL_DEMO;

const DATADIR_PATH = './src/db-seeds/data-2019/'
const typeTab = ["Electricité","Calorie", "Air_comprimé"]

/**
 * @class InfluxDatabase
 * @description Used as Query / Writing API to InfluxDB, DEMO refers to private generated data DB
 */
export class InfluxDatabase{
    private client?: InfluxDB;
    private queryApi? : QueryApi;
    private writeApi? : WriteApi;
	constructor() {
    }
    /**
     * @method connectDB
     * @description Connects to selected DB (see const TOKEN URL ORG BUCKET) and creates query&writing Api
     * 
     */
    public connectDB(){
        try{
            console.log("Connecting to influxDB2.0 - DEMO")
            this.client = new InfluxDB({url: String(URL), token: TOKEN});
            this.queryApi = this.client.getQueryApi(String(ORG))
            this.writeApi = this.client.getWriteApi(String(ORG), String(BUCKET));	
            //typeTab.forEach(e=> this.writeJsonData(30, e))
            //this.writeJsonData();
            //this.tester()
        } catch (error){
            console.error("Unable to connect selected InfluxDB" + error)
        }
    }
    
    public async notifCheck(building:string, fluxCondition:string, type:string, latest:INotification|null): Promise<{name: string, value: number, date: Date}>{
        if(type === "calorie") type = "Calorie"
        //console.log("Type & fluxCondition : " + type + " _ " + fluxCondition)
        let fluxQuery = `from(bucket:"${BUCKET}") |> range(start:-30d) |> filter(fn:(r) => r.kind=="energy" and r.subID=="${type}" and r.building=="${building}" and ${fluxCondition}) |> last()`
        return new Promise((resolve,rejects) => {
            this.queryApi?.queryRows(fluxQuery, {
                next(row, tableMeta){
                    const b = tableMeta.toObject(row)
                    //first result is ok to resolve
                    if(!latest || (latest.seen_at && new Date(b._time)>latest.seen_at)) resolve({name:b.building, value:b._value/1000, date: new Date(b._time)});
                },
                error(error){
                    if(process.env.DEBUG) console.error('NOTIF CHECK QUERY FAILED', error)    
                    rejects(error)

                },complete(){
                    resolve({name:"", value:-1, date:new Date()})
                }
            })
        })
    }
    /**
     * 
     * @param type expects Electricité or Air_comprimé or Calorie as used in front
     * @param aBuilding "" or building name, if empty refers to allbuildings
     * @returns IBuilding[] with selected type 
     * @warning might change with NeoData
     * uncomment room lines + change IBuilding[] in front and back to add rooms
     */
    public async getBuildingsList(type: string, aBuilding : string): Promise<IBuilding[]>{
        let buildingList: IBuilding[] = []
            //Filters and type depends of tagsName choosed by NeoData when SGE added
            //Assuming subID will be : Électricité, Air_comprimé, Calorie
            //Assuming only last 30 days updated data wanted -> change range start
            //Assuming general building capters room is undefined or "general"
            let fluxQuery = 'from(bucket:"'+BUCKET+'") |> range(start:-30d) |> filter(fn:(r) => r.kind == "energy" and r.subID =="'+type+'" '
            if(aBuilding != "") fluxQuery += ' and r.building == "' + aBuilding + '" '
            fluxQuery += ') |> first()'
            
            return new Promise((resolve,rejects) => {
                this.queryApi?.queryRows(fluxQuery, {
                    next(row, tableMeta){
                        const b = tableMeta.toObject(row)
                        //if(b.room){ // error on undefined for now - 31/05/2020
                            //Si le résultat n'est pas dans la liste
                            let batString: string = b.building
                            //if(b.room) batString = b.building + "."+b.room //for room implement
                            //else batString = b.building
                            
                            if(!buildingList.find(e => e.name === batString)){
                                buildingList.push({name: batString, capterId:""})
                            } 
                        //} else {
                        //    throw new Error("B.room is -> " + b.room)
                        //}
                    },
                    error(error){
                        console.error('BUILDING LIST QUERY FAILED', error)    
                        rejects(error)
    
                    },complete(){
                        resolve(buildingList)
                    }
                })
            })
    }
    /**
     * @todo from/to system
     * @param buildings 
     * @param type 
     * @param from starting date
     * @param to ending date
     * @returns data IData with values : IData[], min, max & unit
     * can be last data or 30 days for now
     */
    async getData(buildings: IBuilding[]/* for later room usage*/, type: string, from?: Date, to?: Date, latest?:boolean): Promise<IData>{
        const maxDay = 30
        if(!this.queryApi) throw new Error("No queryApi available");

        let fluxQuery = 'from(bucket:"' + BUCKET + '")' ;
        if(from && from.getTime() < new Date().getTime()){
            //fluxQuery += `|> range(start: ${(from.getTime() - new Date().getTime())}sec)`;
            fluxQuery +=`|> range(start:${-maxDay}d) `;
        } else if(to){
            //TODO
        } else{
            fluxQuery +=`|> range(start:${-maxDay}d) `;
        }
        if(buildings.length > 0) { //not latest
            fluxQuery+='|> filter(fn:(r) => r.subID=="'+type+'" and  (r.building=="' + buildings[0].name+'" ';
            for(var i = 1; i<buildings.length;i++){
                fluxQuery+= ` or r.building=="${buildings[i].name}"`;
            }
            fluxQuery+= "))";
            if (latest) fluxQuery += "|> last()"
        } else { //latest data forall
            if(latest)
                fluxQuery += '|> filter(fn:(r) => r._measurement =="data" and r.subID=="'+type+'") |> last()';
            else fluxQuery += '|> filter(fn:(r) => r._measurement =="data" and r.subID=="'+type+'")'; //Testing
        }
        //console.log("GET DATA query - " + fluxQuery)
        const data: IData = {
            /*  */
            values : [],
            min: 100000,
            max: 0,
            unit: new UnitConv(type).getUnit()
        };
        return new Promise((resolve,rejects) => {
            this.queryApi?.queryRows(fluxQuery, {
                next(row, tableMeta){ //foreach results 
                    let d = tableMeta.toObject(row);
                    let index = data.values.findIndex(e=> e.name === d.building);
                    let value = d._value/1000
                    data.min = Math.min(data.min||100000, value)
                    data.max = Math.max(data.max||0, value)
                    //console.log(index + " " +d.building)
                    if( index>=0 ){
                        //console.log("worked")
                        data.values[index].data.push({value: value, date:d._time});
                    } else {
                        data.values.push({name : d.building, data: [{value:value, date:d._time}]});
                    }
                },
                error(error){
                    console.log('QUERY FAILED', error);
                    rejects(error)
                }, 
                complete(){
                    //console.log('QUERY FINISHED');
                    //console.log(data.values.length + " - " + data.values[0].name)
                    resolve(data)
                },
            })
        })
    }

    /**#################################################### */
    /* DATA GENERATION PART
    /* LOOK @data-gen.py for generator_$type.json modification.
    */

    /**
     * @method autoCheck
     * @param interval:number in minutes
     * @description first check at server launch then every interval (should be an hour or more). If last data found older than an hour, generates data for every types / building as in Generator_$type
     */
    public autoCheck(interval : number){ //interval in mins
        console.log("START AUTOCHECKING FOR DATAGENERATION - every " + interval + "min")
        this.dataCheck() //@start
        setInterval(this.dataCheck.bind(this), interval * 1000* 60)
    }
    /**
     * @method dataCheck
     * @description checks last time data were updated
     * @todo to end
     */
    public async dataCheck(){
        console.log("Auto checking for data-gen...")
        let fluxQuery = `from(bucket:"${BUCKET}") |> range(start:-30d) |> filter(fn:(r) => r.kind=="energy" ) |> last()`;
        let to = 0;
        let d = await new Promise<{check:boolean, to:number}>((resolve,rejects)=>{
            let OK : boolean = true ;
            this.queryApi?.queryRows(fluxQuery, {
                next(row, tableMeta){
                    const r = tableMeta.toObject(row);
                    let date = new Date(r._time).getTime();
                    let diff = (new Date().getTime() - date) ;
                    if(diff > 3600*1000){
                        OK = false;
                        to = diff/(3600*1000); //diff to sec
                    }
                },
                error(error){
                    console.error('NO DATA FOUND : ', error)    
                    rejects(error);
                },complete(){
                    //console.log(to);
                    //console.log(date);
                    resolve({check:OK, to:Math.floor(to)});
                }
            })
        }).catch((err)=> {
            console.error(err);
            return ({check:false, to: 720}); //No data found, need 30 days generation
        });
        if(!(d.check)){
            var i = 0
            while(i<typeTab.length){
                await this.writeJsonData(d.to, typeTab[i]).catch((err) => console.log(err));
                i++;
            }
        }
        
    }
    /**
     * @description uses generator_${type}.json files to generate data based on hours mean/std and or Day. See data-gen.py to make new generators / add more precise values
     * @param nbDays farest day for generation (free influx is 30 day maximum and about 50 000 max datas) - 1 data per hour for 30 days = 720 datas / building / type
     * @param type expects front type (Electricité, Calorie, Air_comprimé). Add new generator for new types
     */
    public async writeJsonData(nbHours:number = 720, type?:string){
        //Generates data for last nbDays
        const fs = require('fs');
        let fgen = fs.readFileSync(DATADIR_PATH+'generator_'+type+'.json');
        let _measurement = "data";
        let today = new Date();
        console.log(("Processing "+String(type).yellow+" data generation for last " + Math.round(nbHours/30) + " days and " + nbHours%30+ " hours ..."))
        fgen = await JSON.parse(fgen);
        for(var key in fgen){ //pour chaque building existant dans generator.json
            //console.log(`${key} - ${fgen[key]}`);
            let points:Point[] = [];
            for(var hour = 0 ; hour<Math.floor(nbHours); hour++){
                let date = new Date(today.getTime() - hour)
                let value = await fgen[key]["hour"][(date.getHours()-1)];
                value = await value["mean"] + value["std"] - value["std"]*Math.random();
                //console.log(value)

                //console.log(new Date(today.getTime()-(((hour+1)*3600)+(day)*86400)*1000).toDateString()) //TS calculation for each points based on hour and days (from earliest point to far)
                points.push(new Point(_measurement).tag("location", "ut3").tag("building",key).tag("room",String(undefined)).tag("unitID","DEMO_BLOCK").tag("subID", String(type)).tag("kind", "energy").timestamp(new Date(today.getTime()-((hour)*3600)*1000)).floatField("value", value));
            }
            this.writeApi?.writePoints(points);
        }
        //console.log(points[0].toLineProtocol()); //get line protocol in server console if needed
    }

}