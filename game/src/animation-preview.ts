import { animatePortraits, type PreviewMode } from './portraits.ts';
import { characterKinds, loadRig } from './character-art.ts';
import './style.css';
let mode:PreviewMode='auto';
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-preview]')) {
  button.onclick=()=>{
    mode=button.dataset.preview as PreviewMode;
    document.querySelectorAll('[data-preview]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  };
}
animatePortraits(()=>mode);
void Promise.all(characterKinds.map(loadRig)).then(()=>{
  document.getElementById('gallery-status')!.textContent='Todos listos. ¡Probá sus gestos!';
}).catch(()=>{document.getElementById('gallery-status')!.textContent='Un personaje no cargó. Recargá para volver a intentar.';});
