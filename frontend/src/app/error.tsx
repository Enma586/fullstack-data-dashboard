"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Error en dashboard:", error);
  }, [error]);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "var(--spacing-3xl)",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-size-3xl)",
          fontWeight: "var(--font-weight-bold)",
          color: "var(--color-error)",
          marginBottom: "var(--spacing-md)",
        }}
      >
        Error inesperado
      </h1>
      <p
        style={{
          color: "var(--color-text-secondary)",
          fontSize: "var(--font-size-sm)",
          marginBottom: "var(--spacing-xl)",
          maxWidth: 480,
        }}
      >
        Ocurrió un error al renderizar la aplicación. Por favor, intenta de nuevo.
      </p>
      <button
        onClick={reset}
        style={{
          padding: "var(--spacing-sm) var(--spacing-xl)",
          backgroundColor: "var(--color-primary-600)",
          color: "var(--color-text-primary)",
          border: "none",
          borderRadius: "var(--radius-md)",
          fontSize: "var(--font-size-sm)",
          fontWeight: "var(--font-weight-medium)",
          cursor: "pointer",
          transition: "background-color var(--transition-fast)",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-500)")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-600)")}
      >
        Reintentar
      </button>
    </main>
  );
}
