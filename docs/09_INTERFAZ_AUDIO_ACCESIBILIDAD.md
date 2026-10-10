# 09 · Interfaz, audio y accesibilidad (propuesta)

## Principios

El videojuego debe poder disfrutarse en familia, incluso por alguien que no lee fluidamente. Botones grandes, texto corto, ayuda visual, tonos cálidos y feedback claro. La dificultad y controles se prueban con Dante.

## Pantallas mínimas

**Menú:** nombre del juego (tentativo), los tres protagonistas, «Jugar», «Opciones», «Salir/Volver». **Juego:** pista contextual («Presioná para ayudar»), diálogo con retrato y nombre, pausa. **Final demo:** festejo «¡Lo conseguimos!» y «Volver a jugar».

## Diálogos

- 1–2 frases cortas por cuadro; evitar párrafos extensos durante las acciones.
- Acompañar personajes con avatar e identificación visual (forma/icono más color).
- Incluir opción de avanzar sin audio, repetir pista y omitir escenas ya vistas.
- Añadir narración grabada o síntesis solo si la familia la aprueba y conviene técnicamente.

## Sonidos a producir — PENDIENTE

| ID propuesto | Uso | Restricción |
| --- | --- | --- |
| `ui_confirm` | Elegir una opción | Corto, no estridente |
| `step_robot` | Pattha camina | Suave, mecánico simpático |
| `step_mouse` | Ratones caminan | Suave, leve |
| `interact` | Pedir ayuda | Reconocible y agradable |
| `puzzle_try` | Secuencia equivocada | Amable, sin bocina de fracaso |
| `puzzle_success` | Puerta abierta | Musical, celebración corta |
| `music_menu` | Menú | Original o con licencia clara, loop tranquilo |
| `music_level` | Demo | Original o con licencia clara, loop suave |

No hay archivos de audio en este kit. El primer prototipo puede usar silencio o sonidos provisorios inequívocamente marcados.

## Accesibilidad desde el MVP

- UI legible y contrastada, tamaños acordes a pantalla real.
- No depender solo del color (usar círculo/estrella/triángulo más etiqueta sonora opcional).
- Volumen de música y FX separados, pausa y opción de silenciar.
- Sin límites de tiempo ni penalización difícil de revertir en la demo.
- Evitar flashes intensos o parpadeo rápido; limitar efectos al festejo suave.
- Controles remapeables a futuro; no usar teclas difíciles de alcanzar si el target es infantil.
- Guardar progreso local en futuras iteraciones; no recopilar datos de menores por defecto.
