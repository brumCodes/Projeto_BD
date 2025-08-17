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

const ListaDeFilmesPage = ({ usuario, onVerDetalhes, onLogout }) => {
    const { listaNome } = useParams();
    const navigate = useNavigate();
    const [filmesComStatus, setFilmesComStatus] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const tituloDaPagina = listaNome === 'vistos' ? 'Filmes Vistos' : 'Sua Watchlist';

    const fetchListas = async () => {
        if (!usuario || !usuario.id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        try {
            const [vistosResponse, watchlistResponse] = await Promise.all([
                axios.get(`http://127.0.0.1:5000/api/listas/${usuario.id}/vistos`),
                axios.get(`http://127.0.0.1:5000/api/listas/${usuario.id}/watchlist`)
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

    useEffect(() => {
        fetchListas();
    }, [usuario, listaNome]);

    const toggleLista = async (filmeId, nomeDaLista, isAdding) => {
        
        const filmeOriginal = filmesComStatus.find(f => f.id_filme === filmeId);
        setFilmesComStatus(prevFilmes => prevFilmes.filter(filme => filme.id_filme !== filmeId));
        
        const endpoint = isAdding ? 'adicionar_filme' : 'remover_filme';
        try {
            await axios.post(`http://127.0.0.1:5000/api/listas/${endpoint}`, {
                filme_id: filmeId,
                nome_lista: nomeDaLista,
                id_usuario: usuario.id
            });
        } catch (error) {
            console.error("Erro ao atualizar lista:", error);
            if (filmeOriginal) {
                await fetchListas();
            }
        }
    };

    const onToggleWatched = (filmeId, isAdding) => {
        toggleLista(filmeId, 'Vistos', isAdding);
    };
    
    const onToggleWatchlist = (filmeId, isAdding) => {
        toggleLista(filmeId, 'Desejo Ver', isAdding);
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
                        <img 
                            src={cinetrackLogo} 
                            alt="cinetrack" 
                            style={{ height: '35px', backgroundColor: 'transparent', cursor: 'pointer', marginRight: 'auto' }} 
                            onClick={() => navigate('/perfil')}
                        />
                        <Button color="inherit" onClick={() => navigate('/perfil')}>
                            perfil
                        </Button>
                        <IconButton color="inherit">
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
                            sair
                        </Button>
                    </Toolbar>
                </AppBar>

                <Container sx={{ mt: 4, color: 'white', pb: 8 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600, textAlign: 'center', mb: 4 }}>
                        {tituloDaPagina}
                    </Typography>
                    
                    {filmesComStatus.length > 0 ? (
                        <Grid container spacing={2} justifyContent="center" sx={{ flexGrow: 1 }}>
                            {filmesComStatus.map(filme => (
                                <Grid item key={filme.id_filme} xs={12} sm={6} md={4} lg={2.4}>
                                    <MovieCard 
                                        filme={filme} 
                                        onVerDetalhes={onVerDetalhes}
                                        onToggleWatched={onToggleWatched}
                                        onToggleWatchlist={onToggleWatchlist}
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