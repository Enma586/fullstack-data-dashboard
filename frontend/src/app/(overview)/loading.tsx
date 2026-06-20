import styles from "./overview.module.css";

export default function Loading() {
  return (
    <main className={styles.page}>
      <div
        style={{
          height: 28,
          width: 240,
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--color-bg-secondary)",
          marginBottom: "var(--spacing-xl)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: "var(--spacing-md)",
          marginBottom: "var(--spacing-xl)",
          flexWrap: "wrap",
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 38,
              width: 180,
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "var(--spacing-md)",
          marginBottom: "var(--spacing-xl)",
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 120,
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
      </div>

      <div
        style={{
          height: 380,
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          animation: "pulse 1.5s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </main>
  );
}
