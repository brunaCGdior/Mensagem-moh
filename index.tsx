import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cartas para Você" },
      { name: "description", content: "Cartas digitais feitas com amor, para cada momento certo." },
      { property: "og:title", content: "Cartas para Você" },
      { property: "og:description", content: "Para cada momento, uma palavra." },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/cartas/index.html");
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#0D0D0D", color: "#f5f5f5", fontFamily: "serif" }}>
      <p style={{ opacity: 0.7 }}>abrindo cartas…</p>
    </div>
  );
}
