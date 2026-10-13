import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Archive, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalLogo, PortalTheme, ThemeToggle, pageHead } from '@/components/portal';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/_authenticated/dashboard')({
  head: () => pageHead('Search the Archive | DCRAP', 'Browse approved capstone projects and research papers.'),
  component: StudentDashboard,
});

function StudentDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [term, setTerm] = useState('');
  const profile = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error('No session');
      const [{ data: p }, { data: roles }] = await Promise.all([
        supabase.from('profiles').select('full_name,status').eq('id', auth.user.id).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', auth.user.id),
      ]);
      return { name: p?.full_name || 'Student', status: p?.status, role: roles?.[0]?.role };
    },
  });
  async function signOut() {
    await queryClient.cancelQueries(); queryClient.clear();
    await supabase.auth.signOut(); await navigate({ to: '/sign-in', replace: true });
  }
  const allowed = profile.data?.role === 'student' && profile.data.status === 'approved';
  const submit = (e: FormEvent) => e.preventDefault();
  return <PortalTheme><div className="admin-page student-page">
    <header className="admin-header"><div className="admin-header-inner"><div className="admin-brand"><span className="student-logo"><PortalLogo /><small>RESEARCH ARCHIVE</small></span><span className="admin-separator">|</span><span>Search Archive</span></div>
      <nav aria-label="Student navigation"><ThemeToggle />{profile.data && <span className="admin-identity">{profile.data.name}</span>}<Button variant="ghost" size="nav" onClick={signOut}>Sign out</Button></nav></div></header>
    <main className="student-content">
      {profile.isPending ? <p className="directory-message">Loading…</p> : !allowed ? <p className="directory-message" role="alert">This dashboard is available to approved student accounts only.</p> : <>
        <h1 className="student-title"><Search />Search the archive</h1>
        <p className="student-subtitle">Browse approved capstone projects and research papers.</p>
        <form className="student-search" onSubmit={submit}>
          <div className="student-search-row"><label className="student-input"><Search /><input value={term} onChange={e => setTerm(e.target.value)} placeholder="Search by title, author, abstract, or program..." aria-label="Search the archive" /></label><Button type="submit" variant="auth" className="student-search-btn"><Search />Search</Button></div>
          <div className="student-search-foot"><select className="student-select" aria-label="Sort order" defaultValue="latest"><option value="latest">Latest</option><option value="oldest">Oldest</option><option value="title">Title A–Z</option></select><span className="archived-pill"><Archive />Archived Manuscripts<span className="count">0</span></span></div>
        </form>
      </>}
    </main>
  </div></PortalTheme>;
}
