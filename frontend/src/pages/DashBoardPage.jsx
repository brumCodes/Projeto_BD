import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import {
  Box, AppBar, Toolbar, Typography, Button, Container, IconButton, TextField,
  Grid, Card, CardMedia, CardContent, CardActions
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; 
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import AddMovieForm from '../components/AddMovieForm';
import axios from 'axios';
import cinetrackLogo from '../assets/cinetrack-logo.png';
import addLista from '../assets/add-lista2.png';
import verInfo from '/images/listbuttom.png';
import Tooltip from '@mui/material/Tooltip';
import olhoIcon from '/images/icondeolho.png';

function DashboardPage({ usuario, onLogout, onVerDetalhes }) {
  const [filmes, setFilmes] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [listStatus, setListStatus] = useState({});

  const dashboardTheme = createTheme({
    typography: {
      fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif',
    },
  });

  const fetchFilmes = async (query = "") => {
    try {
      const url = query.trim()
        ? `http://127.0.0.1:5000/api/filmes/pesquisa?q=${encodeURIComponent(query)}`
        : 'http://127.0.0.1:5000/api/filmes';
      
      const response = await axios.get(url);
      const filmesData = response.data;
      setFilmes(filmesData);

      const statusInicial = {};
      filmesData.forEach(filme => {
        statusInicial[filme.id_filme] = {
          visto: filme.visto,
          desejoVer: filme.desejo_ver
        };
      });
      setListStatus(statusInicial);

    } catch (error) {
      console.error("Erro ao buscar filmes:", error);
    }
  };
  
  const handleToggleLista = async (filmeId, nomeDaLista) => {
    const isCurrentlyOnList = nomeDaLista === 'Vistos' 
      ? listStatus[filmeId]?.visto 
      : listStatus[filmeId]?.desejoVer;
      
    const endpoint = isCurrentlyOnList ? 'remover_filme' : 'adicionar_filme';
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/listas/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filme_id: filmeId, nome_lista: nomeDaLista }),
      });

      if (response.ok) {
        setListStatus(prev => ({
          ...prev,
          [filmeId]: {
            ...prev[filmeId],
            [nomeDaLista === 'Vistos' ? 'visto' : 'desejoVer']: !isCurrentlyOnList
          }
        }));
      } else {
        const data = await response.json();
        console.error(`Erro: ${data.message}`); // Erro silencioso no console
      }
    } catch (error) {
      console.error("Erro de conexão.", error); // Erro silencioso no console
    }
  };

  const handleMovieAdded = () => { fetchFilmes(searchTerm); };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFilmes(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  return (
    <ThemeProvider theme={dashboardTheme}>
      <CssBaseline />
      <Box className="dashboard-container">
        <AppBar position="static" sx={{ backgroundColor: '#292828', color: 'white' }}>
          <Toolbar sx={{ color: 'white' }}>
            <img src={cinetrackLogo} alt="Cinetrack" style={{ height: '35px', backgroundColor: 'transparent' }} />
            <Box className="dashboard-search" sx={{ flexGrow: 1, maxWidth: 300, ml: 4 }}>
              <TextField
                fullWidth variant="standard" placeholder="Pesquisar filmes..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ disableUnderline: true }}
                sx={{ '& .MuiInputBase-input': { padding: '8px', color: 'white' } }}
              />
            </Box>
            <Box sx={{ flexGrow: 1, ml: 2 }}>
              <Button color="inherit">Filtros</Button>
            </Box>
            <Button variant="contained" color="secondary" startIcon={<AddIcon />} sx={{ mr: 2 }} onClick={() => setOpenAddModal(true)}>
              Add Filme
            </Button>
            <IconButton color="inherit"><PersonIcon /></IconButton>
            <Button color="inherit" onClick={onLogout}>Sair</Button>
          </Toolbar>
        </AppBar>

        <Container className="dashboard-main">
          <Typography variant="h4" gutterBottom align="center" sx={{ fontSize: '2rem', fontWeight: 'bold' }}>
            Catálogo de filmes
          </Typography>
          <Box>
            <Grid container spacing={3} justifyContent="center">
              {filmes.map((filme) => (
                <Grid item key={filme.id_filme}>
                  <Card className="dashboard-card" sx={{ backgroundColor: '#303540', color: 'white'}}>
                    <CardMedia
                      className="dashboard-card-media" component="img" image={filme.url_poster} title={filme.titulo}
                    />
                    <CardContent sx={{ flexGrow: 1, padding: '4px', minHeight: '30px', marginTop: '15px', marginLeft: '4px' }}>
                      <Typography gutterBottom variant="h5" component="div" className="dashboard-card-title" sx={{ fontSize: '1.16rem', fontWeight: '400' }}>
                        {filme.titulo}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', height: '60px' }}>
                      <Tooltip title={listStatus[filme.id_filme]?.desejoVer ? "Remover da Watchlist" : "Adicionar à Watchlist"} arrow>
                        <IconButton sx={{ padding: 0 }} onClick={() => handleToggleLista(filme.id_filme, 'Desejo Ver')}>
                          <img src={addLista} alt="Adicionar à lista" style={{ width: '40px', height: '40px', filter: listStatus[filme.id_filme]?.desejoVer ? 'opacity(0.4)' : 'none' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={listStatus[filme.id_filme]?.visto ? "Remover de 'Vistos'" : "Marcar como visto"} arrow>
                        <IconButton onClick={() => handleToggleLista(filme.id_filme, 'Vistos')} sx={{ padding: 0 }}>
                          <img src={olhoIcon} alt="Visto" style={{ width: '40px', height: '40px', filter: listStatus[filme.id_filme]?.visto ? "invert(45%) sepia(85%) saturate(500%) hue-rotate(90deg)" : "none" }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver detalhes" arrow>
                        <IconButton onClick={() => onVerDetalhes(filme)} sx={{ padding: 0 }}>
                          <img src={verInfo} alt="Ver Detalhes" style={{ width: '40px', height: '40px' }} />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
        <AddMovieForm
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          onSuccess={handleMovieAdded}
        />
      </Box>
    </ThemeProvider>
  );
}

export default DashboardPage;