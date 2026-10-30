/** Per-browser conveniences (sound, calm mode). Independent of the adventure save and safe when storage is blocked. */
type PreferenceStorage=Pick<Storage,'getItem'|'setItem'>;
export const SOUND_KEY='pattha-sonidos';
export const CALM_KEY='pattha-modo-tranqui';
export function readFlag(key:string,storage:()=>PreferenceStorage=()=>localStorage):boolean|undefined {
 try{const value=storage().getItem(key);return value==='on'?true:value==='off'?false:undefined;}catch{return undefined;}
}
export function saveFlag(key:string,enabled:boolean,storage:()=>PreferenceStorage=()=>localStorage){
 try{storage().setItem(key,enabled?'on':'off');}catch{/* The choice still works for this session. */}
}
