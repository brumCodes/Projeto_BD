import React, {useState} from 'react';
import { 
  Box, Typography, Container, Rating, Button, Paper, Grid, createTheme, 
  ThemeProvider, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  IconButton
} from '@mui/material';

// Importe os ícones
import VisibilityIcon from '@mui/icons-material/Visibility';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import AddIcon from '@mui/icons-material/Add';


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
  const [vistos, setVistos] = useState({});
  const [userRating, setUserRating] = useState(0); 
  const [resenha, setResenha] = useState(""); 
  const [openResenhaModal, setOpenResenhaModal] = useState(false); 
  const [isWatched, setIsWatched] = useState(false);
  const [isOnWatchlist, setIsOnWatchlist] = useState(false);

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

  const handleSalvarResenha = () => {
    console.log(`Filme: ${filme.titulo}, Nota: ${userRating}, Resenha: ${resenha}`);
    setOpenResenhaModal(false);
    setResenha("");
  };

  const toggleVisto = (id) => {
    setVistos((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleWatchClick = () => {
    setIsWatched(!isWatched); // alterna o estado de visto
  };

  const handleWatchlistClick = () => {
    setIsOnWatchlist(!isOnWatchlist); // alterna o estado de watchlistt
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
    }}>
      <Container sx={{ position: 'relative', zIndex: 1, display: { md: 'flex' } }}>
        <Box sx={{ width: { md: '66.66%' }, pr: { md: 4 } }}> {/* Corresponde a 8/12 colunas */}
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
              minHeight: '350px', //altura mínima do card
            }}
          >
            {/* icons botoes no card de detalhes */}
            <Grid container justifyContent="space-around" sx={{ mb: 2 }}>
              <Grid item sx={{ textAlign: 'center' }}>
                <IconButton 
                  onClick={handleWatchClick} //add o evento de clique
                  sx={{ color: isWatched ? '#27df73ff' : 'inherit'}} // condicional
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

            {/* aqui estão as estrelas para o usuário avaliar */}
            <Box textAlign="center">
              <Typography variant="subtitle1" gutterBottom>Rate</Typography>
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
                {filme.media_avaliacao || "—"} {/* A SER IMPLEMENTADO: Exibe a média de avaliação ou um traço se não houver */ }
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