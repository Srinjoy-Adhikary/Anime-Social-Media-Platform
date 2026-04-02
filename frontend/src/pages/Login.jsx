import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth, EMAIL_REGEX, PASSWORD_REGEX } from '../context/AuthContext';
import './Auth.css';

function Login() {
    const [isLogin, setIsLogin]   = useState(true);
    const canvasRef  = useRef(null);
    const authBoxRef = useRef(null);
    const navigate   = useNavigate();
    const location   = useLocation();
    const { login, user }         = useAuth();

    // Where to go after login (supports redirect-back from ProtectedRoute)
    const from = location.state?.from?.pathname || '/feed';

    // If already logged in, skip straight to feed
    useEffect(() => {
        if (user) navigate(from, { replace: true });
    }, [user, navigate, from]);

    const [formData, setFormData] = useState({ username: '', email: '', password: '' });

    // ── Inline validation errors ──────────────────────────────────────────────
    const [errors,     setErrors]     = useState({});
    const [serverError, setServerError] = useState('');
    const [submitting, setSubmitting]  = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));

        // Clear the error for this field as the user types
        setErrors(p => ({ ...p, [name]: '' }));
        setServerError('');
    };

    // ── Client-side validation (mirrors backend regex) ────────────────────────
    const validate = () => {
        const errs = {};

        if (!isLogin && !formData.username.trim()) {
            errs.username = 'Username is required';
        }

        if (!EMAIL_REGEX.test(formData.email)) {
            errs.email = 'Enter a valid email address';
        }

        if (!isLogin && !PASSWORD_REGEX.test(formData.password)) {
            errs.password = 'Min 8 chars · uppercase · lowercase · number · special char (@$!%*?&^#)';
        } else if (isLogin && !formData.password) {
            errs.password = 'Password is required';
        }

        return errs;
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');

        const errs = validate();
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        setSubmitting(true);
        try {
            if (isLogin) {
                // login() is from AuthContext — sets user state + cookies automatically
                await login(formData.email, formData.password);
                navigate(from, { replace: true });
            } else {
                await axios.post('/api/auth/register', {
                    username: formData.username,
                    email:    formData.email,
                    password: formData.password,
                });
                setFormData({ username: '', email: '', password: '' });
                setIsLogin(true);
                setServerError(''); // reuse field to show success in green
                // Use a success state instead of alert
                setErrors({ _success: 'Soul Badge forged. You may now enter.' });
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'An error occurred. Try again.';
            setServerError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Particle engine (unchanged) ───────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx    = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const resizeCanvas = () => {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class SpiritualPressure {
            constructor() {
                this.x       = Math.random() * canvas.width;
                this.y       = Math.random() * canvas.height;
                this.size    = Math.random() * 2.5 + 0.5;
                this.speedY  = Math.random() * -2 - 0.5;
                this.speedX  = (Math.random() - 0.5) * 1.5;
                this.opacity = Math.random() * 0.6 + 0.2;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.y < 0) { this.y = canvas.height; this.x = Math.random() * canvas.width; }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                if (isLogin) {
                    ctx.fillStyle   = `rgba(255, 0, 60, ${this.opacity})`;
                    ctx.shadowColor = '#ff003c';
                } else {
                    ctx.fillStyle   = `rgba(0, 229, 255, ${this.opacity})`;
                    ctx.shadowColor = '#00e5ff';
                }
                ctx.shadowBlur = 15;
                ctx.fill();
            }
        }

        for (let i = 0; i < 100; i++) particles.push(new SpiritualPressure());

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isLogin]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className={`tybw-wrapper ${isLogin ? 'soul-reaper-mode' : 'quincy-mode'}`}>
            <canvas ref={canvasRef} id="reiatsu-bg" />

            <header className="seireitei-header">
                <h1 className="bleach-title">OTAKU VERSE</h1>
            </header>

            <div className="shattered-container">
                <div ref={authBoxRef} className="zanpakuto-box">
                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <h2 className="release-command">
                            {isLogin ? 'Scatter Senbonzakura.' : 'Behold The Almighty.'}
                        </h2>
                        <p className="sub-command">
                            {isLogin ? 'UNLOCK THE SEIREITEI' : 'Awaken Your Power'}
                        </p>

                        {/* ── Server / global error ── */}
                        {serverError && (
                            <p style={{ color: '#ff4466', fontSize: '.72rem', letterSpacing: '1.5px', textAlign: 'center', margin: '0 0 12px', padding: '8px 12px', background: 'rgba(255,0,60,.08)', border: '1px solid rgba(255,0,60,.22)', borderRadius: 2 }}>
                                {serverError}
                            </p>
                        )}

                        {/* ── Success message ── */}
                        {errors._success && (
                            <p style={{ color: '#4caf82', fontSize: '.72rem', letterSpacing: '1.5px', textAlign: 'center', margin: '0 0 12px', padding: '8px 12px', background: 'rgba(76,175,130,.08)', border: '1px solid rgba(76,175,130,.22)', borderRadius: 2 }}>
                                {errors._success}
                            </p>
                        )}

                        {/* ── Username (register only) ── */}
                        {!isLogin && (
                            <div className="reiatsu-input-group">
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    autoComplete="username"
                                />
                                <label>Designation (Username)</label>
                                <span className="slash-line" />
                                {errors.username && <FieldError msg={errors.username} />}
                            </div>
                        )}

                        {/* ── Email ── */}
                        <div className="reiatsu-input-group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                            <label>Reishi Signature (Email)</label>
                            <span className="slash-line" />
                            {errors.email && <FieldError msg={errors.email} />}
                        </div>

                        {/* ── Password ── */}
                        <div className="reiatsu-input-group">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                            />
                            <label>Sealed Command (Password)</label>
                            <span className="slash-line" />
                            {errors.password && <FieldError msg={errors.password} />}
                        </div>

                        <button type="submit" className="bankai-btn" disabled={submitting}>
                            <span className="btn-text">
                                {submitting ? '...' : (isLogin ? 'LOGIN' : 'REGISTER')}
                            </span>
                            <div className="btn-glitch" />
                        </button>

                        <p className="toggle-text">
                            {isLogin ? 'No Soul Badge? ' : 'Already of the Blood? '}
                            <span
                                className="toggle-link"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setErrors({});
                                    setServerError('');
                                    setFormData({ username: '', email: '', password: '' });
                                }}
                            >
                                {isLogin ? 'Awaken Here' : 'Return to Seireitei'}
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ── Tiny inline field-error label ────────────────────────────────────────────
function FieldError({ msg }) {
    return (
        <span style={{
            display: 'block',
            marginTop: 5,
            color: '#ff4466',
            fontSize: '.62rem',
            letterSpacing: '1px',
        }}>
            ⚠ {msg}
        </span>
    );
}

export default Login;
