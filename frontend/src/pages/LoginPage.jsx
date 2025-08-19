import { useState } from 'react';
import './LoginPage.css';
import logoCineTrack from '/images/cinetrack-logo3.png'; 

function LoginPage({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome_usuario: username, senha: password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(data.usuario);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Erro de conexão:", err);
      setError("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        <img 
          src={logoCineTrack} 
          alt="Logo CineTrack" 
          className="login-logo"
        />

        <div className="login-header">
          <h1>ENTRAR</h1>
          <p>Acesse sua conta</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Nome de Usuário</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              placeholder="Digite seu nome de usuário"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Digite sua senha"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="register-link">
            <span>Não tem uma conta? </span>
            <button 
              type="button" 
              className="link-button" 
              onClick={onSwitchToRegister}
            >
              Cadastre-se
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;