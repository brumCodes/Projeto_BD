import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, Rating, Button, Paper, Grid, createTheme, 
  ThemeProvider, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  IconButton
} from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import WatchLaterIcon from '@mui/icons-material/WatchLater';

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
  const [userRating, setUserRating] = useState(0); 
  const [resenha, setResenha] = useState(""); 
  const [openResenhaModal, setOpenResenhaModal] = useState(false); 
  const [isWatched, setIsWatched] = useState(false);
  const [isOnWatchlist, setIsOnWatchlist] = useState(false);

  // Efeito para buscar o status do filme (Visto/Watchlist) quando a página carrega
  useEffect(() => {
    if (!filme) return;

    const fetchStatusDoFilme = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/listas/status-filme/${filme.id_filme}`);
        if (response.ok) {
          const data = await response.json();
          setIsWatched(data.visto);
          setIsOnWatchlist(data.desejoVer);
        }
      } catch (error) {
        console.error("Erro ao buscar status do filme:", error);
      }
    };
    fetchStatusDoFilme();
  }, [filme]);

  if (!filme) {
    return <Typography>Filme não encontrado.</Typography>;
  }

  // Função de Toggle: Adiciona ou remove um filme de uma lista
  const handleToggleLista = async (nomeDaLista) => {
    const isCurrentlyOnList = nomeDaLista === 'Vistos' ? isWatched : isOnWatchlist;
    const endpoint = isCurrentlyOnList ? 'remover_filme' : 'adicionar_filme';
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/listas/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filme_id: filme.id_filme, nome_lista: nomeDaLista }),
      });

      if (response.ok) {
        // Atualiza o estado visual localmente, invertendo o valor anterior
        if (nomeDaLista === 'Vistos') {
          setIsWatched(!isWatched);
        } else { // 'Desejo Ver'
          setIsOnWatchlist(!isOnWatchlist);
        }
      } else {
        const data = await response.json();
        alert(`Erro: ${data.message}`);
      }
    } catch (error) {
      alert("Erro de conexão.");
    }
  };

  const handleRatingChange = (event, newValue) => {
    setUserRating(newValue);
    if (newValue > 0) {
      setOpenResenhaModal(true);
    }
  };

  const handleCloseResenhaModal = () => {
    setOpenResenhaModal(false);
  };

  const handleSalvarResenha = () => {
    console.log(`Filme: ${filme.titulo}, Nota: ${userRating}, Resenha: ${resenha}`);
    setOpenResenhaModal(false);
    setResenha("");
  };

  // Estilo dinâmico para o fundo, pois ele depende da URL do poster
  const pageBoxStyle = {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '60%',
      height: '100%',
      backgroundImage: `url(${filme.url_poster})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'blur(10px)',
      opacity: 1,
      zIndex: -1,
      maskImage: 'linear-gradient(to right, transparent 0%, black 50%, black 70%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%, black 70%, transparent 100%)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, #000000ff 30%, rgba(0, 0, 0, 0.8) 60%, rgba(18, 18, 18, 0.4) 100%)',
      zIndex: -1,
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', position: 'relative', color: 'white', padding: 4, ...pageBoxStyle }}>
        <Container sx={{ position: 'relative', zIndex: 1, display: { md: 'flex' } }}>
          <Box sx={{ width: { md: '66.66%' }, pr: { md: 4 } }}>
            <Grid container spacing={4} sx={{ alignItems: 'flex-start', mt: 10}}>
              {/* Poster */}
              <Grid item xs={12} sm={4}>
                <img
                  src={filme.url_poster}
                  alt={filme.titulo}
                  style={{ width: '100%', borderRadius: '10px', maxWidth: '260px' }}
                />
              </Grid>
              {/* DETALHES DO FILME METADATA ETC */}
              <Grid item xs={12} sm={8}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, fontSize: '2.5rem' }}>
                  {filme.titulo}
                </Typography>
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
                  <Rating
                    value={filme.media_avaliacao || 0}
                    readOnly
                    precision={0.5}
                    sx={{ color: 'gold' }}
                  />
                </Box>
              </Grid>
            </Grid>
            {/* VOLTAR */}
            <Button
              variant="contained"
              onClick={onVoltar}
              sx={{ mt: 4, backgroundColor: '#c343ddff', '&:hover': { backgroundColor: '#5c0f74ff' } }}
            >
              Voltar
            </Button>
          </Box>
          
          {/*CARD de avaliação */}
          <Box 
            sx={{ 
              width: { md: '33.33%' }, 
              display: { xs: 'block', md: 'flex' }, 
              justifyContent: 'center', 
              alignItems: 'center', 
              mt: { xs: 4, md: 0 },
            }}> 
            <Paper
              elevation={6}
              sx={{
                p: 2,
                backgroundColor: '#292828',
                color: 'white',
                borderRadius: '10px',
                width: '100%',
                maxWidth: '300px',
                minHeight: '350px',
              }}
            >
              {/* icons botoes no card de detalhes */}
              <Grid container justifyContent="space-around" sx={{ mb: 2 }}>
                <Grid item sx={{ textAlign: 'center' }}>
                  <IconButton 
                    onClick={() => handleToggleLista('Vistos')}
                    sx={{ color: isWatched ? '#27df73ff' : 'inherit'}}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <Typography 
                    variant="caption"
                    sx={{ color: isWatched ? '#27df73ff' : 'inherit',
                      fontSize: '0.9rem', display: 'block'
                      }}
                  >
                    Assistido
                  </Typography>
                </Grid>
                <Grid item sx={{ textAlign: 'center' }}>
                  <IconButton 
                    onClick={() => handleToggleLista('Desejo Ver')} 
                    sx={{ color: isOnWatchlist ? '#e9e96cff' : 'inherit' }}
                  >
                    <WatchLaterIcon />
                  </IconButton>
                  <Typography 
                    variant="caption"
                    sx={{ color: isOnWatchlist ? '#e9e96cff' : 'inherit',
                      fontSize: '0.8rem', display: 'block'
                    }}
                  >
                    Watchlist
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ my: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }} />

              {/* aqui estão as estrelas para o usuário avaliar */}
              <Box textAlign="center">
                <Typography variant="subtitle1" gutterBottom>Sua Avaliação</Typography>
                <Rating
                  name="user-rating"
                  value={userRating}
                  onChange={handleRatingChange}
                  precision={0.5}
                  sx={{ color: '#27df73ff', fontSize: '2.5rem' }}
                />
              </Box>

              <Box sx={{ my: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }} />

              {/* aqui fica a média do filme */}
              <Box textAlign="center" sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Média de Avaliação</Typography>
                <Typography
                  variant="h4"
                  component="span"
                  sx={{ fontWeight: 700, fontSize: '2.5rem', color: '#ffffffff' }}
                >
                  {filme.media_avaliacao || "—"}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Container>
        
        {/* Diálogo de Resenha */}
        <Dialog open={openResenhaModal} onClose={handleCloseResenhaModal}>
          <DialogTitle>Deixe sua resenha para {filme.titulo}</DialogTitle>
          <DialogContent>
            <Rating
              value={userRating}
              readOnly
              precision={0.5}
              sx={{ mb: 2, color: '#c343ddff' }}
            />
            <TextField
              autoFocus
              margin="dense"
              id="resenha"
              label="Sua Resenha"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="standard"
              value={resenha}
              onChange={(e) => setResenha(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseResenhaModal}>Cancelar</Button>
            <Button onClick={handleSalvarResenha}>Salvar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
export default FilmeDetalhesPage;