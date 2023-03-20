import CloudOffIcon from '@mui/icons-material/CloudOff';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';

const getIconByError = (error) => {
  if (error?.code === 'ERR_NETWORK') return <CloudOffIcon fontSize="large" />;
  if (error?.code !== 'ERR_BAD_REQUEST') return null;
  if (error?.response?.status === 403) return <BlockOutlinedIcon fontSize="large" />;
  if (error?.response?.status === 404) return <ErrorOutlineOutlinedIcon fontSize="large" />;
  if (error?.response?.status === 400) return <SyncProblemIcon fontSize="large" />;
  return null;
};

// Returns true for, network error, and status code 404, 403, 400
const isGlobalError = (error) => {
  return (
    error?.code === 'ERR_NETWORK' ||
    (error?.code === 'ERR_BAD_REQUEST' &&
      (error?.response?.status === 404 || error?.response?.status === 403 || error?.response?.status === 400))
  );
};

const getErrorText = (error) =>
  error?.response?.data?.detail?.toString() ||
  error?.response?.data?.message?.toString() ||
  error?.response?.statusText ||
  error?.message ||
  error?.toString();

export { getIconByError, getErrorText, isGlobalError };
