import React from 'react';
import { Card, CardMedia, CardContent, CardActions, IconButton, Typography, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import addLista from '/images/simbolo-mais.png';
import verInfo from '/images/listbuttom.png';
import olhoIcon from '/images/icondeolho.png';

function MovieCard({ filme, onToggleLista }) {
  const navigate = useNavigate();

  return (
    <Card
      className="dashboard-card"
      sx={{
        backgroundColor: '#303540',
        color: 'white',
        minWidth: '150px',
        mr: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardMedia
        className="dashboard-card-media"
        component="img"
        image={filme.url_poster}
        title={filme.titulo}
      />
      <CardContent sx={{ padding: '8px', minHeight: '50px', marginLeft: '4px', marginTop: '6px', paddingTop: '4px', paddingBottom: '8px', flexGrow: 1 }}>
        <Typography
          gutterBottom
          variant="h5"
          component="div"
          className="dashboard-card-title"
          sx={{
            fontSize: '1.06rem',
            fontWeight: '400',
            height: '2.5rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginTop: '2px'
          }}
        >
          {filme.titulo}
        </Typography>
      </CardContent>
      <CardActions
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingTop: '13px',
          paddingBottom: '28px',
          paddingLeft: '8px',
          paddingRight: '8px',
          height: '20px',
          marginTop: 'auto'
        }}
      >
        <Tooltip title={filme.desejo_ver ? "Remover da Watchlist" : "Adicionar à Watchlist"} arrow>
          <IconButton sx={{ padding: 0, mx: 0.5 }} onClick={() => onToggleLista(filme.id_filme, 'Desejo Ver')}>
            <img
              src={addLista}
              alt="Adicionar à lista"
              style={{
                width: '28px',
                height: '28px',
                filter: filme.desejo_ver ? 'opacity(0.4)' : 'none'
              }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title={filme.visto ? "Remover de 'Vistos'" : "Marcar como visto"} arrow>
          <IconButton sx={{ padding: 0, mx: 0.5 }} onClick={() => onToggleLista(filme.id_filme, 'Vistos')}>
            <img
              src={olhoIcon}
              alt="Visto"
              style={{ 
                width: '37px', 
                height: '37px', 
                filter: filme.visto ? "invert(45%) sepia(85%) saturate(500%) hue-rotate(90deg)" : "none" 
              }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ver detalhes" arrow>
          <IconButton sx={{ padding: 0, mx: 0.5 }} onClick={() => navigate(`/filme/${filme.id_filme}`)}>
            <img
              src={verInfo}
              alt="Ver Detalhes"
              style={{ width: '36px', height: '36px' }}
            />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

export default MovieCard;