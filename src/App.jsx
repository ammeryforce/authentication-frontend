import { useContext, useState } from "react";
import { UserContext } from "./context/UserContext";

export default function App() {
  const { user, isLoggedIn, isInitializing, loginError, login, logout } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (isInitializing) return <main className="screen"><p>Checking your session…</p></main>;

  async function submit(event) {
    event.preventDefault();
    await login(email, password);
  }

  if (isLoggedIn) {
    return <main className="screen"><section className="card">
      <p className="eyebrow">AUTHENTICATED</p><h1>Welcome, {user.username}</h1>
      <p>You are signed in as {user.email}. Your session token is stored in an HTTP-only cookie.</p>
      <button onClick={logout}>Log out</button>
    </section></main>;
  }

  return <main className="screen"><form className="card" onSubmit={submit}>
    <p className="eyebrow">COOKIE JWT DEMO</p><h1>Sign in</h1>
    <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
    <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
    {loginError && <p className="error" role="alert">{loginError}</p>}
    <button type="submit">Log in</button>
  </form></main>;
}
