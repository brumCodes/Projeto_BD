// frontend/src/App.jsx

import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const handleLoginSuccess = (dadosDoUsuario) => {
    setUsuarioLogado(dadosDoUsuario);
  };

  return (
    <div>
      {usuarioLogado ? (
        <DashboardPage usuario={usuarioLogado} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;