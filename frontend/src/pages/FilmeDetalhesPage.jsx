import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
    Box, Typography, Container, Rating, Button, Paper, Grid, createTheme, 
    ThemeProvider, Dialog, DialogTitle, DialogContent, TextField, DialogActions,
    IconButton, Divider, CircularProgress, DialogContentText
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const theme = createTheme({
    typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        h3: { fontFamily: 'Poppins', fontWeight: 600 },
        h6: { fontFamily: 'Poppins', fontWeight: 500 }
    }
});

function FilmeDetalhesPage({ onVoltar, usuario }) {
    const { filmeId } = useParams();
    
    const [filme, setFilme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [userRating, setUserRating] = useState(0); 
    const [myRating, setMyRating] = useState(0); 
    const [resenha, setResenha] = useState(""); 
    const [openResenhaModal, setOpenResenhaModal] = useState(false); 
    const [isWatched, setIsWatched] = useState(false);
    const [isOnWatchlist, setIsOnWatchlist] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [mediaAvaliacao, setMediaAvaliacao] = useState(null);

    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [ordemReviews, setOrdemReviews] = useState('curtidas');


    useEffect(() => {
        if (!filmeId) return;

        const fetchAllMovieData = async () => {
            setLoading(true);
            try {
                const filmeResponse = await axios.get(`http://127.0.0.1:5000/api/filmes/${filmeId}`);
                setFilme(filmeResponse.data);
                setMediaAvaliacao(filmeResponse.data.media_avaliacao);

                if (usuario && usuario.id) {
                    const statusResponse = await axios.get(`http://127.0.0.1:5000/api/filmes/${filmeId}/status?usuario_id=${usuario.id}`);
                    if (statusResponse.data) {
                        setIsWatched(!!statusResponse.data.visto);
                        setIsOnWatchlist(!!statusResponse.data.desejo_ver);
                    }

                    const reviewsResponse = await axios.get(`http://127.0.0.1:5000/api/filmes/${filmeId}/reviews?usuario_id=${usuario.id}`);
                    const fetchedReviews = Array.isArray(reviewsResponse.data) ? reviewsResponse.data : [];
                    setReviews(fetchedReviews);
                    
                    const myReview = fetchedReviews.find(r => r.id_usuario === usuario.id);
                    if (myReview) {
                        setMyRating(myReview.nota);
                        setResenha(myReview.comentario || "");
                        setUserRating(myReview.nota);
                    } else {
                        setMyRating(0);
                    }
                }
                setError(null);
            } catch (err) {
                setError("Erro ao carregar dados do filme.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllMovieData();
    }, [filmeId, usuario]);

    const handleRatingChange = (event, newValue) => {
        setUserRating(newValue);
        const myReview = reviews.find(r => r.id_usuario === usuario.id);

        if (myReview) {
            setResenha(myReview.comentario || ""); 
            setEditingReviewId(myReview.id_avaliacao); 
        } else {
            setResenha("");
            setEditingReviewId(null);
        }

        if (newValue > 0) {
            setOpenResenhaModal(true);
        }
    };

    const handleCloseResenhaModal = () => {
        setOpenResenhaModal(false);
        setUserRating(myRating); 
        const myReview = reviews.find(r => r.id_usuario === usuario.id);
        setResenha(myReview?.comentario || "");
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

            const response = editingReviewId
                ? await axios.put(`http://127.0.0.1:5000/api/reviews/${editingReviewId}`, payload)
                : await axios.post(`http://127.0.0.1:5000/api/filmes/${filme.id_filme}/avaliacao`, payload);

            const { media_atualizada } = response.data;
            
            if (media_atualizada !== undefined) {
                setMediaAvaliacao(media_atualizada);
            }

            if (response.data.visto_adicionado) {
                setIsWatched(true);
            }

            const reviewsResponse = await axios.get(`http://127.0.0.1:5000/api/filmes/${filmeId}/reviews?usuario_id=${usuario.id}`);
            const fetchedReviews = Array.isArray(reviewsResponse.data) ? reviewsResponse.data : [];
            setReviews(fetchedReviews);
            
            const myReview = fetchedReviews.find(r => r.id_usuario === usuario.id);
            if (myReview) {
                setMyRating(myReview.nota);
            }

            handleCloseResenhaModal();
        } catch (error) {
            console.error("Erro ao salvar a resenha:", error.response ? error.response.data : error.message);
            alert("Erro ao salvar a resenha. Tente novamente.");
        }
    };
    
    const handleOpenDeleteConfirm = (review) => {
        setReviewToDelete(review);
        setOpenDeleteConfirm(true);
    };

    const handleCloseDeleteConfirm = () => {
        setReviewToDelete(null);
        setOpenDeleteConfirm(false);
    };
    
    const handleDeleteReview = async () => {
    if (!reviewToDelete || !usuario) return;

    try {
      const response = await axios.delete(`http://127.0.0.1:5000/api/reviews/${reviewToDelete.id_avaliacao}`, {
        data: { usuario_id: usuario.id }
      });
      
      setReviews(prevReviews => prevReviews.filter(r => r.id_avaliacao !== reviewToDelete.id_avaliacao));
      
      //limpa os dados da sua própria review se você a deletou
      if (reviewToDelete.id_usuario === usuario.id) {
        setMyRating(0);
        setUserRating(0);
        setResenha("");
      }

      const { media_atualizada } = response.data;
      if (media_atualizada !== undefined) {
        setMediaAvaliacao(media_atualizada);
      }

      handleCloseDeleteConfirm();
    } catch (error) {
      console.error("Erro ao deletar a review:", error);
      alert("Não foi possível deletar a review.");
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
            await axios.post(`http://127.0.0.1:5000/api/listas/${endpoint}`, {
                filme_id: filmeId,
                nome_lista: nomeDaLista,
                id_usuario: usuario.id
            });
            if (nomeDaLista === 'Vistos') {
                setIsWatched(prev => !prev);
            } else {
                setIsOnWatchlist(prev => !prev);
            }
        } catch (error) {
            console.error("Erro ao atualizar lista:", error);
        }
    };

    const handleWatchClick = () => toggleListaAPI(filme.id_filme, 'Vistos');
    const handleWatchlistClick = () => toggleListaAPI(filme.id_filme, 'Desejo Ver');

    const handleLikeReview = async (review) => {
        if (!usuario) {
            alert("Você precisa estar logado para curtir uma review.");
            return;
        }

        const originalReviews = [...reviews];
    
        const updatedReviews = reviews.map(r => {
            if (r.id_avaliacao === review.id_avaliacao) {
                const newLikedStatus = !r.curtido_por_voce;
                const newLikeCount = newLikedStatus ? r.curtidas_contagem + 1 : r.curtidas_contagem - 1;
                return { ...r, curtido_por_voce: newLikedStatus, curtidas_contagem: newLikeCount };
            }
            return r;
        });
        setReviews(updatedReviews);
    
        try {
            await axios.post(`http://127.0.0.1:5000/api/reviews/like`, { 
                id_avaliacao: review.id_avaliacao, 
                usuario_id: usuario.id 
            });
        } catch (error) {
            console.error("Erro ao curtir a review:", error);
            setReviews(originalReviews); 
            alert("Não foi possível curtir a review. Tente novamente.");
        }
    };

    const handleEditReview = (review) => {
        setUserRating(review.nota);
        setResenha(review.comentario);
        setEditingReviewId(review.id_avaliacao);
        setOpenResenhaModal(true);
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#121212' }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Typography color="error">{error}</Typography>;
    }
    if (!filme) {
        return <Typography>Filme não encontrado.</Typography>;
    }

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
                    top: 0, right: 0, width: '60%', height: '100%',
                    backgroundImage: `url(${filme.url_poster})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    filter: 'blur(5px)', opacity: 1, zIndex: -1,
                    maskImage: 'linear-gradient(to right, transparent 0%, black 50%, black 70%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%, black 70%, transparent 100%)',
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0, right: 0, width: '100%', height: '100%',
                    background: 'linear-gradient(90deg, #000000ff 30%, rgba(0, 0, 0, 0.8) 60%, rgba(18, 18, 18, 0.4) 100%)',
                    zIndex: -1,
                },
            }}>
                <IconButton onClick={onVoltar} sx={{ position: 'absolute', top: 16, left: 16, color: 'white' }}>
                    <ArrowBackIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">VOLTAR</Typography>
                </IconButton>
                <Container sx={{ position: 'relative', zIndex: 1, paddingY: 4 }}>
                    <Box sx={{ display: { md: 'flex' } }}>
                        <Box sx={{ width: { md: '66.66%' }, pr: { md: 4 } }}>
                            <Grid container spacing={4} sx={{ alignItems: 'flex-start', mt: 6}}>
                                <Grid item xs={12} sm={4}>
                                    <img src={filme.url_poster} alt={filme.titulo} style={{ width: '100%', borderRadius: '10px', maxWidth: '260px' }} />
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, fontSize: '2.2rem' }}>
                                        {filme.titulo}
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h6" component="span" sx={{ mr: 1, fontSize: '0.9rem' }}>{filme.ano}</Typography>
                                        <Typography variant="h6" component="span" sx={{ mr: 1, fontSize: '0.9rem' }}>• {filme.duracao} min</Typography>
                                        <Typography variant="h6" component="span" sx={{ fontSize: '0.9rem' }}>• {filme.genero}</Typography>
                                    </Box>
                                    <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>Diretor:</Typography>
                                    <Typography paragraph sx={{ fontSize: '0.95rem' }}>{filme.diretor}</Typography>
                                    <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>Sinopse:</Typography>
                                    <Typography paragraph sx={{ fontSize: '0.95rem' }}>{filme.sinopse}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                        <Box sx={{ width: { md: '33.33%' }, display: { xs: 'block', md: 'flex' }, justifyContent: 'center', alignItems: 'center', mt: { xs: 4, md: -16 }, ml: {md: 20} }}> 
                            <Paper elevation={6} sx={{ p: 2, backgroundColor: '#292828', color: 'white', borderRadius: '10px', width: '100%', maxWidth: '300px', minHeight: '360px', ml: '-20px' }}>
                                <Grid container justifyContent="space-around" sx={{ mb: 2 }}>
                                    <Grid item sx={{ textAlign: 'center' }}>
                                        <IconButton onClick={handleWatchClick} sx={{ color: isWatched ? '#27df73ff' : 'inherit'}}>
                                            <VisibilityIcon />
                                        </IconButton>
                                        <Typography variant="caption" sx={{ color: isWatched ? '#27df70ff' : 'inherit', fontSize: '0.9rem' }}>Assistido</Typography>
                                    </Grid>
                                    <Grid item sx={{ textAlign: 'center' }}>
                                        <IconButton onClick={handleWatchlistClick} sx={{ color: isOnWatchlist ? '#e9e96cff' : 'inherit' }}>
                                            <WatchLaterIcon />
                                        </IconButton>
                                        <Typography variant="caption" sx={{ color: isOnWatchlist ? '#e9e96cff' : 'inherit', fontSize: '0.8rem' }}>Watchlist</Typography>
                                    </Grid>
                                </Grid>
                                <Box sx={{ my: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }} />
                                <Box textAlign="center">
                                    <Typography variant="subtitle1" gutterBottom>Sua Nota</Typography>
                                    <Rating name="user-rating" value={myRating} onChange={handleRatingChange} precision={0.5} sx={{ color: '#25ec78ff', fontSize: '2.5rem' }} />
                                </Box>
                                <Box sx={{ my: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }} />
                                <Box textAlign="center" sx={{ mt: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom>Média de Avaliação</Typography>
                                    <Typography variant="h4" component="span" sx={{ fontWeight: 600, fontSize: '5rem', color: '#ffffffff' }}>
                                        {mediaAvaliacao ? mediaAvaliacao.toFixed(1) : "—"}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Box>
                    </Box>
                    
                    <Grid container justifyContent="center" sx={{ mt: 4 }}> 
                        <Grid item>
                            <Paper sx={{ p: 4, backgroundColor: '#1f1f1f', color: 'white', borderRadius: '10px', minHeight: '70vh', width: '92%', mr: 250 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 400, fontSize: '1.4rem', color: '#c9c8c8ff' }}>
                                        REVIEWS DE USUÁRIOS:
                                    </Typography>
                                    <Box>
                                        <Button
                                            onClick={() => setOrdemReviews('recentes')}
                                            sx={{
                                                color: ordemReviews === 'recentes' ? '#27df73' : 'white',
                                                backgroundColor: 'transparent',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                }
                                            }}
                                        >
                                            Mais Recentes
                                        </Button>
                                        <Button
                                            onClick={() => setOrdemReviews('curtidas')}
                                            sx={{
                                                color: ordemReviews === 'curtidas' ? '#27df73' : 'white',
                                                backgroundColor: 'transparent',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                }
                                            }}
                                        >
                                            Mais Curtidas
                                        </Button>
                                    </Box>
                                </Box>
                                <Box sx={{ my: 2 }} /> 
                                {reviews.length > 0 ? (
                                    [...reviews]
                                    .sort((a, b) => {
                                        if (ordemReviews === 'curtidas') {
                                            return b.curtidas_contagem - a.curtidas_contagem;
                                        }
                                        return new Date(b.data_avaliacao) - new Date(a.data_avaliacao);
                                    })
                                    .map((review) => (
                                        <Box key={review.id_avaliacao} sx={{ mb: 2 }}>
                                            <Link to={`/perfil/${review.id_usuario}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.6 }}>
                                                    <img src={review.url_avatar || 'https://i.ibb.co/Rk0TTxjr/transparent-Photoroom.jpg'} alt={review.nome_usuario} style={{ width: '60px', height: '60px', borderRadius: '50%', marginRight: '9px' }} />
                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.4rem', mb: 0.3}}>{review.nome_usuario}</Typography>
                                                        <Typography variant="body2" sx={{ color: '#a1a1a1' }}>{new Date(review.data_avaliacao).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short'})}</Typography>
                                                    </Box>
                                                </Box>
                                            </Link>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: -4, mr: 1,}}>
                                            {usuario && (review.id_usuario === usuario.id || usuario.is_admin) && (
                                              <>
                                            {review.id_usuario === usuario.id && (
                                             <IconButton onClick={() => handleEditReview(review)} sx={{ color: '#a1a1a1' }}>
                                               <EditIcon />
                                                 </IconButton>
                                                  )}  
        
                                                   {/* o autor ou o admin podem deletar uma review!!! */}
                                               <IconButton onClick={() => handleOpenDeleteConfirm(review)} sx={{ color: '#a1a1a1', ml: 1 }}>
                                              <DeleteIcon />
                                               </IconButton>
                                                 </>
                                                    )}
                                                <IconButton onClick={() => handleLikeReview(review)}>
                                                    <FavoriteIcon sx={{ color: review.curtido_por_voce ? '#ec4b4bff' : '#a1a1a1'}} />
                                                </IconButton>
                                                <Typography variant="body2" sx={{ ml: 1, color: '#a1a1a1' }}>{review.curtidas_contagem} curtidas</Typography>
                                            </Box>
                                            <Rating value={review.nota} readOnly precision={0.5} sx={{ color: '#25ec78ff', fontSize: '1.2rem', mb: 1, mt:1 }} />
                                            <Typography paragraph sx={{ whiteSpace: 'pre-wrap', mb:2 }}>{review.comentario}</Typography>
                                            <Divider sx={{ my: 2, backgroundColor: '#4d4f5c' }} />
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body1" sx={{ textAlign: 'center', mt: 16, color: '#a1a1a1' }}>
                                        Este filme ainda não possui reviews...
                                        Seja o primeiro a fazer uma.
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
                <Dialog open={openResenhaModal} onClose={handleCloseResenhaModal} sx={{ '& .MuiPaper-root': { backgroundColor: '#252525ff', color: '#ffffff', borderRadius: '8px', width: '450px', height: '450px', maxWidth: 'none', padding: '10px' }, '& .MuiDialogTitle-root': { padding: '16px', fontWeight: 600, borderBottom: '1px solid #181818ff' }, '& .MuiDialogContent-root': { padding: '16px' }, '& .MuiDialogActions-root': { padding: '8px 16px', borderTop: '1px solid #0e0e0eff', justifyContent: 'flex-end' }, '& .MuiRating-root': { color: '#60ec6cff' }, '& .MuiTextField-root': { backgroundColor: '#252525ff', borderRadius: '4px', '& .MuiInputBase-input': { color: '#ffffff' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#60ec6cff' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#a3f7a3ff' }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#a3f7a3ff' }, '& .MuiInputLabel-root': { color: '#aaaaaaff' } } }}>
                    <DialogTitle sx ={{ color : '#ffffff'}}>
                        {editingReviewId ? "Editar sua review" : (filme ? `Envie sua review para ${filme.titulo}`: "Envie sua review")}
                    </DialogTitle>
                    <DialogContent>
                        <Rating value={userRating} readOnly precision={0.5} sx={{ mb: 3, fontSize: '2.4rem' }} />
                        <TextField autoFocus margin="dense" id="resenha" label="Sua Resenha" type="text" fullWidth multiline rows={6} variant="outlined" value={resenha} onChange={(e) => setResenha(e.target.value)} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseResenhaModal} sx={{ color: '#ffffff' }}>Cancelar</Button>
                        <Button onClick={handleSalvarResenha} variant="contained" sx={{ backgroundColor: '#60ec6cff', '&:hover': { backgroundColor: '#a3f7a3ff' }, color: '#121212' }}>
                            Salvar
                        </Button>
                    </DialogActions>
                </Dialog>
                
                <Dialog
                    open={openDeleteConfirm}
                    onClose={handleCloseDeleteConfirm}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    sx={{ '& .MuiPaper-root': { backgroundColor: '#252525ff', color: 'white' } }}
                >
                    <DialogTitle id="alert-dialog-title" sx >
                        {"Confirmar Exclusão"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description" sx={{ color: '#b0b0b0' }}>
                            Você tem certeza que quer excluir sua review? Esta ação não pode ser desfeita.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteConfirm} sx={{ color: 'white' }}>Cancelar</Button>
                        <Button onClick={handleDeleteReview} sx={{ color: '#ff7961' }} autoFocus>
                            Excluir
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ThemeProvider>
    );
}

export default FilmeDetalhesPage;