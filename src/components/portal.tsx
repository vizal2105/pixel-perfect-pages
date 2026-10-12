import { Link } from "@tanstack/react-router";
import { BookOpen, Moon, Sun, Eye, EyeOff, Layers } from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

const ThemeContext = createContext({ dark: false, toggle: () => {} });

export function PortalTheme({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(window.sessionStorage.getItem("dcrap-theme") === "dark");
  }, []);
  const toggle = () => setDark((value) => {
    window.sessionStorage.setItem("dcrap-theme", value ? "light" : "dark");
    return !value;
  });
  return <ThemeContext.Provider value={{ dark, toggle }}><div className={dark ? "dark" : ""}><div className="bg-background text-foreground">{children}</div></div></ThemeContext.Provider>;
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { dark, toggle } = useContext(ThemeContext);
  return <Button variant="theme" size={compact ? "mini" : "nav"} onClick={toggle} title={`Switch to ${dark ? "light" : "dark"} mode`} aria-label={`Switch to ${dark ? "light" : "dark"} mode`} className={compact ? "absolute right-5 top-5" : ""}>{dark ? <Sun /> : <Moon />}{!compact && (dark ? "Light" : "Dark")}</Button>;
}

export function PortalLogo() {
  return <Link to="/" className="portal-logo" aria-label="DCRAP home"><span className="logo-icon"><BookOpen /></span>DCRAP</Link>;
}

export const accountRoles = [
  { name: "Student", detail: "Browse and read approved capstone and research work." },
  { name: "Graduated Student", detail: "Submit and track your own capstone or thesis." },
  { name: "Faculty", detail: "Advise, review, and curate departmental research." },
];

export function AccountPage({ signup = false }: { signup?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Student");
  const [notice, setNotice] = useState("");
  const [gateOpen, setGateOpen] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice("Account access is not connected yet.");
  };
  return <PortalTheme><main className="auth-page">
    <aside className="auth-sidebar">
      <div className="auth-sidebar-header"><PortalLogo /><Link to="/" className="back-link">Back to portal &gt;</Link></div>
      <div className="auth-story"><div className="auth-eyebrow">DEPARTMENT ARCHIVE</div><h2>Capstone <span>&amp;</span><br />Research<br />Archive Portal</h2><p>One shelf for every defended paper, prototype, and dataset the department produces — preserved, searchable, and credited.</p></div>
      <div className="auth-sidebar-footer">Access is granted by role: Student, Graduating Student, or Faculty.</div>
    </aside>
    <section className="auth-main">
      <ThemeToggle compact />
      <form className="auth-form" onSubmit={submit}>
        <h1>{signup ? "Create your account" : "Sign in"}</h1>
        <p className="auth-subtitle">{signup ? "Choose the role that matches your standing in the department." : "Use your departmental account to continue."}</p>
        {signup && <><label className="auth-field"><span className="auth-label">Full name</span><input className="auth-input" name="name" autoComplete="name" placeholder="Juan Dela Cruz" required /></label>
          <fieldset className="role-options"><legend className="auth-label">Role</legend>{accountRoles.map((item) => <label key={item.name} className="role-choice"><input type="radio" name="role" value={item.name} checked={role === item.name} onChange={() => setRole(item.name)} /><span><strong>{item.name}</strong><small>{item.detail}</small></span></label>)}</fieldset></>}
        <label className="auth-field"><span className="auth-label">Email</span><input className="auth-input" type="email" name="email" autoComplete="email" placeholder="example@gmail.com" required /></label>
        <div className="auth-field"><label htmlFor="password" className="auth-label">Password</label><div className="password-wrap"><input id="password" className="auth-input" type={showPassword ? "text" : "password"} name="password" autoComplete={signup ? "new-password" : "current-password"} placeholder="••••••••" required minLength={signup ? 8 : 1} /><Button type="button" variant="eye" size="eye" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</Button></div></div>
        <Button variant="auth" size="submit" type="submit">{signup ? "Create account" : "Sign in"}</Button>
        {notice && <p className="form-notice" role="status">{notice}</p>}
        <div className="auth-alternate">{signup ? <>Already registered?<Link to="/sign-in">Sign in</Link></> : <>No account yet?<Link to="/sign-up">Create one</Link></>}</div>
      </form>
      <Button variant="compact" size="sm" className="absolute bottom-5 right-5 text-[10px]" onClick={() => setGateOpen(!gateOpen)} aria-expanded={gateOpen}><Layers className="text-primary" />Role &amp; Gate Switcher</Button>
      {gateOpen && <div className="gate-menu">{accountRoles.map((item) => <Button key={item.name} variant="ghost" size="sm" className="w-full justify-start text-xs" asChild><Link to="/sign-up" onClick={() => { setRole(item.name); setGateOpen(false); }}>{item.name}</Link></Button>)}</div>}
    </section>
  </main></PortalTheme>;
}

export function pageHead(title: string, description: string) {
  return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
}