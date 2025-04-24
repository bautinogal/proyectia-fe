import { configureStore } from '@reduxjs/toolkit';
import ProyeccionesSlice from '../pages/Proyecciones/ProyeccionesSlice';
import FormInicioProyecto from '../pages/FormInicioProyecto/FormInicioProyectoSlice';
export const store = configureStore({
  reducer: {
    proyecciones: ProyeccionesSlice,
    formInicioProyecto: FormInicioProyecto,
  },
});

export default store;
