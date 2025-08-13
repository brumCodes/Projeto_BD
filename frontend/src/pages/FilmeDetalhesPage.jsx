// frontend/src/pages/FilmeDetalhesPage.jsx
import React from 'react';
import { Box, Typography, Container, Rating, Button, Paper, Grid } from '@mui/material';

function FilmeDetalhesPage({ filme, onVoltar }) {
  if (!filme) {
    return <Typography>Filme não encontrado.</Typography>;
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7))',
      color: 'white',
      padding: 4
    }}>
      <Container>
        <Grid container spacing={4}>
          {/* Coluna da Esquerda - Poster */}
          <Grid item xs={12} md={4}>
            <img
              src={filme.url_poster}
              alt={filme.titulo}
              style={{ width: '100%', borderRadius: '10px', maxWidth: '300px' }}
            />
          </Grid>

          {/* Coluna da Direita - Informações */}
          <Grid item xs={12} md={8}>
            <Typography variant="h3" gutterBottom>{filme.titulo}</Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" component="span" sx={{ mr: 1 }}>
                {filme.ano}
              </Typography>
              <Typography variant="h6" component="span" sx={{ mr: 1 }}>
                • {filme.duracao} min
              </Typography>
              <Typography variant="h6" component="span">
                • {filme.genero}
              </Typography>
            </Box>

            <Typography variant="h6" gutterBottom>Diretor:</Typography>
            <Typography paragraph>{filme.diretor}</Typography>

            <Typography variant="h6" gutterBottom>Sinopse:</Typography>
            <Typography paragraph>{filme.sinopse}</Typography>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>Avaliação Média:</Typography>
              <Rating 
                value={filme.media_avaliacao || 0} 
                readOnly 
                precision={0.5}
                sx={{ color: 'gold' }}
              />
            </Box>

            <Button
              variant="contained"
              onClick={onVoltar}
              sx={{ mt: 4 }}
            >
              Voltar
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default FilmeDetalhesPage;