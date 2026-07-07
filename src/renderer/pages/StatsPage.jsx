import React, { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi.js";

export default function StatsPage() {
  const api = useApi();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!api) return;
    api.getHistoryStats(7).then(setStats);
  }, [api]);

  if (!stats) {
    return (
      <div style={{ padding: "1.5rem", color: "var(--color-text-secondary)" }}>Cargando estadísticas...</div>
    );
  }

  if (stats.total_reproducciones === 0) {
    return (
      <div style={{ padding: "1.5rem", color: "var(--color-text-secondary)" }}>
        <h2 style={{ color: "var(--color-text-primary)", margin: 0 }}>Estadísticas</h2>
        <p>Escucha algunas canciones para ver tus estadísticas aquí.</p>
      </div>
    );
  }

  const maxCancion = Math.max(...stats.top_canciones.map((c) => c.reproducciones), 1);
  const maxGenero = Math.max(...stats.top_generos.map((g) => g.reproducciones), 1);

  return (
    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h2 style={{ margin: 0 }}>Estadísticas (últimos {stats.ventana_dias} días)</h2>

      <section>
        <h3 style={sectionTitleStyle}>Más escuchadas</h3>
        <ol style={listStyle}>
          {stats.top_canciones.map((cancion, index) => (
            <li key={cancion.song_id} style={rowStyle}>
              <span style={{ width: "1.5rem", color: "var(--color-text-secondary)" }}>{index + 1}.</span>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {cancion.titulo}
              </span>
              <BarMeter value={cancion.reproducciones} max={maxCancion} />
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 style={sectionTitleStyle}>Géneros recurrentes</h3>
        <ul style={listStyle}>
          {stats.top_generos.map((g) => (
            <li key={g.genero} style={rowStyle}>
              <span style={{ flex: 1 }}>{g.genero}</span>
              <BarMeter value={g.reproducciones} max={maxGenero} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 style={sectionTitleStyle}>Plataformas</h3>
        <ul style={{ ...listStyle, flexDirection: "row", gap: "1.5rem" }}>
          {stats.top_plataformas.map((p) => (
            <li key={p.plataforma} style={{ color: "var(--color-text-secondary)" }}>
              {p.plataforma}: <strong style={{ color: "var(--color-text-primary)" }}>{p.reproducciones}</strong>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function BarMeter({ value, max }) {
  return (
    <>
      <div style={{ width: "120px", background: "#161616", borderRadius: "4px", overflow: "hidden" }}>
        <div
          style={{
            width: `${(value / max) * 100}%`,
            background: "var(--color-accent)",
            height: "8px",
            transition: "width 300ms ease",
          }}
        />
      </div>
      <span style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem", width: "1.5rem", textAlign: "right" }}>
        {value}
      </span>
    </>
  );
}

const sectionTitleStyle = { fontSize: "0.9rem", color: "var(--color-text-secondary)", margin: "0 0 0.5rem" };
const listStyle = { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem" };
const rowStyle = { display: "flex", alignItems: "center", gap: "0.5rem" };
