import { animatePortraits, type PreviewMode } from './portraits.ts';
import { characterKinds, loadRig } from './character-art.ts';
import './style.css';
import { animatePatthaPreview } from './pattha-preview.ts';
import { loadPatthaArt } from './pattha-art.ts';
let mode:PreviewMode='auto';
for(const button of document.querySelectorAll<HTMLButtonElement>('[data-preview]')) {
  button.onclick=()=>{
    mode=button.dataset.preview as PreviewMode;
    document.querySelectorAll('[data-preview]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  };
}
animatePortraits(()=>mode);
void Promise.all([...characterKinds.filter(kind=>kind!=='pattha').map(loadRig),loadPatthaArt(),animatePatthaPreview()]).then(()=>{
  document.getElementById('gallery-status')!.textContent='Todos listos. ¡Probá sus gestos!';
}).catch(()=>{document.getElementById('gallery-status')!.textContent='Un personaje no cargó. Recargá para volver a intentar.';});
