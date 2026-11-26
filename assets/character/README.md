# Enrique — sprites para videojuego de plataformas 2D

## Contenido

- `atlas_all.png`: atlas principal **2304 × 2304 píxeles**, cuadrícula **9 × 9** de celdas de **256 × 256 px**.
- `atlas_main.png`: las 49 imágenes de movimientos principales, cuadrícula **13 × 4**.
- `atlas_extra.png`: las 32 imágenes de movimientos extra, cuadrícula **8 × 4**.
- `sprite_map.json`: coordenadas exactas en píxeles, rutas, nombres, FPS sugeridos y secuencias para las 26 animaciones.
- `sprites/<accion>/<accion>_00.png`: los **81 PNG individuales**, todos de **256 × 256 px**, con alfa real (fondo completamente transparente).
- `sprite_preview.jpg`: catálogo visual, con tablero solo para facilitar la revisión.
- `guia_animaciones.png`: nombres de las acciones en español como referencia visual.

## Cómo integrar en tu motor

1. Carga `atlas_all.png` como textura RGBA, sin eliminar alfa.
2. Cada sprite es un rectángulo de `256 × 256` píxeles. Para el atlas general, usa `sprite_map.json` → `frames[frame_id].rects['atlas_all.png']`.
3. Usa `animations[accion].frames` para obtener la secuencia de sprites, `fps` para la velocidad de reproducción y `loop` para decidir si se repite.
4. El origen de coordenadas es la esquina superior izquierda. Los frames están indexados desde **0**.
5. El punto de anclaje sugerido por celda es `(128, 232)` píxeles. Ajusta la caja de colisión física independientemente del cuadro visual.
6. Para mirar a la izquierda normalmente basta con aplicar `flipX = true` sobre la textura mirando a la derecha.

## Nota sobre el tratamiento de imagen

Se extrajeron los personajes de las láminas ilustradas de referencia. El fondo claro original se eliminó para convertir cada cuadro en RGBA con píxeles alfa=0 fuera del personaje. Se conservaron las ilustraciones, colores y poses originales. Todas las celdas tienen exactamente la misma anchura y altura, pero el dibujo dentro de cada una conserva naturalmente el movimiento vertical de saltos y caídas.

La separación gráfica del personaje es una operación automática: es recomendable inspeccionar los bordes a gran zoom antes de una publicación comercial. Los FPS son valores sugeridos, no velocidades derivadas de una grabación de movimiento real.
