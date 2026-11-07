import { useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const HOME_URL = import.meta.env.VITE_HOME_URL || '/';

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isStrongPassword(value) {
  return value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value);
}

async function postJson(path, payload) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  let body = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  return { response, body };
}

export default function App() {
  const [mode, setMode] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRemember, setLoginRemember] = useState(false);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loginReady = useMemo(() => isValidEmail(loginEmail) && loginPassword.trim().length > 0, [loginEmail, loginPassword]);
  const signupReady = useMemo(() => signupName.trim().length >= 2 && isValidEmail(signupEmail) && isStrongPassword(signupPassword) && signupPassword === signupConfirm && termsAccepted, [signupName, signupEmail, signupPassword, signupConfirm, termsAccepted]);

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setError('');
    setStatus('');

    if (!isValidEmail(loginEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    if (loginPassword.trim().length === 0) {
      setError('Password is required.');
      return;
    }

    setBusy(true);
    try {
      const { response, body } = await postJson('/auth/login', {
        email: loginEmail.trim(),
        password: loginPassword,
        remember: loginRemember
      });

      if (!response.ok) {
        setError(body.error || 'Unable to sign in.');
        return;
      }

      if (body.token) {
        localStorage.setItem('travelsense_token', body.token);
      }
      setStatus(body.message || 'Signed in successfully. Redirecting...');
      window.location.href = HOME_URL;
    } catch (err) {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSignupSubmit(event) {
    event.preventDefault();
    setError('');
    setStatus('');

    if (signupName.trim().length < 2) {
      setError('Full name is required.');
      return;
    }

    if (!isValidEmail(signupEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!isStrongPassword(signupPassword)) {
      setError('Use 8+ characters with uppercase, lowercase, number, and symbol.');
      return;
    }

    if (signupPassword !== signupConfirm) {
      setError('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the terms to continue.');
      return;
    }

    setBusy(true);
    try {
      const { response, body } = await postJson('/auth/register', {
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword
      });

      if (!response.ok) {
        setError(body.error || 'Unable to create account.');
        return;
      }

      setStatus(body.message || 'Account created. You can now sign in.');
      setMode('login');
      setLoginEmail(signupEmail.trim());
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirm('');
      setTermsAccepted(false);
    } catch (err) {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen">
      <aside className="brand-panel">
        <div className="brand-top">
          <div className="brand-mark">◉</div>
          <div className="brand-name">TravelSense</div>
        </div>
        <div className="brand-mid">
          <span className="eyebrow">Smart Tourism Discovery</span>
          <h1 className="headline">Explore Bangladesh <em>with confidence.</em></h1>
          <p className="sub">Sign in to pick up your saved destinations, wishlist, and trip plans.</p>
        </div>
      </aside>

      <main className="form-panel">
        <section className="form-card">
          <header className="form-head">
            <span className="eyebrow-dark">Welcome back</span>
            <h1>{mode === 'login' ? 'Sign in to TravelSense' : 'Create your TravelSense account'}</h1>
            <p>
              {mode === 'login' ? (
                <>New here? <button type="button" className="link-button" onClick={() => setMode('signup')}>Create an account</button></>
              ) : (
                <>Already registered? <button type="button" className="link-button" onClick={() => setMode('login')}>Sign in</button></>
              )}
            </p>
          </header>

          <div className="auth-switcher" role="tablist" aria-label="Authentication mode">
            <button type="button" className={mode === 'login' ? 'is-active' : ''} onClick={() => setMode('login')}>Sign in</button>
            <button type="button" className={mode === 'signup' ? 'is-active' : ''} onClick={() => setMode('signup')}>Create account</button>
          </div>

          {mode === 'login' ? (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <label className="field">
                <span>Email</span>
                <input type="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" />
              </label>

              <label className="field">
                <span>Password</span>
                <div className="password-wrap">
                  <input type={showLoginPassword ? 'text' : 'password'} value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" />
                  <button type="button" className="toggle-password" onClick={() => setShowLoginPassword((value) => !value)}>{showLoginPassword ? 'Hide' : 'Show'}</button>
                </div>
              </label>

              <div className="row-between">
                <label className="remember">
                  <input type="checkbox" checked={loginRemember} onChange={(event) => setLoginRemember(event.target.checked)} />
                  Remember me
                </label>
                <button type="button" className="link-button">Forgot password?</button>
              </div>

              <button type="submit" className="btn-primary" disabled={!loginReady || busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
              {error ? <p className="status-msg error">{error}</p> : null}
              {status ? <p className="status-msg">{status}</p> : null}
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSignupSubmit}>
              <div className="row-stack">
                <label className="field">
                  <span>Full name</span>
                  <input type="text" value={signupName} onChange={(event) => setSignupName(event.target.value)} placeholder="Your name" autoComplete="name" />
                </label>
                <label className="field">
                  <span>Email</span>
                  <input type="email" value={signupEmail} onChange={(event) => setSignupEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" />
                </label>
              </div>

              <div className="row-stack">
                <label className="field">
                  <span>Password</span>
                  <div className="password-wrap">
                    <input type={showSignupPassword ? 'text' : 'password'} value={signupPassword} onChange={(event) => setSignupPassword(event.target.value)} placeholder="Create a password" autoComplete="new-password" />
                    <button type="button" className="toggle-password" onClick={() => setShowSignupPassword((value) => !value)}>{showSignupPassword ? 'Hide' : 'Show'}</button>
                  </div>
                </label>
                <label className="field">
                  <span>Confirm password</span>
                  <div className="password-wrap">
                    <input type={showSignupConfirm ? 'text' : 'password'} value={signupConfirm} onChange={(event) => setSignupConfirm(event.target.value)} placeholder="Repeat password" autoComplete="new-password" />
                    <button type="button" className="toggle-password" onClick={() => setShowSignupConfirm((value) => !value)}>{showSignupConfirm ? 'Hide' : 'Show'}</button>
                  </div>
                </label>
              </div>

              <p className="helper-text">Use 8+ characters with uppercase, lowercase, number, and symbol.</p>

              <label className="remember">
                <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
                I agree to the Terms and Privacy Policy
              </label>

              <button type="submit" className="btn-primary" disabled={!signupReady || busy}>{busy ? 'Creating account...' : 'Create account'}</button>
              {error ? <p className="status-msg error">{error}</p> : null}
              {status ? <p className="status-msg">{status}</p> : null}
            </form>
          )}
        </section>
      </main>
    </div>
  );
}