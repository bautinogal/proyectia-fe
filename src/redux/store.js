import { configureStore } from '@reduxjs/toolkit';
import ProyeccionesSlice from '../pages/Proyecciones/ProyeccionesSlice';

export const store = configureStore({
  reducer: {
    proyecciones: ProyeccionesSlice,
  },
});

export default store;
