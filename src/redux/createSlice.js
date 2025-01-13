import { buildCreateSlice, asyncThunkCreator } from '@reduxjs/toolkit'

export const createSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
})