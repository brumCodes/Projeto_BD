import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [view, setView] = useState('login'); 

  const handleLoginSuccess = (dadosDoUsuario) => {
    setUsuarioLogado(dadosDoUsuario);
  };

  const renderView = () => {
    if (usuarioLogado) {
      return <DashboardPage usuario={usuarioLogado} />;
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