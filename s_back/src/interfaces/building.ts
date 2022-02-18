/**
 * ready for changes with NeoData. be carefull with get <>(/buildings/...) in front. Expects {name:string, capterId:string} and prints / use name as building name
 */
export interface IBuilding{
    name:string
    capterId:string //unused for now but expected by front
}