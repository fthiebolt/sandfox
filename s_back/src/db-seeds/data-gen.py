import json
import datetime
import numpy as np
import os
import random
from scipy.stats import norm 

random.seed(os.urandom(12))
path = './src/db-seeds/data-2019/'
d_type = ["cal", "airc"]
rFile = 'result.json'

dmin= datetime.datetime.strptime("2018-12-18 11:00:00.000", '%Y-%m-%d %H:%M:%S.%f')
dmax = datetime.datetime.strptime("2019-05-21 15:00:00.000", '%Y-%m-%d %H:%M:%S.%f')

#add a real cap to capList + the wanted building as replacement
elec_capList = 	{"SRV1.SGE.INTG_BU.ENERGIE.MES":"BU SCD", "UPS1.A10.EA1001.P_TOTALE_POS.MES": "1R1","UPS1.A10.EA1002.P_TOTALE_POS.MES" :"1TP1", "UPS1.A11.EA1101.P_TOTALE_POS.MES" :"U3","UPS1.A11.EA1102.P_TOTALE_POS.MES":"U2", "UPS1.A11.EA1103.P_TOTALE_POS.MES":"U4",  "UPS1.A10.EA1003.P_TOTALE_POS.MES":"U1", "UPS1.A2.EA0202.P_TOTALE_POS.MES":"2A", "UPS1.A2.EA0203.P_TOTALE_POS.MES":"1A", "UPS1.A5.EA0501.P_TOTALE_POS.MES":"3A","UPS1.A11.EA1104.P_TOTALE_POS.MES":"Irit","UPS1.A8.EA0803.P_TOTALE_POS.MES" :"3TP2","UPS1.A1.EA0101.P_TOTALE_POS.MES":"1R2", "UPS1.A9.EA0902.P_TOTALE_POS.MES":"1R3" ,"UPS1.A3.EA0302.P_TOTALE_POS.MES":"3R3" }
batlist = ["BU SCD", "1R1", "1TP1", "U4", "U3", "U2", "U1", "2A", "1A","3A", "Irit", "3TP2", "1R3", "1R2", "3R3"]

def temp_conv():
    #Used to convert old Air_Comprimé & Calorie to the same json as Elec/result.json
    l = ['Air_comprimé.json', 'Calorie.json']
    for k in l:
        resultDic = {}
        with open('./src/db-seeds/'+k) as to_conv:
            data = json.load(to_conv)
            currentDate = ""
            for dic in data:
                for key in dic:
                    if key == "date":
                        currendDate = dic[key]
                    elif key != "date" and not key in resultDic:
                        resultDic[key] = {}
                        if type(dic[key]) != type(""):
                            resultDic[key][currendDate] = dic[key]
                    else:
                        if type(dic[key]) != type(""):
                            resultDic[key][currendDate] = dic[key]
            with open('./src/db-seeds/'+'r_'+k, 'w') as outfile:
                json.dump(resultDic, outfile)


def createOtherStats():
    for ty in d_type:
        b = batlist[:]
        with open(path+ty+'/'+rFile) as r_json:
            data = json.load(r_json)

            endTab={}
            for capter in data:
                hourTab = [[] for i in range(24)]
                dayTab = [[] for i in range(7)]
                #monthTab = [[] for i in range(12)]
                #print(capter + "->")
                for TS in data[capter]:
                    date = datetime.datetime.strptime(TS, '%d/%m/%Y %H:%M:%S') # or adjust to %Y-%m-%d %H:%M:%S.%f
                    value = data[capter][TS]
                    hourTab[(date.hour)-1].append(value)
                    dayTab[(date.day%7)-1].append(value)
                    #monthTab[(date.month)-1].append(value)
                #
                #print(np.mean(hourTab[0]),np.var(hourTab[0]))

                #need to duplicate /change values based on date. No NaN in JSON
                for i in range(24):
                    hourTab[i] = {"mean":np.mean(hourTab[i]), "std":np.std(hourTab[i])}
                for i in range(7):
                    dayTab[i] = {"mean":np.mean(dayTab[i]), "std":np.std(dayTab[i])}
                #for i in range(12):
                #    monthTab[i] = {"mean":np.mean(monthTab[i]), "std":np.std(monthTab[i])}
                #for i in range(5,12):
                #    monthTab[i] = {"mean":monthTab[i+6%12]["mean"], "std":monthTab[i+6%12]["std"]}
                if len(b) != 0:
                    randIndex = random.randrange(0,len(b))
                    endTab[b[randIndex]] = {"hour":hourTab, "day":dayTab} #, "month":monthTab # <<<=adds month compare
                    b.remove(b[randIndex])
            with open(path+'generator_'+ty+'.json', 'w') as outfile:
                json.dump(endTab, outfile)

def createElecStats():
    
    with open(path+type[0]+rFile) as r_json:
        data = json.load(r_json)

        endTab={}
        for capter in data:
            hourTab = [[] for i in range(24)]
            dayTab = [[] for i in range(7)]
            #monthTab = [[] for i in range(12)]
            #print(capter + "->")
            for TS in data[capter]:
                date = datetime.datetime.strptime(TS, '%Y-%m-%d %H:%M:%S.%f')
                value = data[capter][TS]
                hourTab[(date.hour)-1].append(value)
                dayTab[(date.day%7)-1].append(value)
                #monthTab[(date.month)-1].append(value)
            #
            #print(np.mean(hourTab[0]),np.var(hourTab[0]))

            #need to duplicate /change values based on date. No NaN in JSON
            for i in range(24):
                hourTab[i] = {"mean":np.mean(hourTab[i]), "std":np.std(hourTab[i])}
            for i in range(7):
                dayTab[i] = {"mean":np.mean(dayTab[i]), "std":np.std(dayTab[i])}
            #for i in range(12):
            #    monthTab[i] = {"mean":np.mean(monthTab[i]), "std":np.std(monthTab[i])}
            #for i in range(5,12):
            #    monthTab[i] = {"mean":monthTab[i+6%12]["mean"], "std":monthTab[i+6%12]["std"]}
            if capter in elec_capList.keys():
                endTab[capList[capter]] = {"hour":hourTab, "day":dayTab} #, "month":monthTab # <<<=adds month compare
        return endTab
#############
#endTab[capter.len] = [hourTab[24], dayTab[31], monthTab[12] ==> [mean, var]]
#stats = createStats()
#for j in stats:
#    print(j)

#loc is mean, scale is standard dev

#NOTES : based on hour weekday or month ? or all 3 ? maybe a mix. Night is first priority then month then daytime ..? End implements
###############
def generateData():
    #Made with JS in influx.db.ts (easier to push when done)
    print("TODO")

def createJSON():
    fList = os.listdir(path)
    #print(fList)

    d_List = {}
    #d_List[d["Name"]][datetime.datetime.strptime(d["TS"], '%Y-%m-%d %H:%M:%S.%f')]

    for f in fList:
        if "json" in f:
            print(f + " starts...")
            with open(path+f) as current_json:
                data = json.load(current_json)
                for d in data:
                    if not d["Name"] in d_List:
                        d_List[d["Name"]] = {}
                    if not d["TS"] in d_List[d["Name"]]:
                        d_List[d["Name"]][d["TS"]] = float(d["Value"])
                    else :
                            d_List[d["Name"]][d["TS"]] += float(d["Value"])

            print(f + "end." + "d_List len :" + str(len(d_List)))
        else :
            print(f + "is not a json")
    with open(path+'result.json', 'w') as outfile:
        json.dump(d_List, outfile)

    print(len(d_List))

    #with open('./src/db-seeds/data-2019/5bat.json') as json_file:
    #   data = json.load(json_file)
        #for p in data:
        #   print (p['TS'] + " - " + p['Name'] + " : " + p["Value"])
def writeStats():
    statsTab = createStats()
    with open(path+'generator.json', 'w') as outfile:
        json.dump(statsTab, outfile)
def main():
    #statsTab = createStats()
    #        
    #writeStats()   
    #with open(path+'generator.json', 'w') as outfile:
    #    json.dump(statsTab, outfile)

    #temp_conv()
    createOtherStats()

main()
