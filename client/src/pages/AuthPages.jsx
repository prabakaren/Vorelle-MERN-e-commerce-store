import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// One form component powers both Login and Register.
function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container auth">
      <form className="panel" onSubmit={submit}>
        <h1>{isRegister ? 'Create your account' : 'Welcome back'}</h1>
        {error && <p className="alert alert-error">{error}</p>}

        {isRegister && (
          <label>
            Full name
            <input
              value={form.name}
              onChange={set('name')}
              required
              autoComplete="name"
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            required
            minLength={6}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
          {isRegister && <small className="muted">At least 6 characters</small>}
        </label>

        <button className="btn btn-block" disabled={loading}>
          {loading ? 'Please wait' : isRegister ? 'Create account' : 'Log in'}
        </button>
        <p className="muted center">
          {isRegister ? 'Already have an account? ' : 'New to Vorelle? '}
          <Link
            to={isRegister ? '/login' : '/register'}
            state={location.state}
            className="text-link"
          >
            {isRegister ? 'Log in' : 'Create an account'}
          </Link>
        </p>
      </form>
    </div>
  );
}

export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;
