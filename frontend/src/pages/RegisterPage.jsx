import { useState } from 'react';
import './RegisterPage.css';

function RegisterPage({ onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome_usuario: username, email: email, senha: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Cadastro realizado com sucesso! Volte para a tela de login para entrar.");
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
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>CADASTRAR</h1>
          <p>Preencha seus dados para se cadastrar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
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
            <label htmlFor="email">Endereço de E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Digite seu e-mail"
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
              placeholder="Crie uma senha"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <button 
            type="submit" 
            className={`register-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          <div className="login-link">
            <span>Já tem uma conta? </span>
            <button 
              type="button" 
              className="link-button" 
              onClick={onSwitchToLogin}
            >
              Faça login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;

