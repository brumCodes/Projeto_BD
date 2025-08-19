import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import {
    Box, AppBar, Toolbar, Typography, Button, Container, IconButton, TextField,
    Grid, Card, CardMedia, CardContent, CardActions, Avatar, Divider
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import AddMovieForm from '../components/AddMovieForm';
import axios from 'axios';
import Filtros from './Filtros';
import FilterListIcon from "@mui/icons-material/FilterList";
import cinetrackLogo from '../assets/cinetrack-logo.png';
import addLista from '/images/simbolo-mais.png';
import verInfo from '/images/listbuttom.png';
import olhoIcon from '/images/icondeolho.png';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';

function DashboardPage({ usuario, onLogout, onVerPerfil }) {
    const [filmes, setFilmes] = useState([]);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [listStatus, setListStatus] = useState({});
    const [openFiltros, setOpenFiltros] = useState(false);
    const [filtrosAtivos, setFiltrosAtivos] = useState({});
    const [popularFilmes, setPopularFilmes] = useState([]);
    const [filmesVistosCount, setFilmesVistosCount] = useState(0);
    const navigate = useNavigate();

    const dashboardTheme = createTheme({
        typography: {
            fontFamily: 'Poppins, "Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
        },
    });

    const isSearchActive = searchTerm.trim() || Object.keys(filtrosAtivos).length > 0;

    const fetchFilmes = async (query = "", filtros = {}, usuario) => {
        if (!usuario || !usuario.id) {
            setFilmes([]);
            return;
        }
        try {
            let url = 'http://127.0.0.1:5000/api/filmes';
            const params = new URLSearchParams();
            params.append("usuario_id", usuario.id);
            if (query.trim()) params.append("q", query);
            if (filtros.ano) params.append("ano", filtros.ano);
            if (filtros.genero) params.append("genero", filtros.genero);
            if (params.toString()) url += "?" + params.toString();
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
        if (!usuario || !usuario.id) {
            alert("você precisa estar logado para adicionar filmes à sua lista.");
            return;
        }
        const isCurrentlyOnList = nomeDaLista === 'Vistos' ? listStatus[filmeId]?.visto : listStatus[filmeId]?.desejoVer;
        const endpoint = isCurrentlyOnList ? 'remover_filme' : 'adicionar_filme';
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/listas/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filme_id: filmeId,
                    nome_lista: nomeDaLista,
                    id_usuario: usuario.id
                }),
            });
            if (response.ok) {
                setListStatus(prev => ({
                    ...prev,
                    [filmeId]: {
                        ...prev[filmeId],
                        [nomeDaLista === 'Vistos' ? 'visto' : 'desejoVer']: !isCurrentlyOnList
                    }
                }));
                if (nomeDaLista === 'Vistos') {
                    setFilmesVistosCount(prev => isCurrentlyOnList ? prev - 1 : prev + 1);
                }
            } else {
                const data = await response.json();
                console.error(`erro: ${data.message}`);
            }
        } catch (error) {
            console.error("erro de conexão.", error);
        }
    };

    const handleMovieAdded = () => {
        setOpenAddModal(false);
    };

    const fetchPopularFilmes = async (usuario) => {
        if (!usuario || !usuario.id) {
            setPopularFilmes([]);
            return;
        }
        try {
            const response = await axios.get(`http://127.0.0.1:5000/api/filmes/populares?usuario_id=${usuario.id}`);
            const popularFilmesData = response.data;
            setPopularFilmes(popularFilmesData);

            const statusInicialPopulares = {};
            popularFilmesData.forEach(filme => {
                statusInicialPopulares[filme.id_filme] = {
                    visto: filme.visto,
                    desejoVer: filme.desejo_ver
                };
            });
            setListStatus(prevStatus => ({
                ...prevStatus,
                ...statusInicialPopulares
            }));
        } catch (error) {
            console.error("Erro ao buscar filmes populares:", error);
            setPopularFilmes([]);
        }
    };

    const fetchFilmesVistosCount = async (usuario) => {
        if (!usuario || !usuario.id) {
            setFilmesVistosCount(0);
            return;
        }
        try {
            const response = await axios.get(`http://127.0.0.1:5000/api/listas/vistos?id_usuario=${usuario.id}`);
            const count = response.data;
            setFilmesVistosCount(count);
        } catch (error) {
            console.error("Erro ao buscar a contagem de filmes vistos:", error.response ? error.response.data : error.message);
            setFilmesVistosCount(0);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchFilmes(searchTerm, filtrosAtivos, usuario);
        }, 200);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, filtrosAtivos, usuario]);

    useEffect(() => {
        if (usuario && usuario.id) {
            fetchPopularFilmes(usuario);
            fetchFilmesVistosCount(usuario);
        } else {
            setPopularFilmes([]);
            setFilmesVistosCount(0);
        }
    }, [usuario]);

    const tooltipContent = (
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1, color: 'white' }}>
            <Avatar src={usuario?.url_avatar} sx={{ width: 55, height: 55, mr: 1 }} />
            <Box>
                <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1.3rem' }}>
                    {usuario?.nome_usuario || 'Usuário'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                    {filmesVistosCount} filmes assistidos
                </Typography>
            </Box>
        </Box>
    );

    return (
        <ThemeProvider theme={dashboardTheme}>
            <CssBaseline />
            <Box className="dashboard-container">
                <AppBar position="static" sx={{ backgroundColor: '#0a0a11ff', color: 'white', backdropFilter: 'blur(30px)' }}>
                    <Toolbar sx={{ color: 'white' }}>
                        <img
                            src={cinetrackLogo}
                            alt="Cinetrack"
                            style={{ height: '35px', backgroundColor: 'transparent', cursor: 'pointer' }}
                            onClick={() => navigate('/dashboard')}
                        />
                        <Box className="dashboard-search" sx={{ flexGrow: 1, maxWidth: 300, ml: 4 }}>
                            <TextField
                                fullWidth variant="standard" placeholder="Pesquisar filmes..."
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{ disableUnderline: true }}
                                sx={{ '& .MuiInputBase-input': { padding: '8px', color: 'white' } }}
                            />
                        </Box>
                        <Box sx={{ flexGrow: 1, ml: 2 }}>
                            <Button color="inherit" startIcon={<FilterListIcon />} onClick={() => setOpenFiltros(true)}
                                sx={{ color: '#d1d1d1ff' }}
                            >
                                Filtros
                            </Button>
                        </Box>

                        <Tooltip title="Adicionar novo filme" arrow>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setOpenAddModal(true)}
                                sx={{
                                    backgroundColor: '#27df73ff',
                                    color: '#0a0a11ff',
                                    borderRadius: '50px',
                                    padding: '6px 18px',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    textTransform: 'uppercase',
                                    mr: 2,
                                    '&:hover': {
                                        backgroundColor: '#30e481ff',
                                        transform: 'scale(1.02)',
                                    },
                                    transition: 'transform 0.2s ease-in-out',
                                }}
                            >
                                Add Filme
                            </Button>
                        </Tooltip>
                        <IconButton color="inherit" onClick={onVerPerfil}>
                            {usuario && usuario.url_avatar ? (
                                <Avatar
                                    src={usuario.url_avatar}
                                    sx={{ width: 35, height: 35 }}
                                />
                            ) : (
                                <PersonIcon />
                            )}
                        </IconButton>
                        <Button color="inherit" onClick={onLogout}>Sair</Button>
                    </Toolbar>
                </AppBar>
                <Container className="dashboard-main">
                    {!isSearchActive && popularFilmes.length > 0 && (
                        <Box sx={{ mt: 8, mb: 6 }}>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontFamily: 'Poppins',
                                    fontWeight: 300,
                                    textAlign: 'center',
                                    mb: 1.5,
                                    fontSize: '1.6rem',
                                    color: '#b1adadff',
                                    mt: 10,
                                    mb: 10,
                                }}
                            >
                                Bem-vindo,{' '}
                                <Tooltip title={tooltipContent} arrow>
                                    <Box component="span" sx={{ cursor: 'pointer', color: '#ffffffff' }}>
                                        {usuario?.nome_usuario || 'Usuário'}
                                    </Box>
                                </Tooltip>
                                ! Vem ver o que os seus amigos estão assistindo...
                            </Typography>
                            {!isSearchActive && popularFilmes.length > 0 && (
                                <Divider sx={{ my: 4, backgroundColor: '#4a4b52ff' }} />
                            )}
                            <Typography
                                variant="h5"
                                sx={{
                                    fontFamily: 'Poppins',
                                    fontWeight: 300,
                                    textAlign: 'center',
                                    mb: 2.5,
                                    fontSize: '1.6rem',
                                    color: '#b8b6b6ff'
                                }}
                            >
                                MELHORES AVALIAÇÕES
                            </Typography>
                            <Grid container spacing={3} justifyContent="center">
                                {popularFilmes.map(filme => (
                                    <Grid item key={filme.id_filme} xs={12} sm={6} md={4} lg={2.4}>
                                        <Card className="dashboard-card" sx={{ backgroundColor: '#303540', color: 'white', minWidth: '150px', mr: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <CardMedia
                                                className="dashboard-card-media"
                                                component="img"
                                                image={filme.url_poster}
                                                title={filme.titulo}
                                            />
                                            <CardContent sx={{ padding: '8px', minHeight: '50px', marginLeft: '4px', marginTop: '6px', paddingTop: '4px', paddingBottom: '8px' }}>
                                                <Typography gutterBottom variant="h5" component="div" className="dashboard-card-title" sx={{ fontSize: '1.06rem', fontWeight: '400', height: '2.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                                                    {filme.titulo}
                                                </Typography>
                                            </CardContent>
                                            <CardActions sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', paddingTop: '13px', paddingBottom: '28px', paddingLeft: '8px', paddingRight: '8px', height: '20px' }}>
                                                <Tooltip title={listStatus[filme.id_filme]?.desejoVer ? "Remover da Watchlist" : "Adicionar à Watchlist"} arrow>
                                                    <IconButton sx={{ padding: 0, mx: 0.5 }} onClick={() => handleToggleLista(filme.id_filme, 'Desejo Ver')}>
                                                        <img src={addLista} alt="Adicionar à lista" style={{ width: '28px', height: '28px', filter: listStatus[filme.id_filme]?.desejoVer ? 'opacity(0.4)' : 'none' }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={listStatus[filme.id_filme]?.visto ? "Remover de 'Vistos'" : "Marcar como visto"} arrow>
                                                    <IconButton sx={{ padding: 0, mx: 0.5 }} onClick={() => handleToggleLista(filme.id_filme, 'Vistos')}>
                                                        <img src={olhoIcon} alt="Visto" style={{ width: '37px', height: '37px', filter: listStatus[filme.id_filme]?.visto ? "invert(45%) sepia(85%) saturate(500%) hue-rotate(90deg)" : "none" }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Ver detalhes" arrow>
                                                    <IconButton sx={{ padding: 0, mx: 0.5 }} onClick={() => navigate(`/filme/${filme.id_filme}`)}>
                                                        <img src={verInfo} alt="Ver Detalhes" style={{ width: '36px', height: '36px' }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {!isSearchActive && popularFilmes.length > 0 && (
                        <Divider sx={{ my: 4, backgroundColor: '#4d4f5c' }} />
                    )}

                    {!isSearchActive && (
                        <Typography variant="h4" gutterBottom align="center" sx={{ fontFamily: 'Poppins', fontWeight: 300, textAlign: 'center', mb: 2.5, fontSize: '1.6rem', color: '#c9c8c8ff' }}>
                            CATÁLOGO DE FILMES
                        </Typography>
                    )}
                    {filmes.length === 0 && isSearchActive ? (
                        <Box display="flex" justifyContent="center" alignItems="center" mt={4}>
                            <Typography variant="h6" color="#a1a1a1ff" sx={{ textAlign: 'center', fontSize: '1.6rem', marginTop: '100px' }}>
                                Nenhum resultado encontrado.
                            </Typography>
                        </Box>
                    ) : (
                        <Box>
                            <Grid container spacing={3} justifyContent="center">
                                {filmes.map((filme) => (
                                    <Grid item key={filme.id_filme} xs={12} sm={6} md={4} lg={2.4}>
                                        <Card className="dashboard-card" sx={{ backgroundColor: '#303540', color: 'white', minWidth: '150px', mr: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <CardMedia
                                                className="dashboard-card-media" component="img" image={filme.url_poster} title={filme.titulo}
                                            />
                                            <CardContent sx={{ padding: '8px', minHeight: '50px', marginLeft: '4px', marginTop: '6px', paddingTop: '4px', paddingBottom: '8px' }}>
                                                <Typography gutterBottom variant="h5" component="div" className="dashboard-card-title" sx={{ fontSize: '1.06rem', fontWeight: '400', height: '2.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                                                    {filme.titulo}
                                                </Typography>
                                            </CardContent>
                                            <CardActions sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', paddingTop: '13px', paddingBottom: '28px', paddingLeft: '8px', paddingRight: '8px', height: '20px' }}>
                                                <Tooltip title={listStatus[filme.id_filme]?.desejoVer ? "Remover da Watchlist" : "Adicionar à Watchlist"} arrow>
                                                    <IconButton sx={{ padding: 0, mx: 0.5 }} onClick={() => handleToggleLista(filme.id_filme, 'Desejo Ver')}>
                                                        <img src={addLista} alt="Adicionar à lista" style={{ width: '28px', height: '28px', filter: listStatus[filme.id_filme]?.desejoVer ? 'opacity(0.4)' : 'none' }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={listStatus[filme.id_filme]?.visto ? "Remover de 'Vistos'" : "Marcar como visto"} arrow>
                                                    <IconButton sx={{ padding: 0, mx: 0.5 }} onClick={() => handleToggleLista(filme.id_filme, 'Vistos')}>
                                                        <img src={olhoIcon} alt="Visto" style={{ width: '37px', height: '37px', filter: listStatus[filme.id_filme]?.visto ? "invert(45%) sepia(85%) saturate(500%) hue-rotate(90deg)" : "none" }} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Ver detalhes" arrow>
                                                    <IconButton sx={{ padding: 0, mx: 0.5 }} onClick={() => navigate(`/filme/${filme.id_filme}`)}>
                                                        <img src={verInfo} alt="Ver Detalhes" style={{ width: '36px', height: '36px' }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}
                </Container>
                <AddMovieForm
                    open={openAddModal}
                    onClose={() => setOpenAddModal(false)}
                    onSuccess={handleMovieAdded}
                    usuario={usuario}
                />
                <Filtros
                    open={openFiltros}
                    onClose={() => setOpenFiltros(false)}
                    filtrosAtivos={filtrosAtivos}
                    onApply={(filtrosSelecionados) => {
                        setFiltrosAtivos(filtrosSelecionados);
                        setOpenFiltros(false);
                    }}
                />
            </Box>
        </ThemeProvider>
    );
}

export default DashboardPage;