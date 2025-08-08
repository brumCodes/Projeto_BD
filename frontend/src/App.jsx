// frontend/src/App.jsx

import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState("Carregando...");

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/status')
      .then(response => response.json())
      .then(data => {
        setMessage(data.status);
      })
      .catch(error => {
        console.error("Erro ao conectar com o backend:", error);
        setMessage("Falha ao conectar com o backend. Verifique se o servidor está rodando.");
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Teste de Conexão Frontend-Backend</h1>
        <h2>Status do Backend: <span style={{ color: '#61DAFB' }}>{message}</span></h2>
      </header>
    </div>
  );
}

export default App;