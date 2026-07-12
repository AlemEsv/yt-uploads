CREATE TABLE playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    fecha_creacion TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE playlist_canciones (
    id_playlist INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    id_cancion INTEGER NOT NULL REFERENCES canciones(id) ON DELETE CASCADE,
    posicion INTEGER NOT NULL,
    fecha_agregado TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (id_playlist, id_cancion)
);
