import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import FilmeDetalhesPage from './pages/FilmeDetalhesPage';
import ProfilePage from './pages/ProfilePage';
import ListaDeFilmesPage from './pages/ListaDeFilmesPage';
import './App.css';

function MainApp() {
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem('usuarioLogado');
        if (usuarioSalvo) {
            setUsuarioLogado(JSON.parse(usuarioSalvo));
        }
    }, []);

    const handleLoginSuccess = (dadosDoUsuario) => {
        setUsuarioLogado(dadosDoUsuario);
        localStorage.setItem('usuarioLogado', JSON.stringify(dadosDoUsuario));
        navigate('/dashboard');
    };

    const handleLogout = () => {
        setUsuarioLogado(null);
        localStorage.removeItem('usuarioLogado');
        navigate('/');
    };

    const handleSwitchToRegister = () => {
        navigate('/register');
    };

    const handleSwitchToLogin = () => {
        navigate('/');
    };

    const handleVerPerfil = () => {
        if (usuarioLogado) {
            navigate(`/perfil/${usuarioLogado.id}`);
        } else {
            navigate('/');
        }
    };

    const handleVerListaCompleta = (listaNome) => {
        if (usuarioLogado) {
            navigate(`/lista/${listaNome}/${usuarioLogado.id}`);
        }
    };

    return (
        <Routes>
            <Route 
                path="/" 
                element={<LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToRegister={handleSwitchToRegister} />} 
            />
            <Route 
                path="/register" 
                element={<RegisterPage onSwitchToLogin={handleSwitchToLogin} />} 
            />
            <Route 
                path="/dashboard" 
                element={
                    usuarioLogado ? (
                        <DashboardPage 
                            usuario={usuarioLogado} 
                            onLogout={handleLogout}
                            onVerPerfil={handleVerPerfil}
                        />
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToRegister={handleSwitchToRegister} />
                    )
                } 
            />
            <Route 
                path="/filme/:filmeId" 
                element={
                    <FilmeDetalhesPage 
                        usuario={usuarioLogado}
                        onVoltar={() => navigate('/dashboard')}
                    />
                } 
            />
            <Route 
                path="/perfil/:id" 
                element={
                    <ProfilePage 
                        usuario={usuarioLogado}
                        onLogout={handleLogout}
                        onReturnToDashboard={() => navigate('/dashboard')}
                        onVerListaCompleta={handleVerListaCompleta}
                    />
                } 
            />
            <Route 
                path="/lista/:listaNome/:id" 
                element={
                    usuarioLogado ? (
                        <ListaDeFilmesPage 
                            usuario={usuarioLogado}
                            onLogout={handleLogout}
                        />
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToRegister={handleSwitchToRegister} />
                    )
                } 
            />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <MainApp />
        </Router>
    );
}

export default App;