import { createAsyncThunk } from '@reduxjs/toolkit';
import { getWatches } from '../../api';
import { getErrorType, getErrorText } from '../../utils';

//#region Watch
export const fetchWatches = createAsyncThunk('watch/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await getWatches();
    return response.data.watches;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});
//#endregion
