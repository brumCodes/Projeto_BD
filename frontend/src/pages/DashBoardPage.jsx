// frontend/src/pages/DashboardPage.jsx

import React from 'react';
// 1. Importamos os novos componentes e ícones que vamos usar
import { 
  Box, AppBar, Toolbar, Typography, Button, Container, IconButton, TextField 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';

function DashboardPage({ usuario, onLogout }) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      
      {/* =============================================================== */}
      {/* INÍCIO DO NOVO CABEÇALHO (AppBar)                             */}
      {/* =============================================================== */}
      <AppBar position="static">
        <Toolbar>
          {/* Espaço da Logo */}
          <Typography variant="h6" component="div" sx={{ mr: 2 }}>
            Logo
          </Typography>

          {/* Barra de Pesquisa */}
          <Box sx={{ 
            position: 'relative',
            borderRadius: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
            },
            width: '50%', // Ocupa metade da largura
          }}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Pesquisar filmes..."
              sx={{ 
                '.MuiInputBase-input': { padding: 1, color: 'white' },
                fieldset: { border: 'none' },
              }}
            />
          </Box>
          
          {/* Filtros (usamos um espaçador para empurrar o resto para a direita) */}
          <Box sx={{ flexGrow: 1, ml: 2 }}>
             <Button color="inherit">Filtros</Button>
          </Box>

          {/* Botão de Adicionar Filme */}
          <Button 
            variant="contained" 
            color="secondary" // Uma cor diferente para dar destaque
            startIcon={<AddIcon />}
            sx={{ mr: 2 }}
          >
            Add Filme
          </Button>

          {/* Ícone de Perfil */}
          <IconButton color="inherit">
            <PersonIcon />
          </IconButton>

          {/* Botão de Sair (Logout) */}
          <Button color="inherit" onClick={onLogout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      {/* =============================================================== */}
      {/* FIM DO NOVO CABEÇALHO (AppBar)                                 */}
      {/* =============================================================== */}

      {/* Área de conteúdo principal da página */}
      <Container sx={{ mt: 4 }}>
        {/* Aqui vamos adicionar o catálogo de filmes no próximo passo */}
        <Typography variant="h4">
          Catálogo de Filmes
        </Typography>
      </Container>
      
    </Box>
  );
}

export default DashboardPage;