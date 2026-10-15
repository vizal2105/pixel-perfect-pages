import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Check, Clock, SquareCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalLogo, PortalTheme, ThemeToggle, pageHead } from '@/components/portal';
import { supabase } from '@/integrations/supabase/client';
import { getFacultyAccount } from '@/lib/faculty.functions';

const accountOptions = queryOptions({ queryKey: ['faculty-account'], queryFn: () => getFacultyAccount(), retry: false, staleTime: 0 });

export const Route = createFileRoute('/_authenticated/faculty-dashboard')({
  head: () => pageHead('Review Queue | DCRAP', 'Faculty review graduating student manuscripts: inspect, approve, or request revisions.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(accountOptions),
  component: FacultyDashboard,
  errorComponent: FacultyAccessError,
});

function FacultyAccessError() {
  return <PortalTheme><main className="admin-page"><p className="directory-message" role="alert">An approved Faculty account is required to open this dashboard.</p><Button asChild variant="link"><Link to="/sign-in">Return to sign in</Link></Button></main></PortalTheme>;
}

const tabs = [
  { key: 'pending', label: 'Pending', icon: Clock, empty: 'No manuscripts are waiting for review.' },
  { key: 'approved', label: 'Approved', icon: Check, empty: 'No approved manuscripts yet.' },
  { key: 'rejected', label: 'Rejected', icon: X, empty: 'No rejected manuscripts.' },
] as const;

function FacultyDashboard() {
  const { data } = useSuspenseQuery(accountOptions);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<(typeof tabs)[number]['key']>('pending');
  async function signOut() {
    await queryClient.cancelQueries(); queryClient.clear();
    await supabase.auth.signOut(); await navigate({ to: '/sign-in', replace: true });
  }
  const current = tabs.find(t => t.key === tab)!;
  return <PortalTheme><div className="admin-page student-page">
    <header className="admin-header"><div className="admin-header-inner"><div className="admin-brand"><span className="student-logo"><PortalLogo /><small>RESEARCH ARCHIVE</small></span><span className="admin-separator">|</span><span>Review Queue</span></div>
      <nav aria-label="Faculty navigation"><ThemeToggle /><span className="admin-identity">{data.name}</span><Button variant="ghost" size="nav" onClick={signOut}>Sign out</Button></nav></div></header>
    <main className="review-content">
      <h1 className="student-title"><SquareCheck />Review queue</h1>
      <p className="student-subtitle">Manage graduating student manuscripts. Inspect, approve, request revisions, or delete entries.</p>
      <div className="review-tabs" role="tablist">{tabs.map(t => <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} data-kind={t.key} className="review-tab" onClick={() => setTab(t.key)}><t.icon />{t.label}<span className="count">0</span></button>)}</div>
      <div className="review-empty">{current.empty}</div>
    </main>
  </div></PortalTheme>;
}
