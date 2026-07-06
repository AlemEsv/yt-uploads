CREATE TABLE canciones (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo              TEXT NOT NULL,
    artista             TEXT,
    genero              TEXT,
    album               TEXT,
    ruta_archivo        TEXT NOT NULL UNIQUE,
    portada_ruta        TEXT,
    duracion_segundos   INTEGER,
    plataforma_origen   TEXT NOT NULL DEFAULT 'importado' CHECK (plataforma_origen IN ('youtube','soundcloud','importado')),
    url_origen          TEXT,
    calidad_kbps        INTEGER,
    fecha_descarga      TEXT NOT NULL DEFAULT (datetime('now')),
    fecha_modificacion  TEXT NOT NULL DEFAULT (datetime('now')),
    hash_archivo        TEXT,
    revisado            INTEGER NOT NULL DEFAULT 1,
    activo              INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_canciones_artista ON canciones(artista);
CREATE INDEX idx_canciones_titulo ON canciones(titulo);
CREATE INDEX idx_canciones_genero ON canciones(genero);
CREATE INDEX idx_canciones_plataforma ON canciones(plataforma_origen);

CREATE TABLE historial_reproduccion (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cancion  INTEGER NOT NULL REFERENCES canciones(id) ON DELETE CASCADE,
    fecha_hora  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_historial_cancion ON historial_reproduccion(id_cancion);
CREATE INDEX idx_historial_fecha ON historial_reproduccion(fecha_hora);

CREATE TABLE favoritos (
    id_cancion     INTEGER PRIMARY KEY REFERENCES canciones(id) ON DELETE CASCADE,
    fecha_marcado  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE perfiles_tematicos (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre               TEXT NOT NULL UNIQUE,
    paleta_colores       TEXT NOT NULL,
    criterio_activacion  TEXT,
    es_predefinido       INTEGER NOT NULL DEFAULT 0,
    fecha_creacion       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE configuracion (
    clave  TEXT PRIMARY KEY,
    valor  TEXT NOT NULL
);
