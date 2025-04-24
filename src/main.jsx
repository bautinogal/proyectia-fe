import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "./redux/store.js";
import Pages from './pages/Pages.jsx';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import themeParams from './theme.js';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={createTheme(themeParams)}>
          <CssBaseline />
          <Pages />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);