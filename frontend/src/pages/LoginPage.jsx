import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';

// A função agora tem o nome da nossa página
function LoginPage() {
  return (
    // O Container ajuda a centralizar o conteúdo na tela
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      
      {/* O Box é como uma "div". Usamos para organizar os itens verticalmente */}
      <Box
        sx={{
          marginTop: 8, // Margem no topo
          display: 'flex',
          flexDirection: 'column', // Itens um embaixo do outro
          alignItems: 'center', // Alinha os itens no centro
        }}
      >
        <Typography component="h1" variant="h5">
          Login do Sistema
        </Typography>

        {/* Formulário (usamos um Box para agrupar os campos) */}
        <Box component="form" sx={{ mt: 1 }}>
          
          {/* Campo de texto para o Email */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Endereço de E-mail"
            name="email"
            autoComplete="email"
            autoFocus
          />

          {/* Campo de texto para a Senha */}
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
          />

          {/* Botão de Entrar */}
          <Button
            type="submit"
            fullWidth
            variant="contained" // 'contained' dá o estilo de botão preenchido
            sx={{ mt: 3, mb: 2 }} // Margem em cima (mt) e embaixo (mb)
          >
            Entrar
          </Button>

        </Box>
      </Box>
    </Container>
  );
}

// Exportamos o nosso novo componente
export default LoginPage;