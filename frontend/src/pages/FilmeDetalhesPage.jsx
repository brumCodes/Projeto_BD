import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, Rating, Button, Paper, Grid, createTheme, 
  ThemeProvider, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  IconButton
} from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import axios from 'axios';


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

  // UseEffect para carregar o status do filme do banco de dados
  useEffect(() => {
    const fetchMovieStatus = async () => {
        if (!filme || !filme.id_filme) {
            console.log('Filme não definido, pulando a busca de status.');
            return;
        }
        try {
            console.log(`Buscando status para o filme ID: ${filme.id_filme}...`);
            const response = await axios.get(`http://127.0.0.1:5000/api/filmes/${filme.id_filme}/status`);
            
            console.log('Dados recebidos da API:', response.data);
            
            if (response.data) {
                // CORREÇÃO: Usando !! para garantir que o valor seja um booleano (true ou false)
                setIsWatched(!!response.data.visto);
                setIsOnWatchlist(!!response.data.desejo_ver);
                console.log(`Estado setado: Assistido = ${!!response.data.visto}, Watchlist = ${!!response.data.desejo_ver}`);
            }
        } catch (error) {
            console.error("Erro ao buscar status do filme:", error);
        }
    };
    fetchMovieStatus();
  }, [filme]); // O useEffect vai rodar toda vez que o "filme" mudar

  if (!filme) {
    console.log('Filme não encontrado.', filme);
    return <Typography>Filme não encontrado.</Typography>;
  }

  const handleRatingChange = (event, newValue) => {
    setUserRating(newValue);
    if (newValue > 0) {
      setOpenResenhaModal(true);
    }
  };

  const handleCloseResenhaModal = () => {
    setOpenResenhaModal(false);
  };

  const handleSalvarResenha = async () => {
    if (!userRating) {
      alert("Por favor, selecione uma nota antes de salvar a resenha.");
      return;
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:5000/api/filmes/${filme.id_filme}/avaliacao`,
        {
          nota: userRating,
          resenha: resenha,
        }
      );

      console.log('Resposta do backend:', response.data);
      // Aqui você pode atualizar o estado do filme se a média de avaliação mudou
      // Por exemplo: setFilme({ ...filme, media_avaliacao: response.data.media_atualizada });
      
      handleCloseResenhaModal();
      setResenha("");
    } catch (error) {
      console.error("Erro ao salvar a resenha:", error.response ? error.response.data : error.message);
      alert("Erro ao salvar a resenha. Tente novamente.");
    }
  };

  const toggleListaAPI = async (filmeId, nomeDaLista) => {
      const isCurrentlyOnList = nomeDaLista === 'Vistos' ? isWatched : isOnWatchlist;
      const endpoint = isCurrentlyOnList ? 'remover_filme' : 'adicionar_filme';
      
      try {
          const response = await axios.post(`http://127.0.0.1:5000/api/listas/${endpoint}`, {
              filme_id: filmeId,
              nome_lista: nomeDaLista
          });

          if (response.status >= 200 && response.status < 300) {
              if (nomeDaLista === 'Vistos') {
                  setIsWatched(prev => !prev);
              } else {
                  setIsOnWatchlist(prev => !prev);
              }
          }
      } catch (error) {
          console.error("Erro ao atualizar lista:", error);
      }
  };

  const handleWatchClick = () => {
    toggleListaAPI(filme.id_filme, 'Vistos');
  };

  const handleWatchlistClick = () => {
    toggleListaAPI(filme.id_filme, 'Desejo Ver');
  };

return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        minHeight: '100vh',
        position: 'relative',
        color: 'white',
        padding: 4,
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
          filter: 'blur(5px)',
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
      }}>
        <Container sx={{ position: 'relative', zIndex: 1, display: { md: 'flex' } }}>
          <Box sx={{ width: { md: '66.66%' }, pr: { md: 4 } }}>
            <Grid container spacing={4} sx={{ alignItems: 'flex-start', mt: 10}}>
              <Grid item xs={12} sm={4}>
                <img
                  src={filme.url_poster}
                  alt={filme.titulo}
                  style={{ width: '100%', borderRadius: '10px', maxWidth: '260px' }}
                />
              </Grid>
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
            <Button
              variant="contained"
              onClick={onVoltar}
              sx={{ mt: 4, backgroundColor: '#c343ddff', '&:hover': { backgroundColor: '#5c0f74ff' } }}
            >
              Voltar
            </Button>
          </Box>
          <Box 
            sx={{ 
              width: { md: '33.33%' }, 
              display: { xs: 'block', md: 'flex' }, 
              justifyContent: 'center', 
              alignItems: 'center', 
              mt: { xs: 4, md: -16 },
              ml: {md: 20}
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
                minHeight: '360px',
              }}
            >
              <Grid container justifyContent="space-around" sx={{ mb: 2 }}>
                <Grid item sx={{ textAlign: 'center' }}>
                  <IconButton 
                    onClick={handleWatchClick}
                    sx={{ color: isWatched ? '#27df73ff' : 'inherit'}}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <Typography 
                    variant="caption"
                    sx={{ color: isWatched ? '#27df73ff' : 'inherit',
                      fontSize: '0.9rem',
                     }}
                  >
                    Assistido
                  </Typography>
                </Grid>
                <Grid item sx={{ textAlign: 'center' }}>
                  <IconButton 
                    onClick={handleWatchlistClick} 
                    sx={{ color: isOnWatchlist ? '#e9e96cff' : 'inherit' }}
                  >
                    <WatchLaterIcon />
                  </IconButton>
                  <Typography 
                    variant="caption"
                    sx={{ color: isOnWatchlist ? '#e9e96cff' : 'inherit',
                      fontSize: '0.8rem',
                    }}
                  >
                    Watchlist
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ my: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }} />
              <Box textAlign="center">
                <Typography variant="subtitle1" gutterBottom>Rate</Typography>
                <Rating
                  name="user-rating"
                  value={userRating}
                  onChange={handleRatingChange}
                  precision={0.5}
                  sx={{ color: '#25ec78ff', fontSize: '2.5rem' }}
                />
              </Box>
              <Box sx={{ my: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }} />
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
        <Dialog
          open={openResenhaModal}
          onClose={handleCloseResenhaModal}
          sx={{
            '& .MuiPaper-root': {
              backgroundColor: '#252525ff',
              color: '#ffffff',
              borderRadius: '8px',
              width: '450px',
              height: '450px',
              maxWidth: 'none',
              padding: '10px',
            },
            '& .MuiDialogTitle-root': {
              padding: '16px',
              fontWeight: 600,
              borderBottom: '1px solid #181818ff',
            },
            '& .MuiDialogContent-root': {
              padding: '16px',
            },
            '& .MuiDialogActions-root': {
              padding: '8px 16px',
              borderTop: '1px solid #0e0e0eff',
              justifyContent: 'flex-end',
            },
            '& .MuiRating-root': {
              color: '#60ec6cff',
            },
            '& .MuiTextField-root': {
              backgroundColor: '#252525ff',
              borderRadius: '4px',
              // Estilo para o texto digitado
              '& .MuiInputBase-input': {
                color: '#ffffff', 
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#60ec6cff',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#a3f7a3ff',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#a3f7a3ff',
              },
              '& .MuiInputLabel-root': {
                color: '#aaaaaaff',
              },
            },
          }}
        >
          <DialogTitle
          sx ={{ color : '#ffffff'}}
          >Envie sua review para {filme.titulo} </DialogTitle>
          <DialogContent>
            <Rating
              value={userRating}
              readOnly
              precision={0.5}
              sx={{ 
                mb: 3,
                fontSize: '2.4rem'
              }}
            />
            <TextField
              autoFocus
              margin="dense"
              id="resenha"
              label="Sua Resenha"
              type="text"
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              value={resenha}
              onChange={(e) => setResenha(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseResenhaModal} sx={{ color: '#ffffff' }}>Cancelar</Button>
            <Button 
              onClick={handleSalvarResenha} 
              variant="contained" 
              sx={{ 
                backgroundColor: '#60ec6cff', 
                '&:hover': {
                  backgroundColor: '#a3f7a3ff',
                },
                color: '#121212'
              }}
            >
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default FilmeDetalhesPage;