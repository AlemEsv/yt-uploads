import json

from app.config_store import get_value, set_value
from app.history.repository import historial_ventana

MIN_MUESTRAS_MOOD = 5
CONFIANZA_MINIMA = 0.4
PESO_GENERO = 0.6
PESO_PLATAFORMA = 0.4
BOOST_REPETICION = 1.2
UMBRAL_REPETICION = 0.3


def evaluate(conn) -> list[tuple[str, dict]]:
    modo = get_value(conn, "modo_mood_engine", "manual")
    dias = int(get_value(conn, "mood_ventana_dias", "7"))
    historial = historial_ventana(conn, dias)
    perfiles = conn.execute(
        "SELECT id, nombre, paleta_colores, criterio_activacion FROM perfiles_tematicos"
    ).fetchall()

    total = len(historial)
    if total < MIN_MUESTRAS_MOOD:
        return []

    conteo_por_cancion = {}
    for item in historial:
        conteo_por_cancion[item["song_id"]] = conteo_por_cancion.get(item["song_id"], 0) + 1
    cancion_dominante_id, repeticiones = max(conteo_por_cancion.items(), key=lambda kv: kv[1])

    genero_dominante = None
    if repeticiones / total > UMBRAL_REPETICION:
        genero_dominante = next(
            (item["genero"] for item in historial if item["song_id"] == cancion_dominante_id and item["genero"]),
            None,
        )

    mejor_perfil = None
    mejor_score = 0.0

    for perfil in perfiles:
        criterio = json.loads(perfil["criterio_activacion"] or "{}")
        genero_criterio = (criterio.get("genero") or "").lower()
        plataforma_criterio = criterio.get("plataforma")

        if not genero_criterio and not plataforma_criterio:
            continue

        match_genero = 0.0
        if genero_criterio:
            coincidencias = sum(1 for item in historial if (item["genero"] or "").lower() == genero_criterio)
            match_genero = coincidencias / total

        match_plataforma = 0.0
        if plataforma_criterio:
            coincidencias = sum(1 for item in historial if item["plataforma_origen"] == plataforma_criterio)
            match_plataforma = coincidencias / total

        score = PESO_GENERO * match_genero + PESO_PLATAFORMA * match_plataforma
        if genero_dominante and genero_criterio == genero_dominante.lower():
            score *= BOOST_REPETICION

        if score > mejor_score:
            mejor_score = score
            mejor_perfil = perfil

    if not mejor_perfil or mejor_score < CONFIANZA_MINIMA:
        return []

    eventos = [
        (
            "mood_suggestion",
            {
                "profile_id": mejor_perfil["id"],
                "nombre": mejor_perfil["nombre"],
                "confianza": round(min(mejor_score, 1.0), 2),
                "criterio_detectado": json.loads(mejor_perfil["criterio_activacion"] or "{}"),
            },
        )
    ]

    if modo == "automatico":
        activo_actual = get_value(conn, "perfil_tematico_activo")
        if str(mejor_perfil["id"]) != activo_actual:
            set_value(conn, "perfil_tematico_activo", str(mejor_perfil["id"]))
            eventos.append(
                (
                    "profile_activated",
                    {
                        "profile_id": mejor_perfil["id"],
                        "nombre": mejor_perfil["nombre"],
                        "paleta_colores": json.loads(mejor_perfil["paleta_colores"]),
                        "origen": "automatico",
                    },
                )
            )

    return eventos
