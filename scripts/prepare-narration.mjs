import { readFile, writeFile, access } from 'node:fs/promises';
const path='assets/audio/narracion/MANIFEST.json';
const manifest=JSON.parse(await readFile(path,'utf8'));
manifest.disponibles={};
for(const line of manifest.grabaciones){
 try{await access(line.archivo);}catch{continue;}
 const bytes=await readFile(line.archivo);
 const header=bytes.subarray(0,3).toString();
 if(bytes.length<100||(header!=='ID3'&&!(bytes[0]===0xff&&(bytes[1]&0xe0)===0xe0)))throw Error('El archivo no parece MP3: '+line.archivo);
 manifest.disponibles[line.id]=line.archivo;
}
await writeFile(path,JSON.stringify(manifest,null,2)+'\n');
console.log(Object.keys(manifest.disponibles).length+' de '+manifest.grabaciones.length+' grabaciones disponibles.');
