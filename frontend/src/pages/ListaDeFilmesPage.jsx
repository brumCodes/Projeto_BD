import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Grid, Button, Toolbar, AppBar, IconButton, Avatar } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import cinetrackLogo from '../assets/cinetrack-logo.png';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const listTheme = createTheme({
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", "sans-serif"',
  },
});

const ListaDeFilmesPage = ({ usuario, onLogout }) => {
  const { listaNome, id } = useParams();
  const navigate = useNavigate();
  const [filmesComStatus, setFilmesComStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const tituloDaPagina = listaNome === 'vistos' ? 'FILMES VISTOS' : 'WATCHLIST';

  useEffect(() => {
    const fetchListas = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [vistosResponse, watchlistResponse] = await Promise.all([
          axios.get(`http://127.0.0.1:5000/api/listas/${id}/vistos`),
          axios.get(`http://127.0.0.1:5000/api/listas/${id}/watchlist`)
        ]);
        
        const vistosMap = new Map(vistosResponse.data.map(filme => [filme.id_filme, true]));
        const watchlistMap = new Map(watchlistResponse.data.map(filme => [filme.id_filme, true]));
        
        const listaExibida = listaNome === 'vistos' ? vistosResponse.data : watchlistResponse.data;

        const filmesMapeados = listaExibida.map(filme => ({
          ...filme,
          visto: vistosMap.has(filme.id_filme),
          desejo_ver: watchlistMap.has(filme.id_filme)
        }));
        
        setFilmesComStatus(filmesMapeados);
      } catch (error) {
        console.error("Erro ao buscar as listas:", error);
        setFilmesComStatus([]); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchListas();
  }, [id, listaNome]);

  const onToggleLista = async (filmeId, nomeDaLista) => {
    const isAdding = !filmesComStatus.find(f => f.id_filme === filmeId)?.[nomeDaLista === 'Vistos' ? 'visto' : 'desejo_ver'];
    const endpoint = isAdding ? 'adicionar_filme' : 'remover_filme';
    
    const originalState = [...filmesComStatus];
    const updatedState = filmesComStatus.map(filme => 
        filme.id_filme === filmeId 
            ? { ...filme, [nomeDaLista === 'Vistos' ? 'visto' : 'desejo_ver']: isAdding }
            : filme
    );
    setFilmesComStatus(updatedState);

    try {
      await axios.post(`http://127.0.0.1:5000/api/listas/${endpoint}`, {
        filme_id: filmeId,
        nome_lista: nomeDaLista,
        id_usuario: usuario.id
      });
      // Apenas na página de 'vistos' ou 'watchlist', remover da lista visualmente tem um efeito melhor
      if (!isAdding) {
         setFilmesComStatus(prevFilmes => prevFilmes.filter(filme => filme.id_filme !== filmeId));
      }
    } catch (error) {
      console.error("Erro ao atualizar lista:", error);
      setFilmesComStatus(originalState);
    }
  };

  if (isLoading) {
    return (
      <Container sx={{ mt: 4, color: 'white', textAlign: 'center' }}>
        <Typography variant="h5">Carregando a lista...</Typography>
      </Container>
    );
  }

  return (
    <ThemeProvider theme={listTheme}>
      <Box
        sx={{
          flexGrow: 1,
          backgroundImage: 'url(/images/background-foto14.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          flexShrink: 0
        }}
      >
        <AppBar position="static" sx={{ backgroundColor: '#11111aff', color: 'white' }}>
          <Toolbar sx={{ color: 'white' }}>
            <Button
              sx={{ color: '#d1d1d1ff', textTransform: 'none', mr: 2 }}
              onClick={() => navigate(-1)}
              startIcon={<ArrowBackIcon />}
            >
              Voltar
            </Button>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
              <img 
                src={cinetrackLogo} 
                alt="cinetrack" 
                style={{ height: '35px', backgroundColor: 'transparent', cursor: 'pointer' }} 
                onClick={() => navigate('/dashboard')}
              />
            </Box>
            <IconButton color="inherit" onClick={() => navigate(`/perfil/${usuario.id}`)}>
              {usuario && usuario.url_avatar ? (
                <Avatar 
                  src={usuario.url_avatar} 
                  sx={{ width: 35, height: 35 }} 
                />
              ) : (
                <PersonIcon />
              )}
            </IconButton>
            <Button color="inherit" onClick={onLogout}>
              Sair
            </Button>
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 4, color: 'white', pb: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 300, textAlign: 'center', mb: 4, mt: 8, color: '#cfcdcdff', fontSize: '1.8rem'}}>
            {tituloDaPagina}
          </Typography>
          
          {filmesComStatus.length > 0 ? (
            <Grid container spacing={2} justifyContent="center" sx={{ flexGrow: 1 }}>
              {filmesComStatus.map(filme => (
                <Grid item key={filme.id_filme} xs={12} sm={6} md={4} lg={2.4}>
                  <MovieCard 
                    filme={filme} 
                    onToggleLista={onToggleLista}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography sx={{ mt: 4, fontStyle: 'italic', textAlign: 'center' }}>
              {`Nenhum filme na lista de ${tituloDaPagina.toLowerCase()}.`}
            </Typography>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ListaDeFilmesPage;