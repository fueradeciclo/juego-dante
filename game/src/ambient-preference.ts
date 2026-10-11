const key='pattha-airplanes';
type SkyStorage=Pick<Storage,'getItem'|'setItem'>;
export function readAirplaneChoice(storage:()=>SkyStorage=()=>localStorage):boolean|undefined {
 try{const value=storage().getItem(key);return value==='on'?true:value==='off'?false:undefined;}catch{return undefined;}
}
export function saveAirplaneChoice(enabled:boolean,storage:()=>SkyStorage=()=>localStorage){
 try{storage().setItem(key,enabled?'on':'off');}catch{/* The choice still works for this session. */}
}
