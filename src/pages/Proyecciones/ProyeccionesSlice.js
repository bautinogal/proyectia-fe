import { createSlice } from '../../redux/createSlice.js';
import { MathFunction, MathFunctionsTemplates } from '../../mathFunctions/index.js';
import axios from 'axios';
const { newConstant, newLine } = MathFunctionsTemplates;
const cacResponse = (await axios.get('https://prestamos.ikiwi.net.ar/api/cacs'))?.data;
const uvaResponse = (await axios.get("https://prestamos.ikiwi.net.ar/api/v1/engine/uva/valores/"))?.data;
const uviResponse = (await axios.get("https://prestamos.ikiwi.net.ar/api/v1/engine/uvi/valores/"))?.data;
// const dolaritoResponse = ''
// await fetch("https://www.dolarito.ar/api/frontend/history", {
//   "headers": {
//     "accept": "application/json, text/plain, */*",
//     "auth-client": "0022200edebd6eaee37427532323d88b",
//     "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
//     "sec-ch-ua-mobile": "?0",
//     "sec-ch-ua-platform": "\"Windows\"",
//     "Referer": "https://www.dolarito.ar/cotizaciones-historicas/informal",
//     "Referrer-Policy": "strict-origin-when-cross-origin"
//   },
//   "body": null,
//   "method": "GET"
// })
async function fetchData() {
    try {
        const response = await fetch("/api/dolarito-history", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "auth-client": "0022200edebd6eaee37427532323d88b",
                "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "Referer": "https://www.dolarito.ar/cotizaciones-historicas/informal",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "method": "GET"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Error al hacer la petición:", error);
    }
}
const dolaritoResponse = fetchData();
const today = new Date(Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
));
const year = today.getUTCFullYear();
const month = String(today.getUTCMonth() + 1).padStart(2, '0'); // Mes en formato 'MM'
const day = String(today.getUTCDate()).padStart(2, '0'); // Día en formato 'DD'
const dataKey = `${day}-${month}-${String(year).slice(2)}`
console.log({ cacResponse, uvaResponse, uviResponse, dolaritoResponse: dolaritoResponse[dataKey], year,month,day })
const proyeccionesSlice = createSlice({
    name: 'parameters',
    initialState: {
        fetching: 0,
        error: null,
        message: null,
        data: {
            duration: 36,
            cashflows: [
                { name: 'Terreno', serialized: newLine({ a: 100, b: 200 }, { minX: 6, maxX: 16 }).serialize(), unitId: 2, factB: 0.5, IIBB: 0.01, iva: 0.21, color: '#CE4893' },
                { name: 'Construcción', serialized: newConstant({ value: -1400 }, { minX: 0, maxX: 23 }).serialize(), unitId: 2, factB: 0.5, IIBB: 0.01, iva: 0.21, color: '#5E4DB2' },
                { name: 'Comercial', serialized: newConstant({ value: -600 }, { minX: 0, maxX: 23 }).serialize(), unitId: 2, factB: 0.5, IIBB: 0.01, iva: 0.21, color: '#FFDE59' },
                { name: 'Venta', serialized: newConstant({ value: 1000 }, { minX: 0, maxX: 30 }).serialize(), unitId: 2, factB: 0.5, IIBB: 0.01, iva: 0.21, color: '#BBEE53' },
            ],
            indexes: [
                { id: 1, name: 'CAC', label: 'CAC', serialized: newConstant({ value: cacResponse[cacResponse?.length - 1]?.general || 1000 }, { minX: 0, maxX: 36 }).serialize(), unitId: 'CAC', color: '#5E4DB2' },
                { id: 2, name: 'Dolar Blue', label: 'U$', serialized: newConstant({ value: dolaritoResponse[dataKey]?.informal?.venta || 1000 }, { minX: 0, maxX: 36 }).serialize(), unitId: 'U$', color: '#BBEE53' },
                { id: 3, name: 'Precio M2 Homogeneizado', label: 'M2 Hom.', serialized: newConstant({ value: 4000 }, { minX: 0, maxX: 36 }).serialize(), unitId: 'm2', color: '#FFDE59' },
                { id: 3, name: 'UVA', label: 'UVA', serialized: newConstant({ value: uvaResponse[0]?.valor }, { minX: 0, maxX: 36 }).serialize(), unitId: 'm2', color: '#FFDE59' },
            ],
        },
    },
    reducers: (create) => ({
        getData: create.asyncThunk(
            async (payload, thunkApi) => thunkApi.getState(),
            {
                pending: (state, action) => ({ ...state, fetching: state.fetching + 1 }),
                rejected: (state, action) => ({ ...state, error: action.error.message, fetching: state.fetching - 1 }),
                fulfilled: (state, action) => ({ ...state, data: action.payload, fetching: state.fetching - 1 }),
            }
        ),
        cleanError: create.reducer((state, action) => ({ ...state, error: null })),
        cleanMessage: create.reducer((state, action) => ({ ...state, message: null })),

        setData: create.reducer((state, action) => ({ ...state, data: { ...state.data, ...action.payload } })),
    })
});

export const { cleanError, cleanMessage, getData, setData } = proyeccionesSlice.actions
export default proyeccionesSlice.reducer