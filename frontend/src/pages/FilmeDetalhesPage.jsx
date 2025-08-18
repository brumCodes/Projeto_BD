import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Box, Typography, Container, Rating, Button, Paper, Grid, createTheme, 
    ThemeProvider, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
    IconButton, Divider
} from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EditIcon from '@mui/icons-material/Edit'; // Importe o ícone do lápis
import axios from 'axios';

const theme = createTheme({
    typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        h3: {
            fontFamily: 'Poppins',
            fontWeight: 600
        },
        h6: {
            fontFamily: 'Poppins',
            fontWeight: 500
        }
    }
});

function FilmeDetalhesPage({ filme, onVoltar, usuario }) {
    const [userRating, setUserRating] = useState(0); 
    const [myRating, setMyRating] = useState(0); 
    const [resenha, setResenha] = useState(""); 
    const [openResenhaModal, setOpenResenhaModal] = useState(false); 
    const [isWatched, setIsWatched] = useState(false);
    const [isOnWatchlist, setIsOnWatchlist] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [editingReviewId, setEditingReviewId] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

        useEffect(() => {
        window.scrollTo(0, 0);
        
        const fetchMovieStatusAndReviews = async () => {
            if (!filme || !filme.id_filme || !usuario || !usuario.id) {
                console.log('Filme ou usuário não definidos, pulando a busca de status e reviews.');
                return;
            }

            try {
                const statusResponse = await axios.get(`http://127.0.0.1:5000/api/filmes/${filme.id_filme}/status?usuario_id=${usuario.id}`);
                if (statusResponse.data) {
                    setIsWatched(!!statusResponse.data.visto);
                    setIsOnWatchlist(!!statusResponse.data.desejo_ver);
                }

                const reviewsResponse = await axios.get(`http://127.0.0.1:5000/api/filmes/${filme.id_filme}/reviews?usuario_id=${usuario.id}`);
                
                console.log("Dados de reviews recebidos:", reviewsResponse.data);

                // --- CORREÇÃO AQUI ---
                // Verifica se a resposta é um array antes de setar o estado
                if (Array.isArray(reviewsResponse.data)) {
                    setReviews(reviewsResponse.data);
                } else {
                    console.error("A API de reviews retornou dados inválidos. Esperado um array.");
                    setReviews([]); // Define para um array vazio para evitar erros
                }
                
                // O resto do seu código de tratamento de reviews
                const myReview = reviewsResponse.data.find(r => r.id_usuario === usuario.id);
                if (myReview) {
                    setMyRating(myReview.nota);
                    setResenha(myReview.comentario || "");
                    setUserRating(myReview.nota);
                }

            } catch (error) {
                console.error("Erro ao buscar dados do filme:", error);
                setReviews([]); // Em caso de erro, garante que reviews é um array vazio.
            }
        };
        fetchMovieStatusAndReviews();
    }, [filme, usuario]); // Dependências do useEffect


    if (!filme) {
        console.log('Filme não encontrado.', filme);
        return <Typography>Filme não encontrado.</Typography>;
    }

    const handleRatingChange = (event, newValue) => {
        setUserRating(newValue);
        if (newValue > 0) {
            setOpenResenhaModal(true);
        }
    };

    const handleCloseResenhaModal = () => {
        setOpenResenhaModal(false);
        setUserRating(myRating); 
        setResenha(reviews.find(r => r.id_usuario === usuario.id)?.comentario || "");
        setEditingReviewId(null);
    };

    const handleSalvarResenha = async () => {
        if (!userRating || !usuario) {
            alert("Por favor, selecione uma nota e faça login antes de salvar a resenha.");
            return;
        }

        try {
            const payload = {
                nota: userRating,
                comentario: resenha,
                usuario_id: usuario.id
            };

            // Se estiver editando, usa o endpoint PUT
            const response = editingReviewId
                ? await axios.put(`http://127.0.0.1:5000/api/reviews/${editingReviewId}`, payload)
                : await axios.post(`http://127.0.0.1:5000/api/filmes/${filme.id_filme}/avaliacao`, payload);

            const { id_avaliacao } = response.data;

            if (response.data.visto_adicionado) {
                setIsWatched(true);
            }

            setReviews(prevReviews => {
                const existingReviewIndex = prevReviews.findIndex(r => r.id_usuario === usuario.id);

                const userReviewData = existingReviewIndex !== -1
                    ? prevReviews[existingReviewIndex]
                    : { nome_usuario: usuario.nome_usuario, url_avatar: usuario.url_avatar };

                const newReview = {
                    id_avaliacao: id_avaliacao, 
                    id_filme: filme.id_filme,
                    id_usuario: usuario.id,
                    ...userReviewData, 
                    nota: userRating,
                    comentario: resenha,
                    data_avaliacao: new Date().toISOString(),
                    curtido_por_voce: false
                };

                if (existingReviewIndex !== -1) {
                    const updatedReviews = [...prevReviews];
                    updatedReviews[existingReviewIndex] = newReview;
                    return updatedReviews;
                } else {
                    return [newReview, ...prevReviews];
                }
            });

            setMyRating(userRating);
            handleCloseResenhaModal();
        } catch (error) {
            console.error("Erro ao salvar a resenha:", error.response ? error.response.data : error.message);
            alert("Erro ao salvar a resenha. Tente novamente.");
        }
    };

    const toggleListaAPI = async (filmeId, nomeDaLista) => {
        if (!usuario) { 
            alert("Você precisa estar logado para adicionar filmes à sua lista.");
            return;
        }
        const isCurrentlyOnList = nomeDaLista === 'Vistos' ? isWatched : isOnWatchlist;
        const endpoint = isCurrentlyOnList ? 'remover_filme' : 'adicionar_filme';
        
        try {
            const response = await axios.post(`http://127.0.0.1:5000/api/listas/${endpoint}`, {
                filme_id: filmeId,
                nome_lista: nomeDaLista,
                id_usuario: usuario.id
            });

            if (response.status >= 200 && response.status < 300) {
                if (nomeDaLista === 'Vistos') {
                    setIsWatched(prev => !prev);
                } else {
                    setIsOnWatchlist(prev => !prev);
                }
            }
        } catch (error) {
            console.error("Erro ao atualizar lista:", error);
        }
    };

    const handleWatchClick = () => {
        toggleListaAPI(filme.id_filme, 'Vistos');
    };

    const handleWatchlistClick = () => {
        toggleListaAPI(filme.id_filme, 'Desejo Ver');
    };

    const handleLikeReview = async (review) => {
        if (!usuario) {
            alert("Você precisa estar logado para curtir uma review.");
            return;
        }

        try {
            const response = await axios.post(`http://127.0.0.1:5000/api/reviews/like`, { 
                id_avaliacao: review.id_avaliacao, 
                usuario_id: usuario.id 
            });
            
            setReviews(prevReviews => prevReviews.map(r => {
                if (r.id_avaliacao === review.id_avaliacao) { 
                    const newLikedStatus = !r.curtido_por_voce;
                    const newLikeCount = newLikedStatus ? r.curtidas_contagem + 1 : r.curtidas_contagem - 1;
                    return { 
                        ...r, 
                        curtido_por_voce: newLikedStatus,
                        curtidas_contagem: newLikeCount
                    };
                }
                return r;
            }));

        } catch (error) {
            console.error("Erro ao curtir a review:", error);
        }
    };

    // Nova função para iniciar a edição da review
    const handleEditReview = (review) => {
        setUserRating(review.nota);
        setResenha(review.comentario);
        setEditingReviewId(review.id_avaliacao); // Salva o ID da review que será editada
        setOpenResenhaModal(true);
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{
                minHeight: '100vh',
                position: 'relative',
                color: 'white',
                padding: 4,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '60%',
                    height: '100%',
                    backgroundImage: `url(${filme.url_poster})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(5px)',
                    opacity: 1,
                    zIndex: -1,
                    maskImage: 'linear-gradient(to right, transparent 0%, black 50%, black 70%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%, black 70%, transparent 100%)',
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #000000ff 30%, rgba(0, 0, 0, 0.8) 60%, rgba(18, 18, 18, 0.4) 100%)',
                    zIndex: -1,
                },
            }}>
                <IconButton 
                    onClick={onVoltar} 
                    sx={{ position: 'absolute', top: 16, left: 16, color: 'white' }}
                >
                    <ArrowBackIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">VOLTAR</Typography>
                </IconButton>
                <Container sx={{ position: 'relative', zIndex: 1, paddingY: 4 }}>
                    {/* Conteúdo principal do filme e card de avaliação */}
                    <Box sx={{ display: { md: 'flex' } }}>
                        <Box sx={{ width: { md: '66.66%' }, pr: { md: 4 } }}>
                            <Grid container spacing={4} sx={{ alignItems: 'flex-start', mt: 6}}>
                                <Grid item xs={12} sm={4}>
                                    <img
                                        src={filme.url_poster}
                                        alt={filme.titulo}
                                        style={{ width: '100%', borderRadius: '10px', maxWidth: '260px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, fontSize: '2.2rem' }}>
                                        {filme.titulo}
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h6" component="span" sx={{ mr: 1, fontSize: '0.9rem' }}>
                                            {filme.ano}
                                        </Typography>
                                        <Typography variant="h6" component="span" sx={{ mr: 1, fontSize: '0.9rem' }}>
                                            • {filme.duracao} min
                                        </Typography>
                                        <Typography variant="h6" component="span" sx={{ fontSize: '0.9rem' }}>
                                            • {filme.genero}
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>Diretor:</Typography>
                                    <Typography paragraph sx={{ fontSize: '0.95rem' }}>{filme.diretor}</Typography>
                                    <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>Sinopse:</Typography>
                                    <Typography paragraph sx={{ fontSize: '0.95rem' }}>{filme.sinopse}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                        <Box 
                            sx={{ 
                                width: { md: '33.33%' }, 
                                display: { xs: 'block', md: 'flex' }, 
                                justifyContent: 'center', 
                                alignItems: 'center', 
                                mt: { xs: 4, md: -16 },
                                ml: {md: 20}
                            }}> 
                            <Paper
                                elevation={6}
                                sx={{
                                    p: 2,
                                    backgroundColor: '#292828',
                                    color: 'white',
                                    borderRadius: '10px',
                                    width: '100%',
                                    maxWidth: '300px',
                                    minHeight: '360px',
                                    ml: '-20px',
                                }}
                            >
                                <Grid container justifyContent="space-around" sx={{ mb: 2 }}>
                                    <Grid item sx={{ textAlign: 'center' }}>
                                        <IconButton 
                                            onClick={handleWatchClick}
                                            sx={{ color: isWatched ? '#27df73ff' : 'inherit'}}
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                        <Typography 
                                            variant="caption"
                                            sx={{ color: isWatched ? '#27df70ff' : 'inherit',
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            Assistido
                                        </Typography>
                                    </Grid>
                                    <Grid item sx={{ textAlign: 'center' }}>
                                        <IconButton 
                                            onClick={handleWatchlistClick} 
                                            sx={{ color: isOnWatchlist ? '#e9e96cff' : 'inherit' }}
                                        >
                                            <WatchLaterIcon />
                                        </IconButton>
                                        <Typography 
                                            variant="caption"
                                            sx={{ color: isOnWatchlist ? '#e9e96cff' : 'inherit',
                                                fontSize: '0.8rem',
                                            }}
                                        >
                                            Watchlist
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Box sx={{ my: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }} />
                                <Box textAlign="center">
                                    <Typography variant="subtitle1" gutterBottom>Nota</Typography>
                                    <Rating
                                        name="user-rating"
                                        value={myRating} 
                                        onChange={handleRatingChange}
                                        precision={0.5}
                                        sx={{ color: '#25ec78ff', fontSize: '2.5rem' }}
                                    />
                                </Box>
                                <Box sx={{ my: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }} />
                                <Box textAlign="center" sx={{ mt: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>Média de Avaliação</Typography>
                                    <Typography
                                        variant="h4"
                                        component="span"
                                        sx={{ fontWeight: 600, fontSize: '5rem', color: '#ffffffff' }}
                                    >
                                        {filme.media_avaliacao || "—"}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                    
                    <Grid container justifyContent="center" sx={{ mt: 4 }}> 
                        <Grid item >
                            <Paper 
                                sx={{ 
                                    p: 4, 
                                    backgroundColor: '#1f1f1f', 
                                    color: 'white', 
                                    borderRadius: '10px',
                                    minHeight: '70vh',
                                    width: '92%',
                                    mr: 250
                                }}
                            >
                                <Typography 
                                    variant="h5" 
                                    gutterBottom 
                                    sx={{ 
                                        fontWeight: 400, 
                                        fontSize: '1.4rem', 
                                        color: '#c9c8c8ff',
                                        mb: 3
                                    }}
                                >
                                    REVIEWS DE USUÁRIOS:
                                </Typography>
                                <Box sx={{ my: 2 }} /> 
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <Box key={review.id_filme + '-' + review.id_usuario} sx={{ mb: 2 }}>
                                            <Link to={`/perfil/${review.id_usuario}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.6 }}>
                                                    <img
                                                        src={review.url_avatar || 'https://i.ibb.co/Rk0TTxjr/transparent-Photoroom.jpg'} 
                                                        alt={review.nome_usuario}
                                                        style={{ width: '60px', height: '60px', borderRadius: '50%', marginRight: '9px' }}
                                                    />
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.4rem', mb: 0.3}}>
                                                            {review.nome_usuario}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: '#a1a1a1' }}>
                                                            {new Date(review.data_avaliacao).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short'})}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Link>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: -4, mr: 1,}}>
                                                {/* CONDICIONAL: Mostra o ícone de lápis apenas se a review for do usuário logado */}
                                                {review.id_usuario === usuario.id && (
                                                    <IconButton 
                                                        onClick={() => handleEditReview(review)}
                                                        sx={{ color: '#a1a1a1', mr: 1 }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                )}
                                                <IconButton onClick={() => handleLikeReview(review)}>
                                                    <FavoriteIcon 
                                                        sx={{ color: review.curtido_por_voce ? '#ec4b4bff' : '#a1a1a1'}} 
                                                    />
                                                </IconButton>
                                                <Typography variant="body2" sx={{ ml: 1, color: '#a1a1a1' }}>
                                                    {review.curtidas_contagem} curtidas
                                                </Typography>
                                            </Box>
                                            <Rating value={review.nota} readOnly precision={0.5} sx={{ color: '#25ec78ff', fontSize: '1.2rem', mb: 1, mt:1 }} />
                                            <Typography paragraph sx={{ whiteSpace: 'pre-wrap', mb:2 }}>
                                                {review.comentario}
                                            </Typography>
                                            <Divider sx={{ my: 2, backgroundColor: '#4d4f5c' }} />
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body1" sx={{ textAlign: 'center', mt: 4, color: '#a1a1a1' }}>
                                        Nenhuma review encontrada para este filme.
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
                <Dialog
                    open={openResenhaModal}
                    onClose={handleCloseResenhaModal}
                    sx={{
                        '& .MuiPaper-root': {
                            backgroundColor: '#252525ff',
                            color: '#ffffff',
                            borderRadius: '8px',
                            width: '450px',
                            height: '450px',
                            maxWidth: 'none',
                            padding: '10px',
                        },
                        '& .MuiDialogTitle-root': {
                            padding: '16px',
                            fontWeight: 600,
                            borderBottom: '1px solid #181818ff',
                        },
                        '& .MuiDialogContent-root': {
                            padding: '16px',
                        },
                        '& .MuiDialogActions-root': {
                            padding: '8px 16px',
                            borderTop: '1px solid #0e0e0eff',
                            justifyContent: 'flex-end',
                        },
                        '& .MuiRating-root': {
                            color: '#60ec6cff',
                        },
                        '& .MuiTextField-root': {
                            backgroundColor: '#252525ff',
                            borderRadius: '4px',
                            '& .MuiInputBase-input': {
                                color: '#ffffff', 
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#60ec6cff',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#a3f7a3ff',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#a3f7a3ff',
                            },
                            '& .MuiInputLabel-root': {
                                color: '#aaaaaaff',
                            },
                        },
                    }}
                >
                    <DialogTitle
                        sx ={{ color : '#ffffff'}}
                    >
                        {editingReviewId ? "Editar sua review" : `Envie sua review para ${filme.titulo}`}
                    </DialogTitle>
                    <DialogContent>
                        <Rating
                            value={userRating}
                            readOnly
                            precision={0.5}
                            sx={{ 
                                mb: 3,
                                fontSize: '2.4rem'
                            }}
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="resenha"
                            label="Sua Resenha"
                            type="text"
                            fullWidth
                            multiline
                            rows={6}
                            variant="outlined"
                            value={resenha}
                            onChange={(e) => setResenha(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseResenhaModal} sx={{ color: '#ffffff' }}>Cancelar</Button>
                        <Button 
                            onClick={handleSalvarResenha} 
                            variant="contained" 
                            sx={{ 
                                backgroundColor: '#60ec6cff', 
                                '&:hover': {
                                    backgroundColor: '#a3f7a3ff',
                                },
                                color: '#121212'
                            }}
                        >
                            Salvar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ThemeProvider>
    );
}

export default FilmeDetalhesPage;
