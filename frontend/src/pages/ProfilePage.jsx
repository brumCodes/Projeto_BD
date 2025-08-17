import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import { Box, Typography, Container, Avatar, Card, CardMedia, CardContent, CardActions, IconButton, Toolbar, AppBar, Grid, TextField, Divider } from '@mui/material';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Button from '@mui/material/Button';
import MovieCard from '../components/MovieCard';
import { useNavigate } from 'react-router-dom';

import PersonIcon from '@mui/icons-material/Person';
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from '@mui/icons-material/Add';
import cinetrackLogo from '../assets/cinetrack-logo.png';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';

const profileTheme = createTheme({
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function ProfilePage({ usuario, onLogout, onVerDetalhes, onReturnToDashboard }) {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [vistosCount, setVistosCount] = useState(0);
  const [watchlistCount, setWatchlistCount] = useState(0);

  // Novos estados para a edição do avatar
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

  const fetchProfileData = async () => {
    if (!usuario || !usuario.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const profileResponse = await axios.get(`http://127.0.0.1:5000/api/usuarios/${usuario.id}/perfil`);
      const vistosResponse = await axios.get(`http://127.0.0.1:5000/api/listas/${usuario.id}/vistos`);
      const watchlistResponse = await axios.get(`http://127.0.0.1:5000/api/listas/${usuario.id}/watchlist`);
      
      setProfileData({
        ...profileResponse.data,
        vistos: vistosResponse.data,
        watchlist: watchlistResponse.data
      });
      setVistosCount(vistosResponse.data.length);
      setWatchlistCount(watchlistResponse.data.length);

    } catch (error) {
      console.error("erro ao buscar dados do perfil:", error);
      setProfileData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [usuario]);

  const handleVerListaCompleta = (listaNome) => {
    const nomeAjustado = listaNome === 'Vistos' ? 'vistos' : 'watchlist';
    navigate(`/lista/${nomeAjustado}`);
  };

  const toggleLista = async (filmeId, nomeDaLista, isAdding) => {
    if (!usuario || !usuario.id) return;

    const endpoint = isAdding ? 'adicionar_filme' : 'remover_filme';

    try {
      await axios.post(`http://127.0.0.1:5000/api/listas/${endpoint}`, {
        filme_id: filmeId,
        nome_lista: nomeDaLista,
        id_usuario: usuario.id
      });
      await fetchProfileData();
    } catch (error) {
      console.error("erro ao atualizar lista:", error);
    }
  };

  const onToggleWatched = (filmeId, isAdding) => {
    toggleLista(filmeId, 'Vistos', isAdding);
  };
  
  const onToggleWatchlist = (filmeId, isAdding) => {
    toggleLista(filmeId, 'Desejo Ver', isAdding);
  };

  // Nova função para salvar o avatar
  const handleSaveAvatar = async () => {
    if (!newAvatarUrl) {
      alert("Por favor, insira um URL de imagem válido.");
      return;
    }
    
    try {
      await axios.put(`http://127.0.0.1:5000/api/usuarios/${usuario.id}/atualizar_avatar`, {
        url_avatar: newAvatarUrl
      });
      alert("Foto de perfil atualizada com sucesso!");
      setIsEditingAvatar(false);
      fetchProfileData();
    } catch (error) {
      console.error("Erro ao salvar o avatar:", error);
      alert("Erro ao salvar a foto de perfil. Tente novamente.");
    }
  };

  if (isLoading) {
    return <Typography>carregando perfil...</Typography>;
  }

  if (!profileData) {
    return <Typography>não foi possível carregar os dados do perfil.</Typography>;
  }

  const defaultAvatar = "https://via.placeholder.com/100/303540/FFFFFF?text=User";
  const currentAvatar = profileData.usuario.url_avatar || defaultAvatar;

  return (
    <ThemeProvider theme={profileTheme}>
      <Box className="profile-container" sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ backgroundColor: '#11111aff', color: 'white' }}>
          <Toolbar sx={{ color: 'white' }}>
            <img 
              src={cinetrackLogo} 
              alt="cinetrack" 
              style={{ height: '35px', backgroundColor: 'transparent', cursor: 'pointer' }} 
              onClick={onReturnToDashboard}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="contained" color="secondary" startIcon={<AddIcon />} sx={{ mr: 2 }}>
              add filme
            </Button>
            {/* INÍCIO DA MUDANÇA: Renderização condicional para a foto de perfil */}
            <IconButton color="inherit">
              {profileData.usuario.url_avatar ? (
                <Avatar 
                  src={profileData.usuario.url_avatar} 
                  sx={{ width: 35, height: 35 }} 
                />
              ) : (
                <PersonIcon />
              )}
            </IconButton>
            {/* FIM DA MUDANÇA */}
            <Button color="inherit" onClick={onLogout}>sair</Button>
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 8, color: 'white' }}>
          <Box 
            sx={{ display: 'flex', alignItems: 'center', mb: 8, position: 'relative' }}
            onMouseEnter={() => setIsHoveringAvatar(true)}
            onMouseLeave={() => setIsHoveringAvatar(false)}
          >
            <Avatar 
              src={currentAvatar}
              sx={{ width: 120, height: 120, mr: 2 }} 
            />
            {isHoveringAvatar && (
              <IconButton 
                sx={{ 
                  position: 'absolute', 
                  bottom: -5, 
                  right: -5, 
                  color: 'white', 
                  backgroundColor: 'rgba(0, 0, 0, 0.6)', 
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                  width: 50, 
                  height: 50,
                }}
                onClick={() => setIsEditingAvatar(true)}
              >
                <EditIcon sx={{ fontSize: 30 }} />
              </IconButton>
            )}

            <Box sx ={{ ml: 1}}>
              <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '2.3rem'}}>{profileData.usuario.nome_usuario}</Typography>
              <Typography variant="h6" sx= {{ marginTop: '3px'}}>{vistosCount} filmes assistidos</Typography>
            </Box>
          </Box>
          
          {isEditingAvatar && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4, mt: -4 }}>
              <TextField 
                label="URL da nova foto de perfil"
                variant="filled"
                fullWidth
                value={newAvatarUrl}
                onChange={(e) => setNewAvatarUrl(e.target.value)}
                sx={{ 
                  input: { color: 'white' }, 
                  '& .MuiInputLabel-root': { color: '#a2e0a2' }, 
                  '& .MuiFilledInput-root': { backgroundColor: '#444' }
                }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  sx={{ 
                    backgroundColor: '#a2e0a2', 
                    color: '#2e7d32', 
                    '&:hover': { backgroundColor: '#78b778' } 
                  }}
                  onClick={handleSaveAvatar}>Salvar
                </Button>
                <Button variant="outlined" color="error" onClick={() => setIsEditingAvatar(false)}>Cancelar</Button>
              </Box>
            </Box>
          )}

          <Divider sx={{ mb: 4, borderColor: '#535353ff' }} />

          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 400, color: '#c7c4c4ff', fontSize: '1.4rem' }}>ATIVIDADE RECENTE</Typography>
                {profileData.vistos.length > 5 && (
                    <Button onClick={() => handleVerListaCompleta('Vistos')} sx={{ color: '#d1d1d1ff', textTransform: 'none', marginRight: '60px' }}>
                      Ver Mais
                    </Button>
                )}
            </Box>
            <Box sx={{ display: 'flex', overflowX: 'auto', p: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
              {profileData.vistos.slice(0, 5).map(filme => (
                  <MovieCard 
                    key={filme.id_filme} 
                    filme={{...filme, visto: true, desejo_ver: false}} 
                    onToggleWatched={onToggleWatched} 
                    onToggleWatchlist={onToggleWatchlist} 
                    onVerDetalhes={onVerDetalhes}
                  />
              ))}
              {profileData.vistos.length === 0 && (
                <Typography sx={{ color: '#a1a1a1ff', fontStyle: 'italic' }}>Nenhum filme visto recentemente.</Typography>
              )}
            </Box>
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 400, color: '#c7c4c4ff', fontSize: '1.4rem'}}>SUA WATCHLIST</Typography>
                {profileData.watchlist.length > 5 && (
                    <Button onClick={() => handleVerListaCompleta('Desejo Ver')} sx={{ color: '#d1d1d1ff', textTransform: 'none', marginRight: '60px' }}>
                      Ver Mais
                    </Button>
                )}
            </Box>
            <Box sx={{ display: 'flex', overflowX: 'auto', p: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
              {profileData.watchlist.slice(0, 5).map(filme => (
                  <MovieCard 
                    key={filme.id_filme} 
                    filme={{...filme, visto: false, desejo_ver: true}} 
                    onToggleWatched={onToggleWatched} 
                    onToggleWatchlist={onToggleWatchlist} 
                    onVerDetalhes={onVerDetalhes}
                  />
              ))}
              {profileData.watchlist.length === 0 && (
                <Typography sx={{ color: '#a1a1a1ff', fontStyle: 'italic' }}>Sua watchlist está vazia.</Typography>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default ProfilePage;