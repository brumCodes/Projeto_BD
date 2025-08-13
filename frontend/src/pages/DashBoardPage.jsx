// frontend/src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import {
  Box, AppBar, Toolbar, Typography, Button, Container, IconButton, TextField,
  Grid, Card, CardMedia, CardContent, CardActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import AddMovieForm from '../components/AddMovieForm';
import axios from 'axios'

function DashboardPage({ usuario, onLogout }) {
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

  // Busca inicial
  useEffect(() => {
    fetchFilmes();
  }, []);

  // Debounce para busca
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFilmes(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleMovieAdded = () => {
    fetchFilmes(searchTerm); // mantém o filtro
  };

  return (
    <Box className="dashboard-container">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ mr: 2 }}>Logo</Typography>

          {/* Barra de busca */}
          <Box className="dashboard-search" sx={{ flexGrow: 1, maxWidth: 300 }}>
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
        <Typography variant="h4" gutterBottom align="center">
          Catálogo de Filmes
        </Typography>

        <Box>
          <Grid container spacing={3} justifyContent="center">
            {filmes.map((filme) => (
              <Grid item key={filme.id_filme}>
                <Card className="dashboard-card">
                  <CardMedia
                    className="dashboard-card-media"
                    component="img"
                    image={filme.url_poster}
                    title={filme.titulo}
                  />
                  <CardContent sx={{ flexGrow: 1, padding: '8px' }}>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      className="dashboard-card-title"
                    >
                      {filme.titulo}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Ver Detalhes</Button>
                    <Button size="small">Adicionar à Lista</Button>
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
  );
}

export default DashboardPage;
