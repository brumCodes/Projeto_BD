// frontend/src/pages/FilmeDetalhesPage.jsx
import React from 'react';
import { Box, Typography, Container, Rating, Button, Paper, Grid, createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme({
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontFamily: 'Poppins',
      fontWeight: 600
    },
    h6: {
      fontFamily: 'Poppins',
      fontWeight: 500
    }
  }
});

function FilmeDetalhesPage({ filme, onVoltar }) {
  if (!filme) {
    return <Typography>Filme não encontrado.</Typography>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        minHeight: '100vh', position: 'relative', color: 'white', padding: 4,
        '&::before':{
          content: '""',
          position: 'absolute',
          top: 0, right: 0,
          width: '60%',
          height: '100%',
          backgroundImage: `url(${filme.url_poster})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter : 'blur(10px)',
          opacity: 0.9,
          zIndex: -1,
          maskImage: 'linear-gradient(to right, transparent 0%, black 50%, black 70%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%, black 70%, transparent 100%)',
        },
        '&::after':{
          content: '""',
          position: 'absolute',
          top: 0, right: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, #0e0e0eff 30%, rgba(0, 0, 0, 0.8) 60%, rgba(18, 18, 18, 0.4) 100%)',
          zIndex: -1
        }
      }}>
      <Container sx ={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4}>
            {/*coluna da esquerda*/}
            <Grid item xs={12} md={4}>
              <img
                src={filme.url_poster}
                alt={filme.titulo}
                style={{ width: '100%', borderRadius: '10px', maxWidth: '260px' }}
              />
            </Grid>

            {/* Coluna da Direita - Informações */}
            <Grid item xs={12} md={8}>
              <Typography variant="h3" gutterBottom sx= {{fontWeight: 700, fontSize: '2.5rem'}}>{filme.titulo}</Typography>
              
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
    </ThemeProvider>
  );
}

export default FilmeDetalhesPage;