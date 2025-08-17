import React from 'react';
import { Card, CardMedia, CardContent, CardActions, IconButton, Typography, Tooltip } from '@mui/material';
import olhoIcon from '/images/icondeolho.png';
import verInfo from '/images/listbuttom.png';

function MovieCard({ filme, onToggleWatchlist, onToggleWatched, onVerDetalhes }) {
  const isWatched = filme.visto;
  const isOnWatchlist = filme.desejo_ver;

  return (
    <Card
      className="dashboard-card"
      sx={{
        backgroundColor: '#303540',
        color: 'white',
        minWidth: '160px',
        mr: 2,
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
      <CardContent
        sx={{
          padding: '5px',
          marginLeft: '8px',
          marginTop: '3px',
          flexGrow: 1,
        }}
      >
        <Typography
          gutterBottom
          variant="h5"
          component="div"
          className="dashboard-card-title"
          sx={{
            fontSize: '1.06rem',
            fontWeight: '400',
            height: '2.3rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginTop: '3px',
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
          paddingTop: '4px',
          paddingBottom: '18px',
          paddingLeft: '8px',
          paddingRight: '8px',
          height: '25px',
        }}
      >
        <Tooltip title={isOnWatchlist ? "Remover da Watchlist" : "Adicionar à Watchlist"} arrow>
          <IconButton sx={{ padding: 0, mx: 0.5 }} onClick={() => onToggleWatchlist(filme.id_filme, !isOnWatchlist)}>
            <img
              src="/images/simbolo-mais.png"
              alt="Adicionar à lista"
              style={{ 
                width: '31px', 
                height: '31px', 
                filter: isOnWatchlist ? 'opacity(0.4)' : 'none' 
              }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title={isWatched ? "Remover de 'Vistos'" : "Marcar como visto"} arrow>
          <IconButton sx={{ padding: 0, mx: 0.5 }} onClick={() => onToggleWatched(filme.id_filme, !isWatched)}>
            <img
              src={olhoIcon}
              alt="Visto"
              style={{ width: '40px', height: '40px', filter: isWatched ? "invert(45%) sepia(85%) saturate(500%) hue-rotate(90deg)" : "none" }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="Ver detalhes" arrow>
          <IconButton sx={{ padding: 0, mx: 0.5 }} onClick={() => onVerDetalhes(filme)}>
            <img
              src={verInfo}
              alt="Ver Detalhes"
              style={{ width: '40px', height: '40px' }}
            />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

export default MovieCard;