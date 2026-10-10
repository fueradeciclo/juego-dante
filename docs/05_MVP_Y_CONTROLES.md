# 05 · Demo 0.4 de plataformas

Destino confirmado: navegador en computadora y celular horizontal. Solo Pattha controlable. El mapa y la solución del puente son propuestas para probar con Dante.

## Alcance implementado

- Menú accesible, Jugar, pausa, pantalla completa opcional y reinicio.
- Movimiento lateral, salto variable, coyote time 120 ms y buffer 140 ms.
- Pattha con ocho cuadros de carrera, preparación de salto de 64 ms activos, impulso/subida/ápice/caída/aterrizaje y polvo suave. Saltos desde borde sin preparación; tocar y soltar sigue dando un salto corto.
- Otto y Rural animados por partes con seguimiento visual; se ubican junto al puente para ayudar.
- Gatos y perros que patrullan. Salto encima: destello y retirada. Contacto lateral: energía, retroceso breve y protección temporal.
- Checkpoints y reintentos ilimitados; conservar progreso en la partida.
- Tuerca en plataforma alta; ayuda contextual de Otto y pista siempre visible de Rural.
- Puente que aparece después de ambos aportes.
- Banderín de llegada, diálogo final y replay.
- 30 esferas opcionales fuera de las columnas de las plataformas; sin necesidad de recogerlas todas para ganar.
- Checkpoints con espacio respecto de las plataformas, activados al pisar suelo firme.
- Puntaje final: propuesta de 100 puntos por esfera y bonus de 1.000 por recoger todas; conteo único, sin penalización por caer.

## Controles

| Acción | Teclado | Táctil |
| --- | --- | --- |
| Mover | ←/→ o A/D | ◀/▶ |
| Saltar | Espacio, W, ↑ | Saltar |
| Interactuar | E, Enter | Ayudar |
| Diálogo | Enter, Espacio o Seguir | Seguir |
| Formas | 1/2/3 o botones | Formas |
| Pausar | Esc o Ⅱ | Ⅱ |

Dos contactos simultáneos permiten mover y saltar. Los controles se limpian al perder foco o girar el dispositivo. En vertical, aviso y pausa. El navegador puede impedir el bloqueo automático de orientación o la pantalla completa; girar el celular físicamente es el comportamiento soportado.

## Flujo

Menú → introducción → saltos y animales → tuerca → Otto → señal de Rural → puente → tramo final → llegada → replay o menú.

## Arte y contenido

Originales estáticos preservados. Pattha usa 24 poses nuevas en tres PNG generados desde B, atlas y pivotes; amigos/animales usan rigs sobre los recortes. El cuerpo de colisión es independiente del arte. Originales y planchas en assets/, código en game/src/; mapa y diálogos en data/demo_plataformas.json. Procedencia en ANIMACIONES_PATTHA_03.md.

## Duración y prueba familiar

Objetivo 5–10 minutos en una primera sesión. No se verificó con Dante ni con un celular físico. Preguntas para la partida: «¿Se siente bien el salto?», «¿Entendés cuándo pedir ayuda?», «¿Qué cambiarías de los gatos y perros?». Ver docs/PRUEBAS_Y_ENTREGA.md para evidencias técnicas y límites.
