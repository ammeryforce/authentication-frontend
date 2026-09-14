import { useContext, useEffect, useState } from "react";
import { api, UserContext } from "./context/UserContext";

const initialItem = { name: "", description: "" };

function formatDate(value) {
  return value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
}

function Notice({ notice }) {
  return notice ? <p className={`notice ${notice.kind}`} role="status">{notice.message}</p> : null;
}

function Login() {
  const { loginError, login } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  async function submit(event) { event.preventDefault(); await login(email, password); }
  return <main className="login-shell"><form className="login-card" onSubmit={submit}>
    <p className="eyebrow">INVENTORY CONSOLE</p><h1>Sign in</h1>
    <p className="muted">Use your account to access protected item records.</p>
    <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
    <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
    {loginError && <p className="notice error" role="alert">{loginError}</p>}
    <button type="submit">Log in</button>
  </form></main>;
}

function Items() {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState(initialItem);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  async function loadItems() {
    setLoading(true);
    try { const response = await api("/api/item"); const body = await response.json(); if (!response.ok) throw new Error(body.message ?? "Unable to load items"); setItems(body.items); }
    catch (error) { setNotice({ kind: "error", message: error.message }); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadItems(); }, []);
  function changeDraft(event) { setDraft((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function saveItem(event) {
    event.preventDefault(); setNotice(null); const editing = Boolean(editingId);
    try { const response = await api(editing ? `/api/item/${editingId}` : "/api/item", { method: editing ? "PUT" : "POST", body: JSON.stringify(draft) }); const body = await response.json(); if (!response.ok) throw new Error(body.message ?? "Unable to save item"); setDraft(initialItem); setEditingId(null); setNotice({ kind: "success", message: editing ? "Item updated and recorded in the audit log." : "Item created and recorded in the audit log." }); await loadItems(); }
    catch (error) { setNotice({ kind: "error", message: error.message }); }
  }
  async function deleteItem(item) {
    if (!window.confirm(`Delete “${item.name}”?`)) return;
    try { const response = await api(`/api/item/${item.id}`, { method: "DELETE" }); const body = await response.json(); if (!response.ok) throw new Error(body.message ?? "Unable to delete item"); setNotice({ kind: "success", message: "Item deleted and recorded in the audit log." }); await loadItems(); }
    catch (error) { setNotice({ kind: "error", message: error.message }); }
  }
  return <section className="page-content"><div className="page-heading"><div><p className="eyebrow">PROTECTED RESOURCE</p><h1>Items</h1><p className="muted">Every action below requires a valid HTTP-only cookie session.</p></div><button className="secondary" onClick={loadItems}>Refresh</button></div><Notice notice={notice} />
    <div className="two-column"><form className="panel" onSubmit={saveItem}><h2>{editingId ? "Edit item" : "Add item"}</h2><label>Item name<input name="name" value={draft.name} onChange={changeDraft} maxLength="120" required /></label><label>Description<textarea name="description" value={draft.description} onChange={changeDraft} maxLength="500" rows="5" /></label><div className="actions"><button type="submit">{editingId ? "Save changes" : "Create item"}</button>{editingId && <button className="text-button" type="button" onClick={() => { setEditingId(null); setDraft(initialItem); }}>Cancel</button>}</div></form>
      <section className="panel"><h2>Item records</h2>{loading ? <p className="muted">Loading protected data…</p> : items.length === 0 ? <p className="empty">No items yet. Create one to generate an audit record.</p> : <div className="item-list">{items.map((item) => <article className="item-row" key={item.id}><div><h3>{item.name}</h3><p>{item.description || "No description"}</p><small>Updated {formatDate(item.updatedAt)}</small></div><div className="row-actions"><button className="secondary" onClick={() => { setEditingId(item.id); setDraft({ name: item.name, description: item.description ?? "" }); }}>Edit</button><button className="danger" onClick={() => deleteItem(item)}>Delete</button></div></article>)}</div>}</section></div>
  </section>;
}

function Users() {
  const [users, setUsers] = useState([]); const [selected, setSelected] = useState(null); const [password, setPassword] = useState(""); const [notice, setNotice] = useState(null); const [loading, setLoading] = useState(true);
  async function loadUsers() { setLoading(true); try { const response = await api("/api/users"); const body = await response.json(); if (!response.ok) throw new Error(body.message ?? "Unable to load users"); setUsers(body.users); } catch (error) { setNotice({ kind: "error", message: error.message }); } finally { setLoading(false); } }
  useEffect(() => { loadUsers(); }, []);
  async function changePassword(event) { event.preventDefault(); if (!selected) return; try { const response = await api(`/api/users/${selected.id}/password`, { method: "PATCH", body: JSON.stringify({ password }) }); const body = await response.json(); if (!response.ok) throw new Error(body.message ?? "Unable to change password"); setNotice({ kind: "success", message: `Password changed for ${selected.username ?? selected.email}.` }); setSelected(null); setPassword(""); } catch (error) { setNotice({ kind: "error", message: error.message }); } }
  return <section className="page-content"><div className="page-heading"><div><p className="eyebrow">ADMINISTRATION</p><h1>User management</h1><p className="muted">Only administrators can view this page or change another user’s password.</p></div><button className="secondary" onClick={loadUsers}>Refresh</button></div><Notice notice={notice} />
    <div className="two-column"><section className="panel"><h2>Users</h2>{loading ? <p className="muted">Loading users…</p> : users.length === 0 ? <p className="empty">No database users found.</p> : <div className="user-list">{users.map((person) => <article className="user-row" key={person.id}><div className="avatar">{(person.username ?? person.email).slice(0, 1).toUpperCase()}</div><div><h3>{person.username ?? "Unnamed user"}</h3><p>{person.email}</p></div><button className="secondary" onClick={() => { setSelected(person); setPassword(""); }}>Change password</button></article>)}</div>}</section>
      <form className="panel" onSubmit={changePassword}><h2>Change password</h2>{selected ? <><p className="selected-user">For <strong>{selected.username ?? selected.email}</strong></p><label>New password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength="8" maxLength="128" autoComplete="new-password" required /></label><p className="field-help">Use 8–128 characters. The server stores only a bcrypt hash.</p><button type="submit">Update password</button></> : <p className="empty">Select a user to change that account’s password.</p>}</form>
    </div></section>;
}

function AuditLog() {
  const [logs, setLogs] = useState([]); const [notice, setNotice] = useState(null); const [loading, setLoading] = useState(true);
  async function loadLogs() { setLoading(true); try { const response = await api("/api/audit-log"); const body = await response.json(); if (!response.ok) throw new Error(body.message ?? "Unable to load audit log"); setLogs(body.logs); } catch (error) { setNotice({ kind: "error", message: error.message }); } finally { setLoading(false); } }
  useEffect(() => { loadLogs(); }, []);
  return <section className="page-content"><div className="page-heading"><div><p className="eyebrow">ACCOUNTABILITY</p><h1>Audit log</h1><p className="muted">A server-side record of all item actions, newest first.</p></div><button className="secondary" onClick={loadLogs}>Refresh</button></div><Notice notice={notice} />
    <section className="panel table-panel">{loading ? <p className="muted">Loading audit records…</p> : logs.length === 0 ? <p className="empty">No item actions have been recorded yet.</p> : <div className="table-wrap"><table><thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Item</th><th>Detail</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{formatDate(log.createdAt)}</td><td>{log.actor?.username ?? log.actor?.email}<small>{log.actor?.email}</small></td><td><span className="badge">{log.action.replaceAll("_", " ")}</span></td><td>{log.itemId ?? "—"}</td><td>{log.detail?.name ?? (log.detail?.count !== undefined ? `${log.detail.count} item(s)` : "—")}</td></tr>)}</tbody></table></div>}</section>
  </section>;
}

function Dashboard() {
  const { user, logout } = useContext(UserContext); const [page, setPage] = useState("items"); const admin = user.role === "admin";
  const nav = [{ id: "items", label: "Items" }, ...(admin ? [{ id: "users", label: "Users" }, { id: "audit", label: "Audit log" }] : [])];
  const content = page === "users" && admin ? <Users /> : page === "audit" && admin ? <AuditLog /> : <Items />;
  return <div className="app-shell"><header className="topbar"><div className="brand"><span className="brand-mark">I</span><span>Inventory Console</span></div><div className="account"><span>{user.username} <small>{admin ? "Administrator" : "User"}</small></span><button className="logout" onClick={logout}>Log out</button></div></header><div className="app-body"><aside className="sidebar"><p className="sidebar-label">WORKSPACE</p>{nav.map((entry) => <button className={page === entry.id ? "nav-item active" : "nav-item"} onClick={() => setPage(entry.id)} key={entry.id}>{entry.label}</button>)}{admin && <p className="sidebar-note">Users and audit log are visible only to the administrator.</p>}</aside><main>{content}</main></div></div>;
}

export default function App() {
  const { isLoggedIn, isInitializing } = useContext(UserContext);
  if (isInitializing) return <main className="login-shell"><p className="muted">Checking your session…</p></main>;
  return isLoggedIn ? <Dashboard /> : <Login />;
}
