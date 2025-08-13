// frontend/src/pages/DashboardPage.jsx

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
import axios from 'axios'
import cinetrackLogo from '../assets/cinetrack-logo.png';
import addLista from '../assets/add-lista2.png';
import verInfo from '../assets/ver-info.png';
import Tooltip from '@mui/material/Tooltip';


const dashboardTheme = createTheme({ //fonte poppins da google
  typography: {
    fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif',
  },
});


function DashboardPage({ usuario, onLogout, onVerDetalhes }) {
  const [filmes, setFilmes] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");



  // função para buscar filmes (todos ou filtrados)
const fetchFilmes = async (query = "") => {
  try {
    let url = 'http://127.0.0.1:5000/api/filmes';

    if (query.trim() !== "") {
      url = `http://127.0.0.1:5000/api/filmes/pesquisa?q=${encodeURIComponent(query)}`;
    }

    const response = await axios.get(url);
    setFilmes(response.data);
  } catch (error) {
    console.error("Erro ao buscar filmes:", error);
  }
};

  //busca inicial
  useEffect(() => {
    fetchFilmes();
  }, []);

  //controle de debounce para a barra de busca
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFilmes(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleMovieAdded = () => {
    fetchFilmes(searchTerm); //mantém o filtro
  };

return (
  <ThemeProvider theme={dashboardTheme}>
    <CssBaseline />
    <Box className="dashboard-container">
      <AppBar position="static"
        sx={{ backgroundColor: '#292828', color: 'white' }}>
        <Toolbar sx={{ color: 'white' }}>
          <img src={cinetrackLogo} alt="Cinetrack" style={{ height: '35px', backgroundColor: 'transparent' }} />

          {/* Barra de busca */}
          <Box className="dashboard-search" sx={{ flexGrow: 1, maxWidth: 300, ml: 4 }}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Pesquisar filmes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ disableUnderline: true }}
              sx={{
                '& .MuiInputBase-input': {
                  padding: '8px',
                  color: 'white'
                }
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1, ml: 2 }}>
            <Button color="inherit">Filtros</Button>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            sx={{ mr: 2 }}
            onClick={() => setOpenAddModal(true)}
          >
            Add Filme
          </Button>

          <IconButton color="inherit">
            <PersonIcon />
          </IconButton>

          <Button color="inherit" onClick={onLogout}>Sair</Button>
        </Toolbar>
      </AppBar>

      <Container className="dashboard-main">
        <Typography variant="h4" gutterBottom align="center" sx ={{ fontSize: '2rem', fontWeight: 'bold'}}>
          Catálogo de filmes
        </Typography>

        <Box>
          <Grid container spacing={3} justifyContent="center">
            {filmes.map((filme) => (
              <Grid item key={filme.id_filme}>
                <Card className="dashboard-card" sx={{ backgroundColor: '#303540', color: 'white'}}>
                  <CardMedia
                    className="dashboard-card-media"
                    component="img"
                    image={filme.url_poster}
                    title={filme.titulo}
                  />
                  <CardContent sx={{ flexGrow: 1, padding: '4px', minHeight: '30px', marginTop: '15x', marginLeft: '4px' }}>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      className="dashboard-card-title"
                      sx={{ fontSize: '1.16rem', fontWeight: '400' }}
                    >
                      {filme.titulo}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ gap: 1 , justifyContent: 'space-between'}}>
  <Tooltip title="Adicionar à lista" arrow>
    <IconButton>
      <img src={addLista} alt="Adicionar à lista" style={{ width: '40px', height: '40px',marginBottom: '30px', marginRight: '5px'}}
      />
    </IconButton>
  </Tooltip>

  <Tooltip title="Ver detalhes" arrow>
    <IconButton onClick={() => onVerDetalhes(filme)}
      sx ={{ padding:0, width: '40px', height: '40px', borderRadius: '8px', marginLeft: '20px' }}>
        <img src={verInfo} alt="Ver Detalhes" style={{ padding: 0, width: '40px', height: '40px', marginBottom: '30px' }}
      />
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
  </ThemeProvider> //fecha o provedor de tema
);
}

export default DashboardPage;