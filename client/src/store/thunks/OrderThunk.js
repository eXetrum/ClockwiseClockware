import { createAsyncThunk } from '@reduxjs/toolkit';
import { getOrders, createOrder, deleteOrderById, getOrderById, updateOrderById, patchOrderById } from '../../api';
import { getErrorType, getErrorText } from '../../utils';
import { ORDER_STATUS } from '../../constants';

//#region Order
export const fetchOrders = createAsyncThunk('order/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await getOrders();
    return response.data.orders;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const addOrder = createAsyncThunk('order/addOrder', async (order, thunkAPI) => {
  try {
    const response = await createOrder({ order });
    return { ...response.data };
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const deleteOrder = createAsyncThunk('order/deleteOrder', async (id, thunkAPI) => {
  try {
    await deleteOrderById({ id });
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id, message: getErrorText(error), type: getErrorType(error) });
  }
});

export const fetchOrder = createAsyncThunk('order/fetchOrder', async (id, thunkAPI) => {
  try {
    const response = await getOrderById({ id });
    return response.data.order;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const updateOrder = createAsyncThunk('order/updateOrder', async (order, thunkAPI) => {
  try {
    await updateOrderById({
      id: order.id,
      order: {
        watchId: order?.watch?.id,
        cityId: order?.city.id,
        masterId: order?.master.id,
        startDate: order?.startDate,
      },
    });
    return order;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const completeOrder = createAsyncThunk('order/completeOrder', async (id, thunkAPI) => {
  try {
    await patchOrderById({ id, status: ORDER_STATUS.COMPLETED });
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id, message: getErrorText(error), type: getErrorType(error) });
  }
});

export const cancelOrder = createAsyncThunk('order/cancelOrder', async (id, thunkAPI) => {
  try {
    await patchOrderById({ id, status: ORDER_STATUS.CANCELED });
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id, message: getErrorText(error), type: getErrorType(error) });
  }
});

export const rateOrder = createAsyncThunk('order/rateOrder', async ({ id, rating }, thunkAPI) => {
  try {
    await patchOrderById({ id, rating });
    return { id, rating };
  } catch (error) {
    return thunkAPI.rejectWithValue({ id, message: getErrorText(error), type: getErrorType(error) });
  }
});
//#endregion
