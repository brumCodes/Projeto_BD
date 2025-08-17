import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Grid, Button, Toolbar, AppBar, IconButton } from "@mui/material";
import axios from 'axios';
import MovieCard from '../components/MovieCard';
import cinetrackLogo from '../assets/cinetrack-logo.png';
import PersonIcon from '@mui/icons-material/Person';
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from '@mui/icons-material/Add';

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
        <Box className="dashboard-container" sx={{ flexGrow: 1 }}>
            <AppBar position="static" sx={{ backgroundColor: '#292828', color: 'white' }}>
                <Toolbar sx={{ color: 'white' }}>
                    <img 
                        src={cinetrackLogo} 
                        alt="cinetrack" 
                        style={{ height: '35px', backgroundColor: 'transparent', cursor: 'pointer' }} 
                        onClick={() => navigate('/perfil')}
                    />
                    <Box sx={{ flexGrow: 1 }} />
                    <Button color="inherit" startIcon={<FilterListIcon />} sx={{ color: '#d1d1d1ff' }}>
                        filtros
                    </Button>
                    <Button variant="contained" color="secondary" startIcon={<AddIcon />} sx={{ mr: 2 }}>
                        add filme
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/perfil')}>perfil</Button>
                    <IconButton color="inherit">
                        <PersonIcon />
                    </IconButton>
                    <Button color="inherit" onClick={onLogout}>sair</Button>
                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 4, color: 'white' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>{tituloDaPagina}</Typography>
                    <Button variant="contained" onClick={() => navigate(-1)}>Voltar</Button>
                </Box>
                
                {filmesComStatus.length > 0 ? (
                    <Grid container spacing={4} sx={{ mt: 2 }}>
                        {filmesComStatus.map(filme => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={filme.id_filme}>
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
    );
};

export default ListaDeFilmesPage;