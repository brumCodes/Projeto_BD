import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import { 
  Box, Typography, Container, Avatar, Toolbar, AppBar, Grid, TextField, Divider, 
  CircularProgress, IconButton, Button
} from '@mui/material';
import axios from 'axios';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MovieCard from '../components/MovieCard';
import PersonIcon from '@mui/icons-material/Person';
import cinetrackLogo from '../assets/cinetrack-logo.png';
import EditIcon from '@mui/icons-material/Edit';

const profileTheme = createTheme({
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
});

function ProfilePage({ usuario, onLogout, onVerDetalhes }) {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [vistos, setVistos] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

  const isMyProfile = usuario && (usuario.id == id);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const profileResponse = await axios.get(`http://127.0.0.1:5000/api/usuarios/${id}/perfil`);
        const vistosResponse = await axios.get(`http://127.0.0.1:5000/api/listas/${id}/vistos`);
        const watchlistResponse = await axios.get(`http://127.0.0.1:5000/api/listas/${id}/watchlist`);
        
        setProfileData(profileResponse.data);
        setVistos(vistosResponse.data);
        setWatchlist(watchlistResponse.data);

      } catch (err) {
        console.error("Erro ao buscar dados do perfil:", err);
        setError("Não foi possível carregar o perfil. O usuário pode não existir ou houve um erro na rede.");
        setProfileData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProfileData();
    }
  }, [id]);

  const onToggleWatched = (filmeId, isAdding) => {
    if (!isMyProfile) return;
    const endpoint = isAdding ? 'adicionar_filme' : 'remover_filme';
    axios.post(`http://127.0.0.1:5000/api/listas/${endpoint}`, {
      filme_id: filmeId,
      nome_lista: 'Vistos',
      id_usuario: usuario.id
    }).then(() => {
      // Recarrega os dados do perfil para refletir a mudança
      const fetchUpdatedData = async () => {
        const vistosResponse = await axios.get(`http://127.0.0.1:5000/api/listas/${id}/vistos`);
        setVistos(vistosResponse.data);
      };
      fetchUpdatedData();
    }).catch(error => {
      console.error("Erro ao atualizar lista:", error);
    });
  };
  
  const onToggleWatchlist = (filmeId, isAdding) => {
    if (!isMyProfile) return;
    const endpoint = isAdding ? 'adicionar_filme' : 'remover_filme';
    axios.post(`http://127.0.0.1:5000/api/listas/${endpoint}`, {
      filme_id: filmeId,
      nome_lista: 'Desejo Ver',
      id_usuario: usuario.id
    }).then(() => {
      const fetchUpdatedData = async () => {
        const watchlistResponse = await axios.get(`http://127.0.0.1:5000/api/listas/${id}/watchlist`);
        setWatchlist(watchlistResponse.data);
      };
      fetchUpdatedData();
    }).catch(error => {
      console.error("Erro ao atualizar lista:", error);
    });
  };

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
      // Recarrega os dados do perfil para refletir a mudança do avatar
      const fetchUpdatedData = async () => {
        const profileResponse = await axios.get(`http://127.0.0.1:5000/api/usuarios/${id}/perfil`);
        setProfileData(profileResponse.data);
      };
      fetchUpdatedData();
    } catch (error) {
      console.error("Erro ao salvar o avatar:", error);
      alert("Erro ao salvar a foto de perfil. Tente novamente.");
    }
  };

  const handleVerListaCompleta = (listaNome) => {
    navigate(`/lista/${listaNome === 'Vistos' ? 'vistos' : 'watchlist'}/${id}`);
  };

  const defaultAvatar = "https://via.placeholder.com/100/303540/FFFFFF?text=User";

  return (
    <ThemeProvider theme={profileTheme}>
      <Box className="profile-container" sx={{ flexGrow: 1 }}>
        <AppBar position="static" sx={{ backgroundColor: '#000000ff', color: 'white' }}>
          <Toolbar sx={{ color: 'white' }}>
            <img 
              src={cinetrackLogo} 
              alt="cinetrack" 
              style={{ height: '35px', backgroundColor: 'transparent', cursor: 'pointer' }} 
              onClick={() => navigate('/dashboard')}
            />
            <Box sx={{ flexGrow: 1 }} />
            {isMyProfile && (
              <>
                <Button color="inherit" onClick={onLogout}>Sair</Button>
              </>
            )}
          </Toolbar>
        </AppBar>

        {isLoading ? (
          <Container sx={{ textAlign: 'center', mt: 10 }}>
            <CircularProgress color="secondary" />
            <Typography variant="h6" sx={{ mt: 2 , color: '#a7a7a7ff'}}>
              Carregando perfil...
            </Typography>
          </Container>
        ) : error ? (
          <Container sx={{ textAlign: 'center', mt: 10 }}>
            <Typography variant="h5" color="error">
              {error}
            </Typography>
            <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }} variant="contained">Voltar ao Dashboard</Button>
          </Container>
        ) : !profileData ? (
          <Container sx={{ textAlign: 'center', mt: 10 }}>
            <Typography variant="h5">
              Perfil não encontrado.
            </Typography>
            <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }} variant="contained">Voltar ao Dashboard</Button>
          </Container>
        ) : (
          <Container sx={{ mt: 8, color: 'white' }}>
            <Box 
              sx={{ display: 'flex', alignItems: 'center', mb: 8, position: 'relative' }}
              onMouseEnter={() => isMyProfile && setIsHoveringAvatar(true)}
              onMouseLeave={() => isMyProfile && setIsHoveringAvatar(false)}
            >
              <Avatar 
                src={profileData.usuario.url_avatar || defaultAvatar}
                sx={{ width: 120, height: 120, mr: 2 }} 
              />
              {isMyProfile && isHoveringAvatar && !isEditingAvatar && (
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

              <Box sx={{ ml: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, fontSize: '2.3rem'}}>
                  {profileData.usuario.nome_usuario}
                </Typography>
                <Typography variant="h6" sx={{ marginTop: '3px'}}>
                  {vistos.length} filmes assistidos
                </Typography>
              </Box>
            </Box>
          
            {isMyProfile && isEditingAvatar && (
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
                <Typography variant="h5" sx={{ fontWeight: 400, color: '#c7c4c4ff', fontSize: '1.4rem' }}>
                  ATIVIDADE RECENTE
                </Typography>
                {vistos.length > 5 && (
                  <Button onClick={() => handleVerListaCompleta('Vistos')} sx={{ color: '#d1d1d1ff', textTransform: 'none', marginRight: '60px' }}>
                    Ver Mais
                  </Button>
                )}
              </Box>
              <Box sx={{ display: 'flex', overflowX: 'auto', p: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                {vistos.slice(0, 5).map(filme => (
                  <MovieCard 
                    key={filme.id_filme} 
                    filme={{...filme, visto: true, desejo_ver: false}} 
                    onToggleWatched={isMyProfile ? onToggleWatched : null}
                    onToggleWatchlist={isMyProfile ? onToggleWatchlist : null} 
                    onVerDetalhes={onVerDetalhes}
                  />
                ))}
                {vistos.length === 0 && (
                  <Typography sx={{ color: '#a1a1a1ff', fontStyle: 'italic' }}>Nenhum filme visto recentemente.</Typography>
                )}
              </Box>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 400, color: '#c7c4c4ff', fontSize: '1.4rem'}}>
                  WATCHLIST
                </Typography>
                {watchlist.length > 5 && (
                  <Button onClick={() => handleVerListaCompleta('Desejo Ver')} sx={{ color: '#d1d1d1ff', textTransform: 'none', marginRight: '60px' }}>
                    Ver Mais
                  </Button>
                )}
              </Box>
              <Box sx={{ display: 'flex', overflowX: 'auto', p: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
                {watchlist.slice(0, 5).map(filme => (
                  <MovieCard 
                    key={filme.id_filme} 
                    filme={{...filme, visto: false, desejo_ver: true}} 
                    onToggleWatched={isMyProfile ? onToggleWatched : null}
                    onToggleWatchlist={isMyProfile ? onToggleWatchlist : null} 
                    onVerDetalhes={onVerDetalhes}
                  />
                ))}
                {watchlist.length === 0 && (
                  <Typography sx={{ color: '#a1a1a1ff', fontStyle: 'italic' }}>Sua watchlist está vazia.</Typography>
                )}
              </Box>
            </Box>
          </Container>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default ProfilePage;