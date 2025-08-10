// frontend/src/pages/LoginPage.jsx

import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import { Alert, Link } from '@mui/material';

function LoginPage({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

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
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Login do Sistema
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nome de Usuário"
            name="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Entrar
          </Button>

          <Link href="#" variant="body2" onClick={onSwitchToRegister}>
            {"Não tem uma conta? Cadastre-se"}
          </Link>
          
        </Box>
      </Box>
    </Container>
  );
}

export default LoginPage;