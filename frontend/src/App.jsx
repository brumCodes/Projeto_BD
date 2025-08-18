import React, { useState } from 'react';
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
    const [filmeSelecionado, setFilmeSelecionado] = useState(null);
    const navigate = useNavigate();

    const handleLoginSuccess = (dadosDoUsuario) => {
        setUsuarioLogado(dadosDoUsuario);
        navigate('/dashboard');
    };

    const handleVerDetalhes = (filme) => {
        setFilmeSelecionado(filme);
        navigate('/filmeDetalhes');
    };

    const handleLogout = () => {
        setUsuarioLogado(null);
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

    // ALTERAÇÃO CRUCIAL AQUI: Agora passamos o ID do usuário para a navegação
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
                            onVerDetalhes={handleVerDetalhes}
                            onLogout={handleLogout}
                            onVerPerfil={handleVerPerfil}
                        />
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToRegister={handleSwitchToRegister} />
                    )
                } 
            />
            <Route 
                path="/filmeDetalhes" 
                element={
                    filmeSelecionado ? (
                        <FilmeDetalhesPage 
                            key={filmeSelecionado.id_filme}
                            filme={filmeSelecionado} 
                            onVoltar={() => navigate('/dashboard')}
                            usuario={usuarioLogado}
                        />
                    ) : (
                        <DashboardPage 
                            usuario={usuarioLogado} 
                            onVerDetalhes={handleVerDetalhes}
                            onLogout={handleLogout}
                            onVerPerfil={handleVerPerfil}
                        />
                    )
                } 
            />
            <Route 
                path="/perfil/:id" 
                element={
                    <ProfilePage 
                        usuario={usuarioLogado}
                        onLogout={handleLogout}
                        onVerDetalhes={handleVerDetalhes} 
                        onReturnToDashboard={() => navigate('/dashboard')}
                        onVerListaCompleta={handleVerListaCompleta}
                    />
                } 
            />
            {/* NOVA ROTA ADICIONADA: AGORA COM ID DO USUÁRIO NA URL */}
            <Route 
                path="/lista/:listaNome/:id" 
                element={
                    usuarioLogado ? (
                        <ListaDeFilmesPage 
                            usuario={usuarioLogado}
                            onLogout={handleLogout}
                            onVerDetalhes={handleVerDetalhes}
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
