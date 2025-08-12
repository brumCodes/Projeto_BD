// frontend/src/components/AddMovieForm.jsx

import React, { useState } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

function AddMovieForm({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const filmeParaEnviar = {
      ...formData,
      ano: parseInt(formData.ano),
      duracao: parseInt(formData.duracao) || null
    };
    
    const response = await fetch('http://127.0.0.1:5000/api/filmes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filmeParaEnviar),
    });

    if (response.ok) {
      onSuccess(); // Avisa o Dashboard que o filme foi adicionado
      onClose();   // Fecha o modal
    } else {
      alert("Erro ao adicionar filme.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Adicionar Novo Filme</DialogTitle>
      <DialogContent>
        <TextField name="titulo" label="Título" type="text" fullWidth variant="standard" onChange={handleChange} margin="dense" autoFocus required/>
        <TextField name="ano" label="Ano" type="number" fullWidth variant="standard" onChange={handleChange} margin="dense" required/>
        <TextField name="diretor" label="Diretor" type="text" fullWidth variant="standard" onChange={handleChange} margin="dense" required/>
        <TextField name="genero" label="Gênero" type="text" fullWidth variant="standard" onChange={handleChange} margin="dense" />
        <TextField name="duracao" label="Duração (minutos)" type="number" fullWidth variant="standard" onChange={handleChange} margin="dense" />
        <TextField name="sinopse" label="Sinopse" type="text" fullWidth multiline rows={4} variant="standard" onChange={handleChange} margin="dense" />
        <TextField name="url_poster" label="URL do Pôster" type="text" fullWidth variant="standard" onChange={handleChange} margin="dense" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>Adicionar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddMovieForm;