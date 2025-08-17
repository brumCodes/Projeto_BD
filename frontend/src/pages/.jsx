import React, { useRef, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const Carrossel = ({ children }) => {
  const carrosselRef = useRef(null);
  const [translateValue, setTranslateValue] = useState(0);

  const scroll = (direction) => {
    if (carrosselRef.current) {
      const itemWidth = carrosselRef.current.firstElementChild.offsetWidth;
      const margin = 16; // Margem entre os cards (mr: 2)
      const scrollAmount = itemWidth + margin;

      if (direction === 'left') {
        setTranslateValue((prev) => Math.min(prev + scrollAmount, 0));
      } else {
        const carouselTotalWidth = carrosselRef.current.scrollWidth;
        const visibleWidth = carrosselRef.current.offsetWidth;
        
        const nextTranslate = translateValue - scrollAmount;
        const maxTranslate = visibleWidth - carouselTotalWidth;
        
        // Se a próxima rolagem for além do limite final, 
        // defina o valor para a posição final exata.
        if (nextTranslate <= maxTranslate) {
          setTranslateValue(maxTranslate);
        } else {
          setTranslateValue(nextTranslate);
        }
      }
    }
  };

  const hasEnoughItems = React.Children.count(children) > 4;

  return (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {hasEnoughItems && (
        <IconButton onClick={() => scroll('left')} sx={{ position: 'absolute', top: '40%', left: 0, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.5)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' } }}>
          <NavigateBeforeIcon sx={{ color: 'white' }} />
        </IconButton>
      )}
      <Box
        ref={carrosselRef}
        sx={{
          display: 'flex',
          overflow: 'hidden',
          p: 1,
          flexGrow: 1,
          transition: 'transform 0.45s ease-in-out',
          transform: `translateX(${translateValue}px)`,
        }}
      >
        {children}
      </Box>
      {hasEnoughItems && (
        <IconButton onClick={() => scroll('right')} sx={{ position: 'absolute', top: '40%', right: 0, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.5)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' } }}>
          <NavigateNextIcon sx={{ color: 'white' }} />
        </IconButton>
      )}
    </Box>
  );
};

export default Carrossel;