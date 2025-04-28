import { createSlice } from '../../redux/createSlice.js';
import { MathFunction, MathFunctionsTemplates } from '../../mathFunctions/index.js';
import axios from 'axios';
const { newConstant, newLine } = MathFunctionsTemplates;

const formProyectoInicioSlice = createSlice({
    name: 'parameters',
    initialState: {
        fetching: 0,
        error: null,
        message: null,
        data: {
            title: '',
            duration: 36,
            m2construibles: 2400,
            m2vendibles: 1800,
            valorTerrenoTotal: 900000,
            valorM2construibles: 1100,
            valorM2vendibles: 2800,
            //Costos Obra
            costoPerProyecto: 4,
            costoPerDirecion: 4,
            costoPerGerenciamiento: 4,
            costoJuridicoContableUS: 24000,
            //Comercializacion
            costoPerComisiones: 2,
            costosMarketing: 0,
            costosVarios: 0,
            //Impuestos
            costosPerIVAVentas: 8.1,  
            costosPerIIBB: 0,
            costosPerSellos: 0,
            costosPerCheques: 0,

            costosPerIVAventas: 8.1,

            alicuotaIVATerreno: 0,
            alicuotaIVACostoObra: 10.5,
            alicuotaIVAProyecto: 21,
            alicuotaIVADireccion: 21,
            alicuotaIVAGerenciamiento: 21,
            alicuotaIVAJuridicoContable: 21,
            alicuotaIVAComisiones: 21,
            alicuotaIVAMarketing: 21,
            alicuotaIVAVarios: 21,



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

        setData: create.reducer((state, action) => {
            return { ...state, data: { ...state.data, ...action.payload } };
        }),
    })
});

export const { cleanError, cleanMessage, getData, setData } = formProyectoInicioSlice.actions
export default formProyectoInicioSlice.reducer