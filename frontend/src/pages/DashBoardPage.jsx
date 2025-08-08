// frontend/src/pages/DashboardPage.jsx

import React from 'react';
import { Box, Typography } from '@mui/material';

function DashboardPage({ usuario }) {
  return (
    <Box sx={{ padding: 4, textAlign: 'center' }}>
      <Typography variant="h4">
        Painel de Controle
      </Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>
        Bem-vindo(a), {usuario.nome_usuario}!
      </Typography>
    </Box>
  );
}

export default DashboardPage;