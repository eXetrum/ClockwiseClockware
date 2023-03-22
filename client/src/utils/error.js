import CloudOffIcon from '@mui/icons-material/CloudOff';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import { ERROR_TYPE } from '../constants';

export const getErrorType = (error) => {
  if (error === null) return ERROR_TYPE.NONE;
  if (error?.code === 'ERR_NETWORK') return ERROR_TYPE.SERVICE_OFFLINE;
  if (error?.code !== 'ERR_BAD_REQUEST') return ERROR_TYPE.UNKNOWN;
  if (error?.response?.status === 403) return ERROR_TYPE.ACCESS_DENIED;
  if (error?.response?.status === 404) return ERROR_TYPE.ENTRY_NOT_FOUND;
  if (error?.response?.status === 400) return ERROR_TYPE.BAD_REQUEST;

  return ERROR_TYPE.UNKNOWN;
};

export const getErrorText = (error) =>
  error?.response?.data?.detail?.toString() ||
  error?.response?.data?.message?.toString() ||
  error?.response?.statusText ||
  error?.message ||
  error?.toString();

export const getIconByErrorType = (errorType) => {
  if (errorType === ERROR_TYPE.SERVICE_OFFLINE) return <CloudOffIcon fontSize="large" />;
  if (errorType === ERROR_TYPE.ACCESS_DENIED) return <BlockOutlinedIcon fontSize="large" />;
  if (errorType === ERROR_TYPE.ENTRY_NOT_FOUND) return <ErrorOutlineOutlinedIcon fontSize="large" />;
  if (errorType === ERROR_TYPE.BAD_REQUEST) return <SyncProblemIcon fontSize="large" />;
  return null;
};

export const getIconByError = (error) => {
  if (error?.code === 'ERR_NETWORK') if (error?.code !== 'ERR_BAD_REQUEST') return null;
  if (error?.response?.status === 403) return <BlockOutlinedIcon fontSize="large" />;
  if (error?.response?.status === 404) return <ErrorOutlineOutlinedIcon fontSize="large" />;
  if (error?.response?.status === 400) return <SyncProblemIcon fontSize="large" />;
  return null;
};

// Returns true for, network error, and status code 404, 403, 400
export const isGlobalError = (error, exclude = []) => {
  const statusCodes = [400, 403, 404].filter((code) => !exclude.includes(code));
  return error?.code === 'ERR_NETWORK' || (error?.code === 'ERR_BAD_REQUEST' && statusCodes.includes(error?.response?.status));
};

export const isGlobalErrorType = (errorType, exclude = []) =>
  [ERROR_TYPE.SERVICE_OFFLINE, ERROR_TYPE.ACCESS_DENIED, ERROR_TYPE.ENTRY_NOT_FOUND, ERROR_TYPE.BAD_REQUEST]
    .filter((item) => !exclude.includes(item))
    .includes(errorType);

//export { getErrorType, getIconByError, getErrorText, isGlobalError };
