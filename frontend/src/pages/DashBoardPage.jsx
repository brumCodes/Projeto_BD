import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import { 
  Box, AppBar, Toolbar, Typography, Button, Container, IconButton, TextField, 
  Grid, Card, CardMedia, CardContent, CardActions 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';

function DashboardPage({ usuario, onLogout }) {
  const [filmes, setFilmes] = useState([]);

  useEffect(() => {
    const fetchFilmes = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/filmes');
        const data = await response.json();
        setFilmes(data);
      } catch (error) {
        console.error("Erro ao buscar filmes:", error);
      }
    };
    fetchFilmes();
  }, []);

  return (
    <Box className="dashboard-container">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ mr: 2 }}>
            Logo
          </Typography>
          <Box className="dashboard-search">
            <TextField fullWidth variant="standard" placeholder="Pesquisar filmes..." InputProps={{ disableUnderline: true }} />
          </Box>
          <Box sx={{ flexGrow: 1, ml: 2 }}>
            <Button color="inherit">Filtros</Button>
          </Box>
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} sx={{ mr: 2 }}>
            Add Filme
          </Button>
          <IconButton color="inherit">
            <PersonIcon />
          </IconButton>
          <Button color="inherit" onClick={onLogout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>

      <Container className="dashboard-main">
        <Typography variant="h4" gutterBottom align="center">
          Catálogo de Filmes
        </Typography>

        <Box className="dashboard-grid-wrapper">
          <Grid container spacing={3} justifyContent="center">
            {filmes.map((filme) => (
              <Grid item key={filme.id_filme} xs={12} sm={6} md={4} lg={3}>
                <Card className="dashboard-card">
                  <CardMedia
                    className="dashboard-card-media"
                    image={filme.url_poster}
                    title={filme.titulo}
                  />
                  <CardContent sx={{ flexGrow: 1, padding: '8px' }}>
                    <Typography gutterBottom variant="h5" component="div" className="dashboard-card-title">
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
    </Box>
  );
}

export default DashboardPage;
