// frontend/src/pages/FilmeDetalhesPage.jsx
import React from 'react';
import { Box, Typography, Container, Rating, Button, Paper, Grid } from '@mui/material';

function FilmeDetalhesPage({ filme, onVoltar }) {
  if (!filme) {
    return <Typography>Filme não encontrado.</Typography>;
  }

  return (
    <Box sx={{
      minHeight: '100vh', position: 'relative', color: 'white', padding: 4,
      '&::before':{
        content: '""',
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${filme.url_poster})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter : 'blur(16px)',
        opacity: 0.7,
        zIndex: -1
      },
      '&::after':{
        content: '""',
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(rgba(20, 20, 20, 0.3), rgba(51, 51, 51, 0.8))',
        zIndex: -1
      }
    }}>
    <Container sx ={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4}>
          {/* Coluna da Esquerda - Poster */}
          <Grid item xs={12} md={4}>
            <img
              src={filme.url_poster}
              alt={filme.titulo}
              style={{ width: '100%', borderRadius: '10px', maxWidth: '260px' }}
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
              sx={{ mt: 4 , backgroundColor: '#c343ddff', '&:hover' :{ backgroundColor: '#5c0f74ff' }}}
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