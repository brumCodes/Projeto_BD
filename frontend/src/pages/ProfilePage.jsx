// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Avatar, Grid, Card, CardMedia, CardContent, CardActions, IconButton,Toolbar, AppBar } from '@mui/material';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';


// Importa os ícones e a logo para a header
import PersonIcon from '@mui/icons-material/Person';
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from '@mui/icons-material/Add';
import cinetrackLogo from '../assets/cinetrack-logo.png';
import addLista from '../assets/add-lista2.png';
import olhoIcon from '/images/icondeolho.png';
import verInfo from '/images/listbuttom.png';
import Tooltip from '@mui/material/Tooltip';

const profileTheme = createTheme({
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Componente para o card de filme (reutilizado)
function MovieCard({ filme, onToggleWatchlist, onToggleWatched, onVerDetalhes }) {
  // Nota: Este componente não tem estado próprio. Ele usa o estado do componente pai (ProfilePage)
  // para determinar a cor dos ícones.
  const isWatched = filme.visto;
  const isOnWatchlist = filme.desejo_ver;

  return (
    <Card className="dashboard-card" sx={{ backgroundColor: '#303540', color: 'white', minWidth: '160px', mr: 2 }}>
      <CardMedia
        className="dashboard-card-media" component="img" image={filme.url_poster} title={filme.titulo}
      />
      <CardContent sx={{ flexGrow: 1, padding: '4px', minHeight: '30px', marginLeft: '4px', marginTop: '6px' }}>
        <Typography gutterBottom variant="h5" component="div" className="dashboard-card-title" sx={{ fontSize: '1.06rem', fontWeight: '400', height: '2.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
          {filme.titulo}
        </Typography>
      </CardContent>
      <CardActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', height: '60px' }}>
        <Tooltip title={isOnWatchlist ? "Remover da Watchlist" : "Adicionar à Watchlist"} arrow>
          <IconButton sx={{ padding: 0 }} onClick={() => onToggleWatchlist(filme.id_filme, !isOnWatchlist)}>
            <img src={addLista} alt="Adicionar à lista" style={{ width: '40px', height: '40px', filter: isOnWatchlist ? 'opacity(0.4)' : 'none' }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={isWatched ? "Remover de 'Vistos'" : "Marcar como visto"} arrow>
          <IconButton onClick={() => onToggleWatched(filme.id_filme, !isWatched)} sx={{ padding: 0 }}>
            <img src={olhoIcon} alt="Visto" style={{ width: '40px', height: '40px', filter: isWatched ? "invert(45%) sepia(85%) saturate(500%) hue-rotate(90deg)" : "none" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ver detalhes" arrow>
          <IconButton onClick={() => onVerDetalhes(filme)} sx={{ padding: 0 }}>
            <img src={verInfo} alt="Ver Detalhes" style={{ width: '40px', height: '40px' }} />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}


function ProfilePage({ usuario, onLogout, onVerDetalhes, onReturnToDashboard }) {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar os dados do perfil
  const fetchProfileData = async () => {
    if (!usuario || !usuario.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/usuarios/${usuario.id}/perfil`);
      setProfileData(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados do perfil:", error);
      setProfileData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [usuario]);

  // Função para lidar com a atualização das listas no frontend
  const toggleLista = async (filmeId, nomeDaLista, isAdding) => {
    const endpoint = isAdding ? 'adicionar_filme' : 'remover_filme';
    try {
      await axios.post(`http://127.0.0.1:5000/api/listas/${endpoint}`, {
        filme_id: filmeId,
        nome_lista: nomeDaLista,
        id_usuario: usuario.id
      });
      // Refaz a busca para atualizar o estado
      fetchProfileData();
    } catch (error) {
      console.error("Erro ao atualizar lista:", error);
    }
  };

  const onToggleWatched = (filmeId, isAdding) => {
    toggleLista(filmeId, 'Vistos', isAdding);
  };
  
  const onToggleWatchlist = (filmeId, isAdding) => {
    toggleLista(filmeId, 'Desejo Ver', isAdding);
  };

  if (isLoading) {
    return <Typography>Carregando perfil...</Typography>;
  }

  if (!profileData) {
    return <Typography>Não foi possível carregar os dados do perfil.</Typography>;
  }

  const defaultAvatar = "https://via.placeholder.com/100/303540/FFFFFF?text=User";

  return (
    <ThemeProvider theme={profileTheme}>
      {/* Reutiliza a header do Dashboard */}
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ backgroundColor: '#292828', color: 'white' }}>
          <Toolbar sx={{ color: 'white' }}>
            <img 
              src={cinetrackLogo} 
              alt="Cinetrack" 
              style={{ height: '35px', backgroundColor: 'transparent', cursor: 'pointer' }} 
              onClick={onReturnToDashboard}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Button color="inherit" startIcon={<FilterListIcon />} sx={{ color: '#d1d1d1ff' }}>
              Filtros
            </Button>
            <Button variant="contained" color="secondary" startIcon={<AddIcon />} sx={{ mr: 2 }}>
              Add Filme
            </Button>
            <IconButton color="inherit">
              <PersonIcon />
            </IconButton>
            <Button color="inherit" onClick={onLogout}>Sair</Button>
          </Toolbar>
        </AppBar>
      </Box>

      <Container sx={{ mt: 4, color: 'white' }}>
        {/* Seção do Perfil */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar 
            src={defaultAvatar} // Substitua pela URL da foto do perfil se tiver
            sx={{ width: 100, height: 100, mr: 2 }} 
          />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>{profileData.usuario.nome_usuario}</Typography>
            <Typography variant="h6">{profileData.usuario.vistos_count} filmes assistidos</Typography>
          </Box>
        </Box>
        
        {/* Carrossel de Filmes Vistos */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>ATIVIDADE RECENTE</Typography>
          <Box sx={{ display: 'flex', overflowX: 'auto', p: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            {profileData.vistos.length > 0 ? (
              profileData.vistos.map(filme => (
                <MovieCard 
                  key={filme.id_filme} 
                  filme={{...filme, visto: true, desejo_ver: false}} 
                  onToggleWatched={onToggleWatched} 
                  onToggleWatchlist={onToggleWatchlist} 
                  onVerDetalhes={onVerDetalhes}
                />
              ))
            ) : (
              <Typography sx={{ color: '#a1a1a1ff', fontStyle: 'italic' }}>Nenhum filme visto recentemente.</Typography>
            )}
          </Box>
        </Box>

        {/* Carrossel de Watchlist */}
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>SUA WATCHLIST</Typography>
          <Box sx={{ display: 'flex', overflowX: 'auto', p: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            {profileData.watchlist.length > 0 ? (
              profileData.watchlist.map(filme => (
                <MovieCard 
                  key={filme.id_filme} 
                  filme={{...filme, visto: false, desejo_ver: true}} 
                  onToggleWatched={onToggleWatched} 
                  onToggleWatchlist={onToggleWatchlist} 
                  onVerDetalhes={onVerDetalhes}
                />
              ))
            ) : (
              <Typography sx={{ color: '#a1a1a1ff', fontStyle: 'italic' }}>Sua watchlist está vazia.</Typography>
            )}
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default ProfilePage;