# CLAUDE.md

## Comentarios y docstrings

- Nunca escribas docstrings: ni `"""..."""` en Python ni bloques `/** */` en JS/JSX.
- Nunca escribas un comentario que solo repita lo que el código ya dice (un WHAT). Los nombres de variables/funciones y el propio código deben bastar.
- Sí puedes escribir un comentario de una línea (`#` en Python, `//` en JS) cuando explica un porqué no evidente: una restricción oculta, un workaround, un comportamiento que sorprendería a quien lea el código después. Ejemplos reales en este repo: [db.py](backend/app/db.py) (por qué `DB_LOCK` no es reentrante), [PlayerContext.jsx](src/renderer/context/PlayerContext.jsx) (por qué el audio se sirve por HTTP y no `file://`).
- Las directivas `eslint-disable-next-line` no son documentación, son funcionales — nunca las borres solo por ser comentarios.

## Antes de commitear

- Cambios en `backend/`: correr `ruff check backend/app`.
- Cambios en `src/`: correr `npm run lint:js`.
- Ambos a la vez: `npm run lint`.
