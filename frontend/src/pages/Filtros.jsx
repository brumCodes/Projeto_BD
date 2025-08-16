import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Box, Typography, IconButton, InputAdornment
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const generos = ["Ação", "Comédia", "Drama", "Ficção Científica", "Terror", "Animação", "Romance", "Aventura", "Suspense", "Musical"];

function Filtros({ open, onClose, onApply, filtrosAtivos }) {
  const [ano, setAno] = useState(filtrosAtivos.ano || "");
  const [genero, setGenero] = useState(filtrosAtivos.genero || "");

  useEffect(() => {
    setAno(filtrosAtivos.ano || "");
    setGenero(filtrosAtivos.genero || "");
  }, [filtrosAtivos]);

  const aplicarFiltros = () => {
    onApply({ ano, genero });
    onClose();
  };

  const limparFiltros = () => {
    setAno("");
    setGenero("");
    onApply({});
    onClose();
  };

  const handleIncrementAno = () => {
    setAno(prevAno => (parseInt(prevAno) || 0) + 1);
  };

  const handleDecrementAno = () => {
    setAno(prevAno => (parseInt(prevAno) > 0 ? (parseInt(prevAno) - 1) : 0));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="xs"
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          bgcolor: '#2C2C2C',
          color: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: '600' }}>
          Filtros de Busca
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ border: 'none', padding: '24px' }}>
        <Box display="flex" flexDirection="column" gap={3}>
          <TextField
            label="Ano"
            type="number"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            fullWidth
            variant="filled"
            InputLabelProps={{
              sx: {
                color: '#E0E0E0',
                '&.Mui-focused': {
                  color: '#5ae979ff',
                },
              },
            }}
            InputProps={{
              sx: { 
                bgcolor: '#383838', 
                color: 'white', 
                borderRadius: '8px',
                '&:hover': { bgcolor: '#454545' },
                '&.Mui-focused': { bgcolor: '#454545' },
                

                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                  '-webkit-appearance': 'none',
                  margin: 0
                }
              },
              disableUnderline: true,
              
              endAdornment: (
                <InputAdornment position="end">
                  <Box display="flex" flexDirection="column" sx={{ color: '#E0E0E0' }}>
                    <IconButton onClick={handleIncrementAno} size="small" sx={{ p: 0, mb: -0.5, color: 'inherit' }}>
                      <ArrowDropUpIcon />
                    </IconButton>
                    <IconButton onClick={handleDecrementAno} size="small" sx={{ p: 0, mt: -0.5, color: 'inherit' }}>
                      <ArrowDropDownIcon />
                    </IconButton>
                  </Box>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiFilledInput-root:after': {
                borderColor: '#A0FFB4',
              },
            }}
          />
          <TextField
            label="Gênero"
            select
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            fullWidth
            variant="filled"
            InputLabelProps={{
              sx: {
                color: '#E0E0E0',
                '&.Mui-focused': {
                  color: '#5ae979ff',
                },
              },
            }}
            InputProps={{ 
              sx: { 
                bgcolor: '#383838',
                color: 'white', 
                borderRadius: '8px',
                '&:hover': { bgcolor: '#454545' },
                '&.Mui-focused': { bgcolor: '#454545' },
              },
              disableUnderline: true 
            }}
            SelectProps={{
              MenuProps: { PaperProps: { sx: { bgcolor: '#383838', color: 'white', borderRadius: '8px' } } },
            }}
            sx={{
              '& .MuiSelect-icon': { color: 'white' },
              '& .MuiFilledInput-root:after': {
                borderColor: '#5ae979ff',
              },
            }}
          >
            <MenuItem value="" sx={{ color: '#E0E0E0' }}>
              <em>Nenhum</em>
            </MenuItem>
            {generos.map((g) => (
              <MenuItem key={g} value={g} sx={{ color: 'white', '&:hover': { bgcolor: '#555' } }}>{g}</MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #444' }}>
        <Button onClick={limparFiltros} sx={{ color: '#E0E0E0' }}>
          Limpar Filtros
        </Button>
        <Box>
          <Button onClick={onClose} sx={{ color: '#E0E0E0', mr: 1 }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={aplicarFiltros} sx={{ bgcolor: '#5ae979ff', color: 'black', '&:hover': { bgcolor: '#61df7aff' } }}>
            Aplicar
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default Filtros;