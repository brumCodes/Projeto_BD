import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography, InputAdornment } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MovieIcon from '@mui/icons-material/Movie';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TheatersIcon from '@mui/icons-material/Theaters';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import NotesIcon from '@mui/icons-material/Notes';
import axios from 'axios';

const addMovieTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { paper: '#1a1a1a' },
    text: { primary: '#ffffff', secondary: '#999999' },
    primary: { main: '#27df73', contrastText: '#0a0a11' },
    secondary: { main: '#888888', contrastText: '#ffffff' },
    divider: '#333333',
  },
  typography: { fontFamily: 'Poppins, "Montserrat", "Roboto", "Helvetica", "Arial", sans-serif', h6: { fontWeight: 400, letterSpacing: '-0.01em' } },
  components: {
    MuiDialog: { styleOverrides: { paper: { backgroundColor: '#1a1a1a', color: '#ffffff', borderRadius: '12px', border: '1px solid #333333', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)' } } },
    MuiTextField: { styleOverrides: { root: { '& .MuiInputBase-input': { color: '#ffffff' }, '& .MuiOutlinedInput-root': { backgroundColor: 'transparent', borderRadius: '8px', transition: 'border-color 0.2s ease', '& fieldset': { borderColor: '#333333', borderWidth: '1px' }, '&:hover fieldset': { borderColor: '#666666' }, '&.Mui-focused fieldset': { borderColor: '#27df73' } }, '& .MuiInputLabel-root': { color: '#999999', '&.Mui-focused': { color: '#ffffff' } } } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500, borderRadius: '8px', transition: 'transform 0.2s ease' }, contained: { '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' } } } },
  },
});

function AddMovieForm({ open, onClose, onSuccess, usuario }) { // Adicionado 'usuario' aqui
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    // Valida se o usuário está logado antes de continuar
    if (!usuario || !usuario.id) {
        setError("Erro: Você precisa estar logado para adicionar um filme.");
        setLoading(false);
        return;
    }

    // Validação frontend para campos obrigatórios
    const camposObrigatorios = ['titulo', 'ano', 'diretor'];
    for (const campo of camposObrigatorios) {
      if (!formData[campo]) {
        setError(`O campo '${campo}' é obrigatório.`);
        setLoading(false);
        return;
      }
    }
    
    // Converte os valores para o tipo correto e inclui o id_usuario
    const filmeParaEnviar = {
      ...formData,
      id_usuario: usuario.id, // Pega o ID do objeto de usuário
      ano: parseInt(formData.ano),
      duracao: formData.duracao ? parseInt(formData.duracao) : null
    };

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/filmes', filmeParaEnviar);

      if (response.status === 201) {
        onSuccess();
        onClose();
        setFormData({});
      }
    } catch (err) {
      console.error("Erro ao adicionar filme:", err);
      // Extrai a mensagem de erro do backend para exibir no frontend
      const backendError = err.response?.data?.error || 'Erro de conexão com o servidor.';
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={addMovieTheme}>
      <Dialog open={open} onClose={onClose} PaperProps={{ component: 'form', onSubmit: handleSubmit }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Adicionar Filme</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            {error && <Typography color="error" variant="body2" sx={{ textAlign: 'center' }}>{error}</Typography>}
            <TextField name="titulo" label="Título" type="text" fullWidth variant="outlined" onChange={handleChange} margin="dense" autoFocus required InputProps={{ startAdornment: (<InputAdornment position="start"><MovieIcon sx={{ color: '#999999' }} /></InputAdornment>) }} />
            <TextField name="ano" label="Ano" type="number" fullWidth variant="outlined" onChange={handleChange} margin="dense" required InputProps={{ startAdornment: (<InputAdornment position="start"><CalendarTodayIcon sx={{ color: '#999999' }} /></InputAdornment>) }} />
            <TextField name="diretor" label="Diretor" type="text" fullWidth variant="outlined" onChange={handleChange} margin="dense" required InputProps={{ startAdornment: (<InputAdornment position="start"><PersonIcon sx={{ color: '#999999' }} /></InputAdornment>) }} />
            <TextField name="genero" label="Gênero" type="text" fullWidth variant="outlined" onChange={handleChange} margin="dense" InputProps={{ startAdornment: (<InputAdornment position="start"><TheatersIcon sx={{ color: '#999999' }} /></InputAdornment>) }} />
            <TextField name="duracao" label="Duração (minutos)" type="number" fullWidth variant="outlined" onChange={handleChange} margin="dense" InputProps={{ startAdornment: (<InputAdornment position="start"><AccessTimeIcon sx={{ color: '#999999' }} /></InputAdornment>) }} />
            <TextField name="sinopse" label="Sinopse" type="text" fullWidth multiline rows={4} variant="outlined" onChange={handleChange} margin="dense" InputProps={{ startAdornment: (<InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}><NotesIcon sx={{ color: '#999999' }} /></InputAdornment>) }} />
            <TextField name="url_poster" label="URL do Pôster" type="text" fullWidth variant="outlined" onChange={handleChange} margin="dense" InputProps={{ startAdornment: (<InputAdornment position="start"><LinkIcon sx={{ color: '#999999' }} /></InputAdornment>) }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, justifyContent: 'space-between' }}>
          <Button onClick={onClose} color="secondary" disabled={loading}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>{loading ? 'Adicionando...' : 'Adicionar'}</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default AddMovieForm;