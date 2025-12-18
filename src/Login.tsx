// src/Login.tsx
import { useState } from "react";

type LoginProps = {
  onLoginSuccess: (username: string) => void;
};

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const endpoint = isRegistering ? "/api/auth/register" : "/api/auth/login";
    const url = "http://localhost:8000" + endpoint;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      if (isRegistering) {
        alert("Your account has been created. You can log in");
        setIsRegistering(false);
        setUsername("");
        setPassword("");
      } else {
        onLoginSuccess(data.user.username);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{position: "fixed", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#ffffff"}}>
      <div style={{ padding: 30, border: "1px solid #ccc", borderRadius: 8, width: 600 }}>
        <h2 style={{textAlign: "center"}}>{isRegistering ? "Register" : "Login"}</h2>
        
        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 15 }}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: 8 }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 8 }}
          />
          <button type="submit">
            {isRegistering ? "Sign Up" : "Log In"}
          </button>
        </form>

        <button 
          onClick={() => {
            setIsRegistering(!isRegistering);
            setUsername("");
            setPassword("");
            setError("");
          }}
          style={{ display: "block", margin: "10px auto 0", marginTop: 10, background: "none", border: "none", color: "blue", textDecoration: "underline", cursor: "pointer" }}
        >
          {isRegistering ? "Log in if you already have an account!" : "Register here!"}
        </button>
      </div>
    </div>
  );
}