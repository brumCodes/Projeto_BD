import React from 'react';
import LoginPage from './pages/LoginPage'; // Importa a página de login que criamos
import './App.css';

function App() {
  return (
    <div>
      {/* O App agora tem apenas a responsabilidade de mostrar a nossa página de login */}
      <LoginPage />
    </div>
  );
}

export default App;