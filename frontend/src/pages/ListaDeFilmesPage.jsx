import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Grid, Button, Toolbar, AppBar, IconButton, Avatar, CircularProgress } from "@mui/material";
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
  const [filmes, setFilmes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // CORREÇÃO: Usando .toLowerCase() para garantir que a comparação funcione
  const nomeListaApi = listaNome.toLowerCase() === 'vistos' ? 'vistos' : 'watchlist';
  const tituloDaPagina = listaNome.toLowerCase() === 'vistos' ? 'FILMES VISTOS' : 'WATCHLIST';

  useEffect(() => {
    const fetchLista = async () => {
      if (!id) {
        setIsLoading(false);
        setError("ID do usuário não encontrado na URL.");
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Simplificado para buscar apenas a lista necessária
        const response = await axios.get(`http://127.0.0.1:5000/api/listas/${id}/${nomeListaApi}`);
        const filmesData = Array.isArray(response.data) ? response.data : [];
        
        // Buscando o status completo para garantir que os botões funcionem corretamente
        const filmesComStatus = await Promise.all(filmesData.map(async (filme) => {
          const statusRes = await axios.get(`http://127.0.0.1:5000/api/filmes/${filme.id_filme}/status?usuario_id=${id}`);
          return {
            ...filme,
            visto: statusRes.data.visto,
            desejo_ver: statusRes.data.desejo_ver
          };
        }));

        setFilmes(filmesComStatus);
      } catch (err) {
        console.error(`Erro ao buscar a lista ${nomeListaApi}:`, err);
        setError(`Não foi possível carregar a lista.`);
        setFilmes([]); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchLista();
  }, [id, listaNome]);

  const onToggleLista = async (filmeId, nomeDaLista) => {
    if (!usuario || usuario.id.toString() !== id) {
        alert("Você só pode editar as suas próprias listas.");
        return;
    }

    const filmeClicado = filmes.find(f => f.id_filme === filmeId);
    if (!filmeClicado) return;

    const isCurrentlyOnList = nomeDaLista === 'Vistos' ? filmeClicado.visto : filmeClicado.desejo_ver;
    const endpoint = isCurrentlyOnList ? 'remover_filme' : 'adicionar_filme';
    
    const originalFilmes = [...filmes];

    // Atualização otimista da UI
    const updatedFilmes = filmes
        .map(f => {
            if (f.id_filme === filmeId) {
                const key = nomeDaLista === 'Vistos' ? 'visto' : 'desejo_ver';
                return { ...f, [key]: !isCurrentlyOnList };
            }
            return f;
        })
        // Se estivermos na página da lista e o item for removido dela, ele some da tela
        .filter(f => {
            if (isCurrentlyOnList) { // se a ação é remover
                if (listaNome.toLowerCase() === 'vistos' && nomeDaLista === 'Vistos') return false;
                if (listaNome.toLowerCase() !== 'vistos' && nomeDaLista === 'Desejo Ver') return false;
            }
            return true;
        });
    
    setFilmes(updatedFilmes);
    
    try {
      await axios.post(`http://127.0.0.1:5000/api/listas/${endpoint}`, {
        filme_id: filmeId,
        nome_lista: nomeDaLista,
        id_usuario: usuario.id
      });
    } catch (error) {
      console.error("Erro ao atualizar lista:", error);
      setFilmes(originalFilmes); // Reverte em caso de erro
      alert("Ocorreu um erro ao atualizar a lista.");
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212' }}>
          <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
        <Container sx={{ mt: 4, color: 'white', textAlign: 'center' }}>
            <Typography variant="h5" color="error">{error}</Typography>
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
          
          {filmes.length > 0 ? (
            <Grid container spacing={2} justifyContent="center">
              {filmes.map(filme => (
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