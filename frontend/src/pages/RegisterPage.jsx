import { useState } from 'react';
import { Button, TextField, Container, Box, Typography, CssBaseline, Alert, Link } from '@mui/material';
import './RegisterPage.css';  // Importa o CSS

function RegisterPage({ onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

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
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box className="registerContainer">
        <Typography component="h1" variant="h5">
          Criar Conta
        </Typography>
        <Box component="form" onSubmit={handleSubmit} className="registerForm">
          <TextField
            margin="normal" required fullWidth id="username"
            label="Nome de Usuário" name="username" autoFocus
            value={username} onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal" required fullWidth id="email"
            label="Endereço de E-mail" name="email" type="email"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal" required fullWidth name="password"
            label="Senha" type="password" id="password"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          
          {error && <Alert severity="error" className="alertMargin">{error}</Alert>}
          {success && <Alert severity="success" className="alertMargin">{success}</Alert>}

          <Button type="submit" fullWidth variant="contained" className="registerButton">
            Cadastrar
          </Button>
          <Link href="#" variant="body2" onClick={onSwitchToLogin}>
            {"Já tem uma conta? Faça login"}
          </Link>
        </Box>
      </Box>
    </Container>
  );
}

export default RegisterPage;
