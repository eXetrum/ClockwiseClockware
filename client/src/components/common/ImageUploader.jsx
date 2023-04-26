import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

import './ImageUploader.css';

import { useDispatch, useSelector } from 'react-redux';
import { changeNewOrderField } from '../../store/actions';
import { selectNewOrder } from '../../store/selectors';

import { ACCEPTED_IMAGE_TYPES, MAX_IMAGES_COUNT, MAX_IMAGE_BYTES_SIZE } from '../../constants';

const handleFileChosen = async file => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = reject;
    fileReader.readAsDataURL(file);
  });
};

const ImageUploader = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const newOrder = useSelector(selectNewOrder);

  const onImageDrop = useCallback(
    async (acceptedFiles, fileRejections) => {
      fileRejections.forEach(file => {
        file.errors.forEach(err => {
          if (err.code === 'file-too-large') {
            enqueueSnackbar(`Warning: ${file.file.name} ${err.message} (Skip)`, { variant: 'warning' });
          }

          if (err.code === 'file-invalid-type') {
            enqueueSnackbar(`Warning: ${file.file.name} ${err.message} (Skip)`, { variant: 'warning' });
          }
        });
      });

      if (!acceptedFiles) return;
      const prevImages = [...newOrder.images];
      const selected = [...acceptedFiles.slice(0, MAX_IMAGES_COUNT - prevImages.length)];

      const results = await Promise.all(
        selected.map(async file => {
          const base64Content = await handleFileChosen(file);
          return { name: file.name, url: base64Content };
        }),
      );

      results.forEach(file => prevImages.unshift(file));

      dispatch(changeNewOrderField({ name: 'images', value: prevImages }));
    },
    [enqueueSnackbar, dispatch, newOrder],
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: ACCEPTED_IMAGE_TYPES,
    //maxFiles: MAX_IMAGES_COUNT,
    maxSize: MAX_IMAGE_BYTES_SIZE,
    multiple: true,
    onDrop: onImageDrop,
  });

  const onRemoveImage = useCallback(
    index => {
      const images = [...newOrder.images];
      images.splice(index, 1);
      dispatch(changeNewOrderField({ name: 'images', value: images }));
    },
    [newOrder, dispatch],
  );

  return (
    <>
      {newOrder.images.length < MAX_IMAGES_COUNT ? (
        <div className="dropzone-container">
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <span>Drop some files here ...</span>
          </div>
        </div>
      ) : null}
      <ImageList sx={{ padding: 0 }} cols={MAX_IMAGES_COUNT} variant="quilted">
        {newOrder.images.map((item, index) => {
          return (
            <ImageListItem
              id={index}
              key={index}
              sx={{ width: 110, height: 110, border: 'solid 1px #ccc', borderRadius: '8px' }}
              className="mt-3"
            >
              <img src={`${item.url}`} srcSet={`${item.url}`} alt={item.name} style={{ borderRadius: '7px', padding: '0' }} />
              <ImageListItemBar
                title={item.name}
                subtitle={item.author}
                style={{ borderRadius: '0 0 7px 7px', padding: '0' }}
                actionIcon={
                  <IconButton
                    sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                    aria-label={`info about ${item.name}`}
                    onClick={() => onRemoveImage(index)}
                  >
                    <CancelOutlinedIcon />
                  </IconButton>
                }
              />
            </ImageListItem>
          );
        })}
      </ImageList>
    </>
  );
};

export default ImageUploader;
