import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import FilmeDetalhesPage from './pages/FilmeDetalhesPage';
import './App.css';

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [view, setView] = useState('login'); 
  const [filmeSelecionado, setFilmeSelecionado] = useState(null);

  const handleLoginSuccess = (dadosDoUsuario) => {
    setUsuarioLogado(dadosDoUsuario);
    setView('dashboard');
  };

    const handleVerDetalhes = (filme) => {
    setFilmeSelecionado(filme);
    setView('filmeDetalhes');
  };

const renderView = () => {
  if (usuarioLogado) {
    if (view === 'filmeDetalhes') {
      return <FilmeDetalhesPage 
        filme={filmeSelecionado} 
        onVoltar={() => setView('dashboard')} 
      />;
    }
    return <DashboardPage 
      usuario={usuarioLogado} 
      onVerDetalhes={handleVerDetalhes}
      onLogout={() => {
        setUsuarioLogado(null);
        setView('login');
      }} 
    />;
  }
  if (view === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setView('register')} />;
  }
  if (view === 'register') {
    return <RegisterPage onSwitchToLogin={() => setView('login')} />;
  }
};

  return <div>{renderView()}</div>;
}

export default App;
