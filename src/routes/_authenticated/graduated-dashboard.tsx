import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { queryOptions, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { FileText, LogOut, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalLogo, PortalTheme, ThemeToggle, pageHead } from '@/components/portal';
import { supabase } from '@/integrations/supabase/client';
import { getGraduatedAccount } from '@/lib/graduated.functions';

const accountOptions = queryOptions({
  queryKey: ['graduated-account'],
  queryFn: () => getGraduatedAccount(),
  retry: false,
  staleTime: 0,
});

export const Route = createFileRoute('/_authenticated/graduated-dashboard')({
  head: () => pageHead('Submit Work | DCRAP', 'Graduated Students can prepare their capstone or research manuscript and view their submissions.'),
  loader: ({ context }) => context.queryClient.ensureQueryData(accountOptions),
  component: GraduatedDashboard,
  errorComponent: GraduatedAccessError,
});

function GraduatedAccessError() {
  return <PortalTheme><main className="admin-page"><p className="directory-message" role="alert">An approved Graduated Student account is required to open this dashboard.</p><Button asChild variant="link"><Link to="/sign-in">Return to sign in</Link></Button></main></PortalTheme>;
}

function GraduatedDashboard() {
  useSuspenseQuery(accountOptions);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [kind, setKind] = useState('Capstone');
  const [notice, setNotice] = useState('');
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: '/sign-in', replace: true });
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice('Manuscript submissions are not available yet. Your work has not been uploaded.');
  }
  return <PortalTheme><div className="admin-page student-page graduated-page">
    <header className="admin-header"><div className="admin-header-inner"><div className="admin-brand"><span className="student-logo"><PortalLogo /><small>RESEARCH ARCHIVE</small></span><span className="admin-separator">|</span><span>Submit Work</span></div><nav aria-label="Graduated Student navigation"><ThemeToggle /><Button variant="ghost" size="icon" onClick={signOut} title="Sign out" aria-label="Sign out"><LogOut /></Button></nav></div></header>
    <main className="graduated-content">
      <section aria-labelledby="upload-title">
        <h1 id="upload-title" className="student-title"><Upload />Upload your work</h1>
        <p className="student-subtitle">Submit your capstone or thesis. It stays pending until faculty review it.</p>
        <form className="manuscript-form" onSubmit={submit}>
          <label className="manuscript-field"><span>Title</span><input className="auth-input" name="title" placeholder="Enter manuscript title" required /></label>
          <fieldset className="manuscript-types"><legend>Manuscript type <span className="text-primary">*</span></legend><div>{['Capstone', 'Research'].map(type => <label key={type} className="manuscript-type"><input type="radio" name="manuscriptType" value={type} checked={kind === type} onChange={() => setKind(type)} /><span>{type}</span></label>)}</div></fieldset>
          <div className="manuscript-pair">
            <label className="manuscript-field"><span>Author(s)</span><input className="auth-input" name="authors" placeholder="Comma separated" required /></label>
            <label className="manuscript-field"><span>Program</span><input className="auth-input" name="program" placeholder="BS Computer Science" required /></label>
          </div>
          <div className="manuscript-pair">
            <label className="manuscript-field"><span>Date completed</span><input className="auth-input" type="date" name="completed" required /></label>
            <label className="manuscript-field"><span>Keywords</span><input className="auth-input" name="keywords" placeholder="archive, machine learning" /></label>
          </div>
          <label className="manuscript-field"><span>Abstract</span><textarea className="auth-input manuscript-abstract" name="abstract" placeholder="Provide an overview of methodology and core contributions..." required /></label>
          <label className="manuscript-field"><span>Manuscript file</span><input className="auth-input manuscript-file" type="file" name="file" accept=".pdf,.doc,.docx" required /></label>
          <Button variant="auth" type="submit" className="manuscript-submit"><Upload />Submit work</Button>
          {notice && <p className="form-notice" role="status">{notice}</p>}
        </form>
      </section>
      <section className="manuscript-submissions" aria-labelledby="submissions-title"><h2 id="submissions-title" className="student-title"><FileText />Your submissions</h2><p>Nothing submitted yet.</p></section>
    </main>
  </div></PortalTheme>;
}