import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Needed for redirecting
import axios from 'axios'; // 👈 Needed for your API calls
import './Auth.css';

function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const canvasRef = useRef(null);
    const authBoxRef = useRef(null);
    const navigate = useNavigate(); // 👈 Initialize navigation

    // 👇 YOUR MISSING STATE IS HERE 👇
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- API SUBMISSION LOGIC ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                const res = await axios.post(
                    "/api/auth/login",
                    {
                        email: formData.email,
                        password: formData.password
                    }
                );

                localStorage.setItem("token", res.data.token);
                localStorage.setItem("userId", res.data.user.id);

                alert("Login successful");
                navigate("/feed"); // Redirect to your Otaku Verse feed!

            } else {
                await axios.post(
                    "/api/auth/register",
                    {
                        username: formData.username,
                        email: formData.email,
                        password: formData.password
                    }
                );
                
                alert("Registration successful");

                // Clear form and switch to login
                setFormData({ username: "", email: "", password: "" });
                setIsLogin(true);
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Error occurred");
        }
    };

    // --- REIATSU / REISHI PARTICLE ENGINE ---
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class SpiritualPressure {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2.5 + 0.5;
                this.speedY = Math.random() * -2 - 0.5; 
                this.speedX = (Math.random() - 0.5) * 1.5;
                this.opacity = Math.random() * 0.6 + 0.2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.y < 0) {
                    this.y = canvas.height;
                    this.x = Math.random() * canvas.width;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                
                if (isLogin) {
                    ctx.fillStyle = `rgba(255, 0, 60, ${this.opacity})`;
                    ctx.shadowColor = '#ff003c';
                } else {
                    ctx.fillStyle = `rgba(0, 229, 255, ${this.opacity})`;
                    ctx.shadowColor = '#00e5ff';
                }
                
                ctx.shadowBlur = 15;
                ctx.fill();
            }
        }

        for (let i = 0; i < 100; i++) {
            particles.push(new SpiritualPressure());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isLogin]); 

    // --- BLEACH UI RENDER ---
    return (
        <div className={`tybw-wrapper ${isLogin ? 'soul-reaper-mode' : 'quincy-mode'}`}>
            <canvas ref={canvasRef} id="reiatsu-bg"></canvas>
            
            <header className="seireitei-header">
                <h1 className="bleach-title">OTAKU VERSE</h1>
                <p className="chapter-text">
                    {isLogin ? "" : ""}
                </p>
            </header>

            <div className="shattered-container">
                <div ref={authBoxRef} className="zanpakuto-box">
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <h2 className="release-command">
                            {isLogin ? 'Scatter Senbonzakura.' : 'Behold The Almighty.'}
                        </h2>
                        <p className="sub-command">
                            {isLogin ? 'UNLOCK THE SEIREITEI' : 'Awaken Your Power'}
                        </p>
                        
                        {!isLogin && (
                            <div className="reiatsu-input-group">
                                <input type="text" required name="username" value={formData.username} onChange={handleChange} />
                                <label>Designation (Username)</label>
                                <span className="slash-line"></span>
                            </div>
                        )}
                        
                        <div className="reiatsu-input-group">
                            <input type="email" required name="email" value={formData.email} onChange={handleChange} />
                            <label>Reishi Signature (Email)</label>
                            <span className="slash-line"></span>
                        </div>
                        
                        <div className="reiatsu-input-group">
                            <input type="password" required name="password" value={formData.password} onChange={handleChange} />
                            <label>Sealed Command (Password)</label>
                            <span className="slash-line"></span>
                        </div>
                        
                        <button type="submit" className="bankai-btn">
                            <span className="btn-text">{isLogin ? 'LOGIN' : 'REGISTER'}</span>
                            <div className="btn-glitch"></div>
                        </button>
                        
                        <p className="toggle-text">
                            {isLogin ? 'No Soul Badge? ' : 'Already of the Blood? '}
                            <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? 'Awaken Here' : 'Return to Seireitei'}
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;