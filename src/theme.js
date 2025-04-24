//https://mui.com/material-ui/customization/default-theme           Default theme
//https://bareynol.github.io/mui-theme-creator/#BottomNavigation    Try styles here (MUI V4, migth not work exactly like V5)

//XML to JSON to JS script from paletton.com

import { createTheme } from '@mui/material/styles';
import { enUS, esES, frFR, deDE, itIT, jaJP, zhCN  } from '@mui/x-data-grid/locales';

const defaultTheme = createTheme();

export default {
            ...esES,
            ...{
                typography: {
                    "fontFamily": "'Montserrat', sans-serif",
                    "fontSize": 14,
                    "fontWeightLight": 300,
                    "fontWeightRegular": 400,
                    "fontWeightMedium": 500
                },
                palette: {
                    ...defaultTheme.palette,
                    primary: {
                        main: '#DF8A0E',
                        light: '#FFBB3B',
                        dark: '#B37800',
                        contrastText: '#FFFFFF',
                    },
                    secondary: {
                        main: '#17263c',
                        light: '#CA75C0',
                        dark: '#672C5F',
                        contrastText: '#FFFFFF',
                    },
                    info: {
                        main: '#0E99DF',
                        light: '#6AC0FF',
                        dark: '#0073AC',
                        contrastText: '#FFFFFF',
                    },
                    success: {
                        main: '#4CAF50',
                        light: '#80E27E',
                        dark: '#087F23',
                        contrastText: '#FFFFFF',
                    },
                    error: {
                        main: '#F44336',
                        light: '#FF7961',
                        dark: '#BA000D',
                        contrastText: '#FFFFFF',
                    },
                    warning: {
                        main: '#FF9800',
                        light: '#FFC947',
                        dark: '#C66900',
                        contrastText: '#000000',
                    },
                    neutral: {
                        main: '#FFFFFF',
                        light: '#F5F5F5',
                        dark: '#BDBDBD',
                        contrastText: '#000000',
                    },
                },
                components: {
                    MuiDataGrid: {
                      styleOverrides: {
                        columnHeader: {
                          fontWeight: 'bold' // Cambia a 'bold', 700, 600, etc., según prefieras
                        }
                      }
                    }
                  }
            }
        }; 