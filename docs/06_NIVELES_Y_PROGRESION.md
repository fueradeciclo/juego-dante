# 06 · Mapa de niveles — ideas a validar

**Orden opcional:** para una primera demo elegir **solo el tutorial de la puerta**. Los demás son futuras propuestas y no se deben desarrollar antes de probar el MVP.

| Nivel | Lugar | Problema principal | Aporte de cada amigo | Progreso |
| --- | --- | --- | --- | --- |
| 0 | La puerta que perdió su luz | Abrir una puerta | Pattha activa; verde conecta; Rural interpreta | Primer prototipo |
| 1 | Bosque de Antenas | Volver a escuchar una señal | Pattha mueve reflector; verde busca cable; Rural sigue sonidos | Idea |
| 2 | Túneles de Tornillos | Liberar un ascensor | Pattha desplaza engranaje; verde entra al conducto; Rural da orden | Idea |
| 3 | Faro de las Chispas | Encender faro | Acciones de los tres en secuencia | Idea |

## Patrón reusable de acertijo

- **Objetivo visible:** mostrar la meta sin explicación extensa.
- **Pista distinguible:** color + forma + icono; no depender únicamente del color.
- **Acción sencilla:** un solo input por interacción.
- **Colaboración:** cada uno hace algo que otro no puede.
- **Error amable:** se puede reintentar inmediatamente.
- **Éxito expresivo:** animación divertida, efecto suave y comentario del equipo.

## Dificultad gradual

En el nivel 0: una acción con una pista evidente. En el 1: dos acciones ordenadas. En el 2: tres acciones con una pequeña elección. En el final: combinar habilidades conocidas sin introducir mecánicas completamente nuevas.

## Storyboard textual del nivel 0

```text
[Inicio / plaza] --- [Rueda grande] --- [Hueco pequeño] --- [Panel formas] === [Puerta] ---> [Celebración]
       ^                 Pattha             Ratón verde           Rural
  presentación
```

Este diagrama es de flujo narrativo y NO impone desplazamiento lateral ni diseño de mapa real. Rehacerlo al elegir cámara y motor.
