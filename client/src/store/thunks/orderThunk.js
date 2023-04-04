import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiSecure } from '../../axios/axios.interceptor';
import { getErrorType, getErrorText } from '../../utils';
import { ORDER_STATUS } from '../../constants';

//#region Order
export const fetchOrders = createAsyncThunk('order/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await apiSecure.get('/orders');
    return response.data.orders;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const addOrder = createAsyncThunk('order/addOrder', async (order, thunkAPI) => {
  try {
    const response = await apiSecure.post('/orders', { order });
    return { ...response.data };
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const deleteOrder = createAsyncThunk('order/deleteOrder', async (id, thunkAPI) => {
  try {
    await apiSecure.delete(`/orders/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id, message: getErrorText(error), type: getErrorType(error) });
  }
});

export const fetchOrder = createAsyncThunk('order/fetchOrder', async (id, thunkAPI) => {
  try {
    const response = await apiSecure.get(`/orders/${id}`);
    return response.data.order;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const updateOrder = createAsyncThunk('order/updateOrder', async (order, thunkAPI) => {
  try {
    const response = await apiSecure.put(`/orders/${order.id}`, {
      id: order.id,
      order,
    });
    return response.data.order;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const completeOrder = createAsyncThunk('order/completeOrder', async (id, thunkAPI) => {
  try {
    await apiSecure.patch(`/orders/${id}`, { status: ORDER_STATUS.COMPLETED });
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id, message: getErrorText(error), type: getErrorType(error) });
  }
});

export const cancelOrder = createAsyncThunk('order/cancelOrder', async (id, thunkAPI) => {
  try {
    await apiSecure.patch(`/orders/${id}`, { status: ORDER_STATUS.CANCELED });
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id, message: getErrorText(error), type: getErrorType(error) });
  }
});

export const rateOrder = createAsyncThunk('order/rateOrder', async ({ id, rating }, thunkAPI) => {
  try {
    await apiSecure.patch(`/orders/${id}`, { rating });
    return { id, rating };
  } catch (error) {
    return thunkAPI.rejectWithValue({ id, message: getErrorText(error), type: getErrorType(error) });
  }
});
//#endregion
