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
            m2construibles: 0,
            m2vendibles: 0,
            valorTerrenoTotal: 0,
            valorM2construibles: 0,
            valorM2vendibles: 0,
            //Costos Obra
            costoPerProyecto: 0,
            costoPerDirecion: 0,
            costoPerGerenciamiento: 0,
            costoJuridicoContableUS: 0,
            //Comercializacion
            costoPerComisiones: 0,
            costosMarketing: 0,
            costosVarios: 0,
            //Impuestos
            costosPerIVAVentas: 0,  
            costosPerIIBB: 0,
            costosPerSellos: 0,
            costosPerCheques: 0,


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