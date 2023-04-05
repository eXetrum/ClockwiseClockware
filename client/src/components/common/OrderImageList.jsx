import React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

const OrderImageList = ({ images }) => {
  if (images === null || images === undefined || !images.length) return null;

  return (
    <ImageList cols={Math.min(images.length, 3)} sx={{ width: 'auto' }}>
      {images.map((item, index) => {
        return (
          <ImageListItem
            id={index}
            key={index}
            sx={{ width: 340, height: 340, border: 'solid 1px #ccc', borderRadius: '8px' }}
            className="mt-3"
          >
            <img src={`${item.url}`} srcSet={`${item.url}`} alt={item.name} style={{ borderRadius: '7px', padding: '0' }} />
          </ImageListItem>
        );
      })}
    </ImageList>
  );
};

export default OrderImageList;
