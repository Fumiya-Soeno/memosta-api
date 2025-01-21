"use client";

export function Header() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundColor: "#333",
        color: "#fff",
        fontSize: "1.2rem",
      }}
    >
      <div>Character's War</div>
      <nav>
        <a
          href="#"
          style={{
            margin: "0 1rem",
            textDecoration: "none",
            color: "#fff",
          }}
        >
          Home
        </a>
        <a
          href="#"
          style={{
            margin: "0 1rem",
            textDecoration: "none",
            color: "#fff",
          }}
        >
          Logout
        </a>
      </nav>
    </header>
  );
}
