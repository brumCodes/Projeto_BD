import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import FilmeDetalhesPage from './pages/FilmeDetalhesPage';
import './App.css';

// Componente principal com a lógica de roteamento
function MainApp() {
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [filmeSelecionado, setFilmeSelecionado] = useState(null);
    const navigate = useNavigate();

    const handleLoginSuccess = (dadosDoUsuario) => {
        setUsuarioLogado(dadosDoUsuario);
        navigate('/dashboard');
    };

    // Esta função agora passa o filme e navega
    const handleVerDetalhes = (filme) => {
        setFilmeSelecionado(filme);
        navigate('/filmeDetalhes');
    };

    const handleLogout = () => {
        setUsuarioLogado(null);
        navigate('/');
    };

    return (
        <Routes>
            <Route path="/" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
                path="/dashboard" 
                element={
                    usuarioLogado ? (
                        // A prop onVerDetalhes é passada aqui
                        <DashboardPage 
                            usuario={usuarioLogado} 
                            onVerDetalhes={handleVerDetalhes}
                            onLogout={handleLogout}
                        />
                    ) : (
                        <LoginPage onLoginSuccess={handleLoginSuccess} />
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
                        />
                    ) : (
                        <DashboardPage 
                            usuario={usuarioLogado} 
                            onVerDetalhes={handleVerDetalhes}
                            onLogout={handleLogout}
                        />
                    )
                } 
            />
        </Routes>
    );
}

// O componente App.js deve apenas envolver o MainApp com o Router
function App() {
    return (
        <Router>
            <MainApp />
        </Router>
    );
}

export default App;