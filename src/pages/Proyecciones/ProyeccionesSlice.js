import { createSlice } from '../../redux/createSlice.js';
import { MathFunction, MathFunctionsTemplates } from '../../mathFunctions/index.js';

const { newConstant, newLine } = MathFunctionsTemplates;

const proyeccionesSlice = createSlice({
    name: 'parameters',
    initialState: {
        fetching: 0,
        error: null,
        message: null,
        data: {
            title: '',
            duration: 36,
            cashflows: [
                { name: 'Terreno', serialized: newLine({ a: 100, b: 200}, { minX: 6, maxX: 16 }).serialize(), unitId: 2, factB: 0.5, IIBB: 0.01, iva: 0.21, color: '#CE4893' },
                { name: 'Construcción', serialized: newConstant({ value: -1400}, { minX: 0, maxX: 23 }).serialize(), unitId: 2, factB: 0.5, IIBB: 0.01, iva: 0.21, color: '#5E4DB2' },
                { name: 'Comercial', serialized: newConstant({ value: -600 }, { minX: 0, maxX: 23 }).serialize(), unitId: 2, factB: 0.5, IIBB: 0.01, iva: 0.21, color: '#FFDE59' },
                { name: 'Venta', serialized: newConstant({ value: 1000 }, { minX: 0, maxX: 30 }).serialize(), unitId: 2, factB: 0.5, IIBB: 0.01, iva: 0.21, color: '#BBEE53' },
            ],
            indexes: [
                { id: 1, name: 'CAC', label: 'CAC', serialized: newConstant({ value: 1000 }, { minX: 0, maxX: 23 }).serialize(), unit: 'CAC' },
                { id: 2, name: 'Dolar Blue', label: 'U$', serialized: newConstant({ value: 1000 }, { minX: 0, maxX: 23 }).serialize(), unit: 'U$' },
                { id: 3, name: 'Precio M2 Homogeneizado', label: 'M2 Hom.', serialized: newConstant({ value: 1000 }, { minX: 0, maxX: 23 }).serialize(), unit: 'm2' },
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

        setData: create.reducer((state, action) =>{({ ...state, data: { ...state.data, ...action.payload } })}),
    })
});

export const { cleanError, cleanMessage, getData, setData } = proyeccionesSlice.actions
export default proyeccionesSlice.reducer