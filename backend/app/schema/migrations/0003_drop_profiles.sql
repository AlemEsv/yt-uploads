DROP TABLE IF EXISTS perfiles_tematicos;

DELETE FROM configuracion
WHERE clave IN ('perfil_tematico_activo', 'modo_mood_engine', 'mood_ventana_dias');
