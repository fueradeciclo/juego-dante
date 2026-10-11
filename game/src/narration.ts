/** Only supplied, listed recordings are loaded. Missing recordings leave subtitles usable. */
export class Narration {
 private audio:HTMLAudioElement|null=null;private source?:string;private muted=false;private serial=0;
 constructor(private notify:(message:string)=>void){}
 play(source?:string){this.stop();this.source=source;if(!source||this.muted)return;const serial=this.serial;this.audio=new Audio(`${import.meta.env.BASE_URL}${source}`);this.audio.volume=.85;void this.audio.play().catch(()=>{if(serial===this.serial)this.notify('La voz no está disponible. Podés seguir leyendo.');});}
 repeat(){this.play(this.source);}
 stop(){this.serial++;if(this.audio){this.audio.pause();this.audio.removeAttribute('src');this.audio.load();this.audio=null;}}
 toggle(){this.muted=!this.muted;this.stop();return this.muted;}
}
