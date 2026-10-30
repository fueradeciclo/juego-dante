import { readFlag, saveFlag } from './preferences.ts';
const key='pattha-airplanes';
type SkyStorage=Pick<Storage,'getItem'|'setItem'>;
export const readAirplaneChoice=(storage:()=>SkyStorage=()=>localStorage)=>readFlag(key,storage);
export const saveAirplaneChoice=(enabled:boolean,storage:()=>SkyStorage=()=>localStorage)=>saveFlag(key,enabled,storage);
