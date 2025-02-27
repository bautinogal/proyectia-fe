import React, { memo, useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import './Proyecciones.css';
import { cleanError, cleanMessage, getData, setData } from './ProyeccionesSlice';

import { ResponsiveChartContainer, LineChart, LinePlot, ChartsXAxis, ChartsYAxis, ChartsTooltip, MarkPlot, ChartsGrid, ChartsReferenceLine, AreaPlot, BarChart, BarPlot } from "@mui/x-charts";

import {
    Accordion, AccordionActions, AccordionSummary, AccordionDetails, AppBar, Box, Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid2,
    IconButton, InputLabel, List, ListItem,Menu, MenuItem, Select, Slider, TextField, Toolbar, Typography, InputAdornment, Paper, Icon
} from '@mui/material';

import { ChromePicker } from 'react-color';
import { Add, Build, Circle, Delete, Download, Edit, ExpandMore, ColorLens, Colorize } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';

import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';

import { MathFunction, MathFunctionsTemplates } from "../../mathFunctions/index.js";

import { styled } from '@mui/material/styles';
import SvgIcon from '@mui/material/SvgIcon';
import theme from "../../theme.js"
const CustomFunctionSvgIcon = (props) => {
    const StyledIcon = styled(SvgIcon)(({ theme }) => ({ color: theme.palette.primary.main, fontSize: '2rem' }));

    const points = Array(50).fill(0).map((_, i) => ({ x: i * 2, y: 100 - props.func(i / 50) * 100 }));

    let d = points.reduce((p, x, i) => p + ` L ${points[i].x},${points[i].y}`, `M ${points[0].x},${points[0].y}`)

    return (<StyledIcon viewBox="0 -4 100 108">
        <path d={d} fill="none" stroke="#0078D7" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </StyledIcon>);
};
const formatNumber = (value) => {
    // Permitir dígitos, coma, y el signo negativo
    let validInput = value.toString().replace(/[^0-9,.-]/g, "");

    // Asegurarse de que el signo negativo esté al inicio, si existe
    if (validInput.includes("-") && validInput.indexOf("-") !== 0) {
        validInput = validInput.replace("-", ""); // Eliminar signos negativos mal colocados
    }

    const parts = validInput.split(",");
    const integerPart = parts[0].replace(/\./g, ""); // Eliminar todos los puntos existentes
    const decimalPart = parts[1];

    // Formatear la parte entera con separación de miles
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Limitar los dígitos después de la coma a 2
    const formattedDecimalPart = decimalPart?.substring(0, 2);

    // Reconstruir el valor formateado
    const formattedValue = formattedDecimalPart
        ? `${formattedIntegerPart},${formattedDecimalPart}`
        : formattedIntegerPart;

    // Reconstruir el validInput sin puntos y con un punto como separador decimal
    const cleanValidInput = decimalPart
        ? `${integerPart}.${decimalPart.substring(0, 2)}`
        : integerPart;

    return { formattedValue, validInput: cleanValidInput };
};

function Proyecciones() {

    const dispatch = useDispatch();

    const Parameters = () => {

        const Header = () => <div style={{ width: "100%", height: "5vh" }}>
            <Grid2 container spacing={0} justifyContent='flex-end' sx={{ mr: '2rem' }}>
                <Grid2 size={1}>
                    <IconButton size="large" children={<Add />} color="success" />
                </Grid2>
            </Grid2>
        </div>;

        const General = () => {
            const schema = {
                type: 'object',
                required: ['title'],
                properties: {
                    title: { type: 'string', title: 'Nombre', default: 'Nombre del Proyecto' },
                    duration: { type: 'number', title: 'Duración', default: 36 },
                    // estTotalM2: { type: 'number', title: 'M2 Totales', default: 1000 },
                    // estSellableM2: { type: 'number', title: 'M2 Vendibles', default: 800 },
                    // estParkingLots: { type: 'number', title: 'Cocheras', default: 8 },
                    // estStorageUnits: { type: 'number', title: 'Bauleras', default: 20 },
                },
            };

            const onChange = (e) => dispatch(setData(e.formData));
            const onError = (e) => console.log('errors');

            return (<ListItem><Accordion >
                <AccordionSummary expandIcon={<ExpandMore />} children={<Typography children={'General'} fontWeight={600} />} />
                <AccordionDetails>
                    <Form schema={schema} validator={validator} onChange={onChange} onError={onError}>
                        {''}
                    </Form>
                </AccordionDetails>
            </Accordion>
            </ListItem>
            )
        };

        const Cashflows = () => {

            const { duration, cashflows, indexes } = useSelector(state => state.proyecciones?.data);

            const getIndex = (id) => indexes.find(x => x.id === id);

            const AccordionHeader = ({ cf }) => {
                const ColorPicker = () => {
                    const [color, setColor] = useState(cf.color); // Color seleccionado
                    const [open, setOpen] = useState(false); // Estado del diálogo

                    // Maneja el cambio de color
                    const handleColorChange = (newColor) => setColor(newColor.hex);

                    return (
                        <div style={{}}>
                            {/* Botón para abrir el color picker */}
                            <IconButton size="small" onClick={(e) => (e.stopPropagation(), setOpen(true))} style={{ color: '#606060', height: '1rem', width: '1rem' }}>
                                <Edit />
                            </IconButton>

                            {/* Diálogo con el color picker */}
                            <Dialog open={open} onClose={(e) => (e.stopPropagation(), setOpen(false))} id='color-picker-dialog'>
                                <DialogTitle>

                                    {cf.name}
                                </DialogTitle>
                                <DialogContent>
                                    <ChromePicker color={color} onChange={handleColorChange} />
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={(e) => (e.stopPropagation(), setOpen(false))} color="primary">
                                        Guardar
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </div>
                    );
                };

                return <Grid2 container spacing={0} sx={{ width: '100%', padding: 0, margin: 0 }}>
                    <Grid2 size={11}>
                        <Box display="flex" alignItems="center">
                            <Circle sx={{ height: '0.5rem' }} style={{ color: cf.color }} />
                            <Typography children={cf.name} fontWeight={600} />
                        </Box>
                    </Grid2>
                    <Grid2 size={1} >
                        <ColorPicker />
                    </Grid2>
                </Grid2 >

            };

            const ConfiguracionCurva = ({ cf, i }) => {

                const duration = useSelector(state => state.proyecciones?.data?.duration);

                const TipoCurva = () => {

                    const { newConstant, newLine, newSmoothStep, newSmoothStepBell, newDiscrete, newInstallmentRevenue } = MathFunctionsTemplates;
                    const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;

                    const constant = newConstant({ value: 0.5 });
                    const line = newLine({ a: 0.5, b: 0.25 });
                    const smoothStep = newSmoothStep();
                    const smoothStepBell = newSmoothStepBell({ y1: 0.9 });
                    const installmentRevenue = newInstallmentRevenue({});
                    const discrete = newDiscrete({ points: [{ x: 0.2, y: 0.5 }, { x: 0.5, y: 0.9 }, { x: 0.8, y: 0.7 }], tolerance: 0.01, defaultVal: -1 });
                    const multi = new MathFunction({
                        childs: [
                            newLine({ a: 0.1, b: 0.45 }, { minX: 0.5, underflowVal: 0 }).serialize(),
                            newSmoothStep({}, { maxX: 0.5, overflowVal: 0 }).serialize()
                        ], exp: '0'
                    });
                    const custom = new MathFunction({ exp: '0.7* (pow((x*3-1.2),3)-pow(x*3-1.2,2)-(x*3-1.2)+1.2)' });

                    const handleChange = (e) => {
                        const type = e.target.value;
                        let serialized;
                        switch (type) {
                            case 'Constant':
                                serialized = newConstant({ value: 1000 }, { minX: 0, maxX: 23 }).serialize();
                                break;
                            case 'Line':
                                serialized = newLine({ a: 500, b: 100 }, { minX: 0, maxX: 23 }).serialize();
                                break;
                            case 'Smoothstep':
                                serialized = newSmoothStep({ x0: 0, x1: 23, y0: 0, y1: 1000, N: 1 }, { minX: 0, maxX: 23 }).serialize();
                                break;
                            case 'SmoothStepBell':
                                serialized = newSmoothStepBell({ y1: 0.9 }, { minX: 0, maxX: 23 }).serialize();
                                break;
                            case 'InstallmentRevenue':
                                serialized = newInstallmentRevenue({ initialX: 0, totalUnits: 2400, unitsPerSale: 300, salesStepSize: 1, pricePerUnit: 1, installments: 24, minX: 0, maxX: 36 }, { minX: 0, maxX: 23 }).serialize();
                                break;
                            case 'Discrete':
                                serialized = newDiscrete({ points: [{ x: 0.2, y: 0.5 }, { x: 0.5, y: 0.9 }, { x: 0.8, y: 0.7 }], tolerance: 0.01, defaultVal: -1 }).serialize();
                                break;
                            case 'Multi':
                                serialized = new MathFunction([newLine({ a: 0.1, b: 0.45 }, { minX: 0.5, underflowVal: 0 }).serialize(), newSmoothStep({}, { maxX: 0.5, overflowVal: 0 }).serialize()]).serialize();
                                break;
                            case 'Custom':
                                serialized = new MathFunction({ exp: '500 * x - 5000', minX: 0, maxX: 23, meta: { label: 'Custom' } }).serialize();
                                break;
                            default:
                                throw new Error('Invalid curve type');
                        }

                        dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized } : x) }));

                    };

                    const CurveType = ({ value, func, label }) => <div style={{ display: 'inline-flex' }}>
                        <CustomFunctionSvgIcon func={func.evaluate} />
                        <Typography variant="inherit" noWrap children={label} sx={{ paddingLeft: '1rem', alignContent: 'center' }} />
                    </div>

                    return <FormControl fullWidth>
                        <InputLabel>Tipo Curva</InputLabel>
                        <Select value={meta?.label} label="Tipo Curva" onChange={handleChange}>
                            <MenuItem value={'Constant'} children={<CurveType value={'Constant'} func={constant} label={'Constante'} />} />
                            <MenuItem value={'Line'} children={<CurveType value={'Line'} func={line} label={'Recta'} />} />
                            <MenuItem value={'Smoothstep'} children={<CurveType value={'Smoothstep'} func={smoothStep} label={'Suavizado'} />} />
                            <MenuItem value={'SmoothStepBell'} children={<CurveType value={'SmoothStepBell'} func={smoothStepBell} label={'Campana'} />} />
                            <MenuItem value={'InstallmentRevenue'} children={<CurveType value={'InstallmentRevenue'} func={installmentRevenue} label={'Sumatoria Cuotas'} />} />
                            <MenuItem value={'Discrete'} disabled children={<CurveType value={'Discrete'} func={discrete} label={'Discreta'} />} />
                            <MenuItem value={'Multi'} disabled children={<CurveType value={'Multi'} func={multi} label={'Compuesta'} />} />
                            <MenuItem value={'Custom'} children={<CurveType value={'Custom'} func={custom} label={'Custom'} />} />
                        </Select>
                    </FormControl>
                };

                const ParametrosCurva = () => {

                    const DisplayTotal = () => {
                        const func = new MathFunction(cf?.serialized);
                        const minX = func.getMinX();
                        const maxX = func.getMaxX();
                        const total = Array(maxX - minX + 1).fill().reduce((p, x, i) => p + func.evaluate(minX + i), 0).toFixed(2).replace('.', ',');
                        return <Typography noWrap children={`Total: ${getIndex(cf?.unitId)?.label} ${total}`} sx={{ alignItems: 'end', alignContent: 'end', textAlign: 'end', paddingTop: '1rem', fontWeight: 550 }} />;
                    };

                    const ParametrosConstante = () => {

                        const SliderPeriodo = () => {
                            const minDistance = 1;

                            const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;
                            const [sliderVal, setSliderVal] = useState([minX, maxX]);

                            const valueLabelFormat = (value) => `Mes ${value}`;
                            const handleChange = (event, newValue, activeThumb) => {
                                let rango;
                                if (newValue[1] - newValue[0] < minDistance) {
                                    if (activeThumb === 0) {
                                        const clamped = Math.min(newValue[0], duration - minDistance);
                                        rango = [clamped, clamped + minDistance];
                                    } else {
                                        const clamped = Math.max(newValue[1], minDistance);
                                        rango = [clamped - minDistance, clamped];
                                    }
                                } else {
                                    rango = newValue;
                                }
                                setSliderVal(rango);
                            };

                            const handleCommit = (event, newValue, activeThumb) => {
                                dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized: { ...x.serialized, minX: sliderVal[0], maxX: sliderVal[1] } } : x) }));
                            };

                            const marks = [
                                { value: 0, label: 'Mes 0' },
                                { value: duration - 1, label: 'Mes ' + (duration - 1) }
                            ];

                            return <Box style={{ display: 'inline-flex', paddingTop: '1rem', paddingLeft: '0.5rem', paddingRight: '1rem' }} sx={{ width: '100%' }}>
                                <Typography variant="inherit" noWrap sx={{ width: '7rem', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'start' }}>
                                    Período <br /> {`[${minX}, ${maxX}]`}
                                </Typography>
                                <Slider
                                    marks={marks}
                                    min={0}
                                    max={duration - 1}
                                    value={sliderVal}
                                    onChangeCommitted={handleCommit}
                                    onChange={handleChange}
                                    valueLabelDisplay="auto"
                                    disableSwap
                                    getAriaValueText={valueLabelFormat}
                                    valueLabelFormat={valueLabelFormat}
                                />
                            </Box>
                        };

                        const ValorInput = () => {

                            const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;

                            const val = parseFloat(exp);
                            const [displayedValue, setDisplayedValue] = useState(formatNumber(val).formattedValue);

                            const handleChange = (event) => {
                                let inputValue = event.target.value;
                                const { formattedValue, validInput } = formatNumber(inputValue);
                                setDisplayedValue(formattedValue);
                                //dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized: { ...x.serialized, exp: func.exp } } : x) }));
                            };

                            const onBlur = (event) => {
                                let inputValue = event.target.value;
                                const { formattedValue, validInput } = formatNumber(inputValue);
                                const func = MathFunctionsTemplates.newConstant({ value: validInput }).serialize();
                                //setDisplayedValue(formattedValue);
                                dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized: { ...x.serialized, exp: func.exp } } : x) }));
                            };

                            return <TextField
                                value={displayedValue}
                                onChange={handleChange}
                                onBlur={onBlur}
                                label="Valor"
                                variant="outlined"
                                fullWidth
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">{getIndex(cf?.unitId)?.label}</InputAdornment>,
                                    },
                                }}
                            />;
                        };

                        return <Grid2 container spacing={0} sx={{ margin: 0, paddingTop: '1rem', }}>
                            <Grid2 size={12}>
                                <SliderPeriodo />
                            </Grid2>
                            <Grid2 size={12}>
                                <ValorInput />
                            </Grid2>
                        </Grid2>
                    };

                    const ParametrosLine = () => {
                        const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;
                        const { a, b } = cf?.serialized?.meta;

                        const getInicial = () => b + a * minX;
                        const getFinal = () => b + a * maxX;

                        const getLineEquation = (point1, point2) => {
                            const [x1, y1] = point1;
                            const [x2, y2] = point2;

                            if (x1 === x2) {
                                throw new Error("Points should have diferent x value.");
                            }

                            const a = (y2 - y1) / (x2 - x1);
                            const b = y1 - a * x1;

                            return { a, b };
                        }

                        const SliderPeriodo = () => {
                            const minDistance = 1;

                            const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;
                            const [sliderVal, setSliderVal] = useState([minX, maxX]);

                            const valueLabelFormat = (value) => `Mes ${value}`;
                            const handleChange = (event, newValue, activeThumb) => {
                                let rango;
                                if (newValue[1] - newValue[0] < minDistance) {
                                    if (activeThumb === 0) {
                                        const clamped = Math.min(newValue[0], duration - minDistance);
                                        rango = [clamped, clamped + minDistance];
                                    } else {
                                        const clamped = Math.max(newValue[1], minDistance);
                                        rango = [clamped - minDistance, clamped];
                                    }
                                } else {
                                    rango = newValue;
                                }
                                setSliderVal(rango);
                            };

                            const handleCommit = (event, newValue, activeThumb) => {
                                const point1 = [sliderVal[0], a * minX + b];
                                const point2 = [sliderVal[1], a * maxX + b];
                                const newLine = getLineEquation(point1, point2);
                                const func = MathFunctionsTemplates.newLine({ ...newLine }).serialize();
                                dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized: { ...func, minX: sliderVal[0], maxX: sliderVal[1] } } : x) }));
                            };



                            const marks = [
                                { value: 0, label: 'Mes 0' },
                                { value: duration - 1, label: 'Mes ' + (duration - 1) }
                            ];

                            return <Box style={{ display: 'inline-flex', paddingTop: '1rem', paddingLeft: '0.5rem', paddingRight: '1rem' }} sx={{ width: '100%' }}>
                                <Typography variant="inherit" noWrap sx={{ width: '7rem', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'start' }}>
                                    Período <br /> {`[${minX}, ${maxX}]`}
                                </Typography>
                                <Slider
                                    marks={marks}
                                    min={0}
                                    max={duration - 1}
                                    value={sliderVal}
                                    onChangeCommitted={handleCommit}
                                    onChange={handleChange}
                                    valueLabelDisplay="auto"
                                    disableSwap
                                    getAriaValueText={valueLabelFormat}
                                    valueLabelFormat={valueLabelFormat}
                                />
                            </Box>
                        };

                        const ValorInicialInput = () => {

                            const [displayedValue, setDisplayedValue] = useState(formatNumber(getInicial().toFixed(0)).formattedValue);

                            const handleChange = (event) => {
                                let inputValue = event.target.value;
                                const { formattedValue, validInput } = formatNumber(inputValue);
                                setDisplayedValue(formattedValue);
                            };

                            const onBlur = (event) => {
                                let inputValue = event.target.value;
                                const { formattedValue, validInput } = formatNumber(inputValue);
                                const point1 = [minX, parseFloat(validInput)];
                                const point2 = [maxX, a * maxX + b];
                                const newLine = getLineEquation(point1, point2);
                                const func = MathFunctionsTemplates.newLine({ ...newLine }).serialize();
                                dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized: { ...func, minX, maxX, minY, maxY, } } : x) }));
                            };

                            return <TextField
                                value={displayedValue}
                                onChange={handleChange}
                                onBlur={onBlur}
                                label="Valor Inicial"
                                variant="outlined"
                                fullWidth
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">{getIndex(cf?.unitId)?.label}</InputAdornment>,
                                    },
                                }}
                            />;
                        };

                        const ValorFinalInput = () => {


                            const [displayedValue, setDisplayedValue] = useState(formatNumber(getFinal().toFixed(0)).formattedValue);

                            const handleChange = (event) => {
                                let inputValue = event.target.value;
                                const { formattedValue, validInput } = formatNumber(inputValue);
                                setDisplayedValue(formattedValue);
                            };

                            const onBlur = (event) => {
                                let inputValue = event.target.value;
                                const { formattedValue, validInput } = formatNumber(inputValue);
                                const point1 = [minX, a * minX + b];
                                const point2 = [maxX, parseFloat(validInput)];
                                const newLine = getLineEquation(point1, point2);
                                const func = MathFunctionsTemplates.newLine({ ...newLine }).serialize();
                                dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized: { ...func, minX, maxX, minY, maxY, } } : x) }));
                            };

                            return <TextField
                                value={displayedValue}
                                onChange={handleChange}
                                onBlur={onBlur}
                                label="Valor Final"
                                variant="outlined"
                                fullWidth
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">{getIndex(cf?.unitId)?.label}</InputAdornment>,
                                    },
                                }}
                            />;
                        };

                        return <Grid2 container spacing={0} >
                            <Grid2 size={12} sx={{ margin: 0, paddingTop: '1rem', }} >
                                <SliderPeriodo />
                            </Grid2>
                            <Grid2 size={12} sx={{ margin: 0, paddingTop: '1rem', }}>
                                <ValorInicialInput />
                            </Grid2>
                            <Grid2 size={12} sx={{ margin: 0, paddingTop: '1rem', }}>
                                <ValorFinalInput />
                            </Grid2>
                        </Grid2>
                    };

                    const ParametrosSmoothstep = () => {

                        const { x0, x1, y0, y1, N } = cf?.serialized?.meta;

                        const SliderPeriodo = () => {
                            const minDistance = 1;

                            const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;
                            const [sliderVal, setSliderVal] = useState([minX, maxX]);

                            const valueLabelFormat = (value) => `Mes ${value}`;
                            const handleChange = (event, newValue, activeThumb) => {
                                let rango;
                                if (newValue[1] - newValue[0] < minDistance) {
                                    if (activeThumb === 0) {
                                        const clamped = Math.min(newValue[0], duration - minDistance);
                                        rango = [clamped, clamped + minDistance];
                                    } else {
                                        const clamped = Math.max(newValue[1], minDistance);
                                        rango = [clamped - minDistance, clamped];
                                    }
                                } else {
                                    rango = newValue;
                                }
                                setSliderVal(rango);
                            };

                            const handleCommit = (event, newValue, activeThumb) => {
                                console.log({ sliderVal })
                                const func = MathFunctionsTemplates.newSmoothStep({ x0: sliderVal[0], x1: sliderVal[1], y0, y1, N }, { minX: sliderVal[0], maxX: sliderVal[1], minY, maxY }).serialize();
                                dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized: func } : x) }));

                            };

                            const marks = [{ value: 0, label: 'Mes 0' }, { value: duration - 1, label: 'Mes ' + (duration - 1) }];

                            return <Box style={{ display: 'inline-flex', paddingTop: '1rem', paddingLeft: '0.5rem', paddingRight: '1rem' }} sx={{ width: '100%' }}>
                                <Typography variant="inherit" noWrap sx={{ width: '7rem', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'start' }}>
                                    Período <br /> {`[${minX}, ${maxX}]`}
                                </Typography>
                                <Slider
                                    marks={marks}
                                    min={0}
                                    max={duration - 1}
                                    value={sliderVal}
                                    onChangeCommitted={handleCommit}
                                    onChange={handleChange}
                                    valueLabelDisplay="auto"
                                    disableSwap
                                    getAriaValueText={valueLabelFormat}
                                    valueLabelFormat={valueLabelFormat}
                                />
                            </Box>
                        };

                        const ValorInicialInput = () => {

                            const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;
                            const [displayedValue, setDisplayedValue] = useState(formatNumber(y0).validInput);

                            const handleChange = (event) => {
                                let inputValue = event.target.value;
                                const { formattedValue, validInput } = formatNumber(inputValue);
                                setDisplayedValue(formattedValue);
                            };

                            const onBlur = (event) => {
                                let inputValue = event.target.value;
                                const { formattedValue, validInput } = formatNumber(inputValue);
                                const func = MathFunctionsTemplates.newSmoothStep({ x0: parseInt(minX), x1: parseInt(maxX), y0: parseFloat(validInput), y1, N }, { minX, maxX, minY, maxY }).serialize();

                                setDisplayedValue(formattedValue);
                                dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized: func } : x) }));
                            };

                            return <TextField
                                value={displayedValue}
                                onChange={handleChange}
                                onBlur={onBlur}
                                label="Valor Inicial"
                                variant="outlined"
                                fullWidth
                                slotProps={{ input: { startAdornment: <InputAdornment position="start" children={getIndex(cf?.unitId)?.label} /> } }}
                            />;
                        };

                        const ValorFinalInput = () => {

                            const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;

                            const [displayedValue, setDisplayedValue] = useState(formatNumber(y1).validInput);

                            const handleChange = (event) => {
                                let inputValue = event.target.value;
                                const { formattedValue, validInput } = formatNumber(inputValue);
                                setDisplayedValue(formattedValue);
                            };

                            const onBlur = (event) => {
                                let inputValue = event.target.value;
                                const { formattedValue, validInput } = formatNumber(inputValue);
                                const func = MathFunctionsTemplates.newSmoothStep({ x0: minX, x1: maxX, y0, y1: validInput, N }, { minX, maxX, minY, maxY }).serialize();

                                setDisplayedValue(formattedValue);
                                dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized: func } : x) }));
                            };

                            return <TextField
                                value={displayedValue}
                                onChange={handleChange}
                                onBlur={onBlur}
                                label="Valor Final"
                                variant="outlined"
                                fullWidth
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">{getIndex(cf?.unitId)?.label}</InputAdornment>,
                                    },
                                }}
                            />;
                        };

                        const ValorNInput = () => {

                            const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;

                            const [displayedValue, setDisplayedValue] = useState(formatNumber(N).validInput);

                            const handleChange = (event) => {
                                let inputValue = parseInt(event.target.value);
                                const { formattedValue, validInput } = formatNumber(inputValue);
                                setDisplayedValue(formattedValue);
                            };

                            const onBlur = (event) => {
                                let inputValue = Math.max(1, Math.min(10, parseFloat(event.target.value)));

                                const { formattedValue, validInput } = formatNumber(inputValue);
                                const func = MathFunctionsTemplates.newSmoothStep({ x0: minX, x1: maxX, y0, y1, N: parseInt(validInput) }, { minX, maxX, minY, maxY }).serialize();
                                setDisplayedValue(formattedValue);
                                dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized: func } : x) }));
                            };

                            return <TextField
                                value={displayedValue}
                                onChange={handleChange}
                                onBlur={onBlur}
                                label="Valor N"
                                variant="outlined"
                                fullWidth
                            // slotProps={{
                            //     input: {
                            //         startAdornment: <InputAdornment position="start">{getIndex(cf?.unitId)?.label}</InputAdornment>,
                            //     },
                            // }}
                            />;
                        };

                        return <Grid2 container spacing={0} sx={{ margin: 0, paddingTop: '1rem', }}>
                            <Grid2 size={12} >
                                <SliderPeriodo />
                            </Grid2>
                            <Grid2 size={12} >
                                <ValorInicialInput />
                            </Grid2>
                            <Grid2 size={12} sx={{ margin: 0, paddingTop: '1rem', }}>
                                <ValorFinalInput />
                            </Grid2>
                            <Grid2 size={12} sx={{ margin: 0, paddingTop: '1rem', }}>
                                <ValorNInput />
                            </Grid2>
                        </Grid2>
                    };

                    const ParametrosSmoothstepBell = () => {
                        const funcs = cf?.serialized?.funcs;
                        const { x0, x1, x2, y0, y1, y2, N1, N2, minX, maxX, minY, maxY, underflowVal, overflowVal } = cf?.serialized?.meta;

                        const SliderPeriodo = () => {
                            const minDistance = 1;

                            const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;
                            const [sliderVal, setSliderVal] = useState([minX, maxX]);

                            const valueLabelFormat = (value) => `Mes ${value}`;
                            const handleChange = (event, newValue, activeThumb) => {
                                let rango;
                                if (newValue[1] - newValue[0] < minDistance) {
                                    if (activeThumb === 0) {
                                        const clamped = Math.min(newValue[0], duration - minDistance);
                                        rango = [clamped, clamped + minDistance];
                                    } else {
                                        const clamped = Math.max(newValue[1], minDistance);
                                        rango = [clamped - minDistance, clamped];
                                    }
                                } else {
                                    rango = newValue;
                                }
                                setSliderVal(rango);
                            };

                            const handleCommit = (event, newValue, activeThumb) => {
                                console.log({ sliderVal })
                                const func = MathFunctionsTemplates.newSmoothStep({ x0: sliderVal[0], x1: sliderVal[1], y0, y1, N }, { minX: sliderVal[0], maxX: sliderVal[1], minY, maxY }).serialize();
                                dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized: func } : x) }));

                            };

                            const marks = [{ value: 0, label: 'Mes 0' }, { value: duration - 1, label: 'Mes ' + (duration - 1) }];

                            return <Box style={{ display: 'inline-flex', paddingTop: '1rem', paddingLeft: '0.5rem', paddingRight: '1rem' }} sx={{ width: '100%' }}>
                                <Typography variant="inherit" noWrap sx={{ width: '7rem', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'start' }}>
                                    Período <br /> {`[${minX}, ${maxX}]`}
                                </Typography>
                                <Slider
                                    marks={marks}
                                    min={0}
                                    max={duration - 1}
                                    value={sliderVal}
                                    onChangeCommitted={handleCommit}
                                    onChange={handleChange}
                                    valueLabelDisplay="auto"
                                    disableSwap
                                    getAriaValueText={valueLabelFormat}
                                    valueLabelFormat={valueLabelFormat}
                                />
                            </Box>
                        };

                        const ValorInicialInput = () => {

                            const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;
                            const [displayedValue, setDisplayedValue] = useState(formatNumber(y0).validInput);

                            const handleChange = (event) => {
                                let inputValue = event.target.value;
                                const { formattedValue, validInput } = formatNumber(inputValue);
                                setDisplayedValue(formattedValue);
                            };

                            const onBlur = (event) => {
                                let inputValue = event.target.value;
                                const { formattedValue, validInput } = formatNumber(inputValue);
                                const func = MathFunctionsTemplates.newSmoothStep({ x0: parseInt(minX), x1: parseInt(maxX), y0: parseFloat(validInput), y1, N }, { minX, maxX, minY, maxY }).serialize();

                                setDisplayedValue(formattedValue);
                                dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized: func } : x) }));
                            };

                            return <TextField
                                value={displayedValue}
                                onChange={handleChange}
                                onBlur={onBlur}
                                label="Valor Inicial"
                                variant="outlined"
                                fullWidth
                                slotProps={{ input: { startAdornment: <InputAdornment position="start" children={getIndex(cf?.unitId)?.label} /> } }}
                            />;
                        };

                        const ValorFinalInput = () => {

                            const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;

                            const [displayedValue, setDisplayedValue] = useState(formatNumber(y1).validInput);

                            const handleChange = (event) => {
                                let inputValue = event.target.value;
                                const { formattedValue, validInput } = formatNumber(inputValue);
                                setDisplayedValue(formattedValue);
                            };

                            const onBlur = (event) => {
                                let inputValue = event.target.value;
                                const { formattedValue, validInput } = formatNumber(inputValue);
                                const func = MathFunctionsTemplates.newSmoothStep({ x0: minX, x1: maxX, y0, y1: validInput, N }, { minX, maxX, minY, maxY }).serialize();

                                setDisplayedValue(formattedValue);
                                dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized: func } : x) }));
                            };

                            return <TextField
                                value={displayedValue}
                                onChange={handleChange}
                                onBlur={onBlur}
                                label="Valor Final"
                                variant="outlined"
                                fullWidth
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">{getIndex(cf?.unitId)?.label}</InputAdornment>,
                                    },
                                }}
                            />;
                        };

                        const ValorNInput = () => {

                            const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;

                            const [displayedValue, setDisplayedValue] = useState(formatNumber(N).validInput);

                            const handleChange = (event) => {
                                let inputValue = parseInt(event.target.value);
                                const { formattedValue, validInput } = formatNumber(inputValue);
                                setDisplayedValue(formattedValue);
                            };

                            const onBlur = (event) => {
                                let inputValue = Math.max(1, Math.min(10, parseFloat(event.target.value)));

                                const { formattedValue, validInput } = formatNumber(inputValue);
                                const func = MathFunctionsTemplates.newSmoothStep({ x0: minX, x1: maxX, y0, y1, N: parseInt(validInput) }, { minX, maxX, minY, maxY }).serialize();
                                setDisplayedValue(formattedValue);
                                dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized: func } : x) }));
                            };

                            return <TextField
                                value={displayedValue}
                                onChange={handleChange}
                                onBlur={onBlur}
                                label="Valor N"
                                variant="outlined"
                                fullWidth
                            // slotProps={{
                            //     input: {
                            //         startAdornment: <InputAdornment position="start">{getIndex(cf?.unitId)?.label}</InputAdornment>,
                            //     },
                            // }}
                            />;
                        };

                        return <Grid2 container spacing={0} sx={{ margin: 0, paddingTop: '1rem', }}>
                            <Grid2 size={12} >
                                <SliderPeriodo />
                            </Grid2>
                            <Grid2 size={12} >
                                <ValorInicialInput />
                            </Grid2>
                            <Grid2 size={12} sx={{ margin: 0, paddingTop: '1rem', }}>
                                <ValorFinalInput />
                            </Grid2>
                            <Grid2 size={12} sx={{ margin: 0, paddingTop: '1rem', }}>
                                <ValorNInput />
                            </Grid2>
                        </Grid2>
                    };

                    const ParametrosCustom = () => {

                        const SliderPeriodo = () => {
                            const minDistance = 1;

                            const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;
                            const [sliderVal, setSliderVal] = useState([minX, maxX]);

                            const valueLabelFormat = (value) => `Mes ${value}`;
                            const handleChange = (event, newValue, activeThumb) => {
                                let rango;
                                if (newValue[1] - newValue[0] < minDistance) {
                                    if (activeThumb === 0) {
                                        const clamped = Math.min(newValue[0], duration - minDistance);
                                        rango = [clamped, clamped + minDistance];
                                    } else {
                                        const clamped = Math.max(newValue[1], minDistance);
                                        rango = [clamped - minDistance, clamped];
                                    }
                                } else {
                                    rango = newValue;
                                }
                                setSliderVal(rango);
                            };

                            const handleCommit = (event, newValue, activeThumb) => {
                                dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized: { ...x.serialized, minX: sliderVal[0], maxX: sliderVal[1] } } : x) }));
                            };

                            const marks = [
                                { value: 0, label: 'Mes 0' },
                                { value: duration - 1, label: 'Mes ' + (duration - 1) }
                            ];

                            return <Box style={{ display: 'inline-flex', paddingTop: '1rem', paddingLeft: '0.5rem', paddingRight: '1rem' }} sx={{ width: '100%' }}>
                                <Typography variant="inherit" noWrap sx={{ width: '7rem', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'start' }}>
                                    Período <br /> {`[${minX}, ${maxX}]`}
                                </Typography>
                                <Slider
                                    marks={marks}
                                    min={0}
                                    max={duration - 1}
                                    value={sliderVal}
                                    onChangeCommitted={handleCommit}
                                    onChange={handleChange}
                                    valueLabelDisplay="auto"
                                    disableSwap
                                    getAriaValueText={valueLabelFormat}
                                    valueLabelFormat={valueLabelFormat}
                                />
                            </Box>
                        };

                        const ValorInput = () => {

                            const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;
                            const examples = ["f(x) = 30000", "f(x) = 1000*x + 1000", "f(x) = 1000*pow(x,2) + sin(2*x)"];

                            const [focused, setFocused] = useState(false);
                            const [displayedValue, setDisplayedValue] = useState(exp);
                            const [isError, setIsError] = useState(false);
                            const handleChange = e => setDisplayedValue(e.target.value);

                            const onBlur = (e) => {
                                try {
                                    const func = new MathFunction({ exp: e.target.value, minX, maxX, minY, maxY, underflowVal, overflowVal, meta: { label: 'Custom' } }).serialize();
                                    setIsError(false);
                                    dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, serialized: func } : x) }));
                                } catch (error) {
                                    setIsError(true);
                                };
                                setFocused(false);
                            };

                            return <Box position="relative">
                                <TextField
                                    value={displayedValue}
                                    onFocus={() => setFocused(true)}
                                    onChange={handleChange}
                                    onBlur={onBlur}
                                    label="Expresión"
                                    variant="outlined"
                                    fullWidth
                                    error={isError}
                                    slotProps={{
                                        input: {
                                            startAdornment: <InputAdornment position="start">{getIndex(cf?.unitId)?.label + ' f(x) = '}</InputAdornment>,
                                        },
                                    }}
                                />
                                {focused && (
                                    <Paper elevation={3} sx={{ position: "absolute", top: "100%", left: 0, mt: 1, width: "100%", zIndex: 10, padding: 1 }} >
                                        <Typography variant="caption" color="textSecondary">
                                            Ejemplos:
                                        </Typography>
                                        <Box>
                                            {examples.map((example, index) => (
                                                <Typography key={index} variant="body2" color="textPrimary">
                                                    {example}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Paper>
                                )}
                            </Box>;
                        };

                        return <Grid2 container spacing={0} sx={{ margin: 0, paddingTop: '1rem', }}>
                            <Grid2 size={12}>
                                <SliderPeriodo />
                            </Grid2>
                            <Grid2 size={12}>
                                <ValorInput />
                            </Grid2>
                        </Grid2>
                    };

                    const comps = {
                        constant: ParametrosConstante,
                        line: ParametrosLine,
                        smoothstep: ParametrosSmoothstep,
                        smoothStepBell: ParametrosSmoothstepBell,
                        discrete: null,
                        multi: null,
                        custom: ParametrosCustom
                    };

                    const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;
                    const type = meta?.label;
                    let normilizedType = type?.replaceAll(' ', '').toLowerCase();
                    const Comp = comps[normilizedType] ?? (() => <></>);

                    return <>
                        <Comp />
                        <DisplayTotal />
                    </>
                };

                const Unidad = () => {

                    const Unidad = () => {

                        const handleChange = (e) =>
                            dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, unitId: e.target.value } : x) }));

                        return <>
                            <InputLabel>Unidad</InputLabel>
                            <Select value={cf?.unitId} label="Unidad" onChange={handleChange} >
                                {indexes.map((x, i) => <MenuItem key={`unidad-cf-${i}`} value={x.id}>{x.name}</MenuItem>)}
                            </Select>
                        </>
                    };

                    return <FormControl fullWidth sx={{ paddingBottom: '1rem', marginTop: '1.5rem' }}>
                        <Unidad />
                    </FormControl>
                };

                const Impuestos = () => {

                    const SliderFactB = () => {
                        const { factB } = cf;

                        const [sliderVal, setSliderVal] = useState(factB);

                        const handleChange = (event, newValue, activeThumb) => setSliderVal(newValue);

                        const handleCommit = (event, newValue, activeThumb) => {
                            dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, factB: newValue } : x) }));
                        };


                        const valueLabelFormat = (value) => `${(value * 100).toFixed(0)}%`;

                        const marks = [{ value: 0, label: '0%', }, { value: 1, label: '100%' }];

                        return (<Box style={{ display: 'inline-flex', paddingTop: '1rem', paddingLeft: '0.5rem', paddingRight: '1rem' }} sx={{ width: '100%' }}>
                            <Typography variant="inherit" noWrap sx={{ width: '7rem', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'start' }}>
                                Fact. B <br /> {`${(sliderVal * 100).toFixed(0)}%`}
                            </Typography>
                            <Slider
                                marks={marks}
                                step={0.01}
                                min={0}
                                max={1}
                                value={sliderVal}
                                onChange={handleChange}
                                onChangeCommitted={handleCommit}
                                valueLabelDisplay="auto"
                                disableSwap
                                getAriaValueText={valueLabelFormat}
                                valueLabelFormat={valueLabelFormat}
                            />
                        </Box>);
                    };

                    const SliderIIBB = () => {
                        const { IIBB } = cf;

                        const [sliderVal, setSliderVal] = useState(IIBB);

                        const handleChange = (event, newValue, activeThumb) => setSliderVal(newValue);

                        const handleCommit = (event, newValue, activeThumb) =>
                            dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, IIBB: newValue } : x) }));

                        const valueLabelFormat = (value) => `${(value * 100).toFixed(0)}%`;

                        const marks = [{ value: 0, label: '0%', }, { value: 0.03, label: '3%' }];

                        return (<Box style={{ display: 'inline-flex', paddingTop: '1rem', paddingLeft: '0.5rem', paddingRight: '1rem' }} sx={{ width: '100%' }}>
                            <Typography variant="inherit" noWrap sx={{ width: '7rem', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'start' }}>
                                IIBB <br /> {`${(sliderVal * 100).toFixed(0)}%`}
                            </Typography>
                            <Slider
                                marks={marks}
                                step={0.01}
                                min={0}
                                max={0.03}
                                value={sliderVal}
                                onChange={handleChange}
                                onChangeCommitted={handleCommit}
                                valueLabelDisplay="auto"
                                disableSwap
                                getAriaValueText={valueLabelFormat}
                                valueLabelFormat={valueLabelFormat}
                            />
                        </Box>);
                    };

                    const SliderIVA = () => {
                        const { iva } = cf;

                        const [sliderVal, setSliderVal] = useState(iva);

                        const handleChange = (event, newValue, activeThumb) => setSliderVal(newValue);

                        const handleCommit = (event, newValue, activeThumb) => {
                            dispatch(setData({ cashflows: cashflows.map((x, j) => i === j ? { ...x, iva: newValue } : x) }));
                        };


                        const valueLabelFormat = (value) => `${(value * 100).toFixed(0)}%`;

                        const marks = [{ value: 0, label: '0%', }, { value: 0.21, label: '21%' }];

                        return (<Box style={{ display: 'inline-flex', paddingTop: '1rem', paddingLeft: '0.5rem', paddingRight: '1rem' }} sx={{ width: '100%' }}>
                            <Typography variant="inherit" noWrap sx={{ width: '7rem', whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'start' }}>
                                IVA <br /> {`${(sliderVal * 100).toFixed(0)}%`}
                            </Typography>
                            <Slider
                                marks={marks}
                                step={0.01}
                                min={0}
                                max={0.21}
                                value={sliderVal}
                                onChange={handleChange}
                                onChangeCommitted={handleCommit}
                                valueLabelDisplay="auto"
                                disableSwap
                                getAriaValueText={valueLabelFormat}
                                valueLabelFormat={valueLabelFormat}
                            />
                        </Box>);
                    };

                    return <FormControl fullWidth sx={{ paddingBottom: '1rem' }}>
                        <SliderFactB />
                        <SliderIIBB />
                        <SliderIVA />
                    </FormControl>
                };

                return <>
                    <TipoCurva />
                    <ParametrosCurva />
                    <Unidad />
                    <Impuestos />
                </>
            };

            return (
                <>
                    {cashflows?.map((cf, i) => {
                        return <ListItem key={`params-cashflow-${cf.name}-${i}`}><Accordion >
                            <AccordionSummary expandIcon={<ExpandMore />} children={<AccordionHeader cf={cf} />} />
                            <AccordionDetails>
                                <ConfiguracionCurva cf={cf} i={i} />
                            </AccordionDetails>
                        </Accordion></ListItem>
                    })
                    }
                </>
            )
        };

        return (<Box sx={{ width: '100%', height: { xs: 'flex', sm: 'flex', md: '100%', lg: '100%', xl: '100%' }, flexGrow: 1, pb: '1em', backgroundColor: '#e3e3e3' }}>
            <Header />
            <List sx={{ p:0}}>
                <General />
                <Cashflows />
            </List>
        </Box>);
    };
    const TopBar = () => {
        const Bar = () => {
            const [anchorElNav, setAnchorElNav] = React.useState(null);

            const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
            const handleCloseNavMenu = () => setAnchorElNav(null);

            return (
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, width: '100%', left: 0, backgroundColor: theme.palette.secondary.main}}>

                    {/* Mobile Version */}
                    <Toolbar sx={{ flexGrow: 1, display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' } }}>
                        {/* Menu hamburguesa */}
                        <Box sx={{ flexGrow: 1, display: 'flex' }}>
                            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit"  >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                keepMounted
                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                            >

                                <Parameters />
                            </Menu>
                        </Box>

                    </Toolbar>
                </AppBar>)
        };


        return (
            <div>
                <Bar></Bar>
            </div>
        )
    };
    const CashFlowPlot = () => {

        const { duration, cashflows, indexes } = useSelector(state => state.proyecciones?.data);
        const xAxis = [{ data: Array.from({ length: duration }, (_, i) => i), id: 'x-axis-id' }];

        const series = cashflows.map(cf => {
            const getPlotData = (cf, duration) => {
                const { minX, maxX, minY, maxY, underflowVal, overflowVal, meta, exp } = cf?.serialized;
                const func = new MathFunction(cf?.serialized);
                //const func = MathFunctionsTemplates.newSmoothStep(cf?.serialized?.meta);
                return Array(duration).fill().map((_, i) => i >= minX && i <= maxX ? func.evaluate(i) : null);
            };
            return {
                type: 'line',
                label: cf.name,
                data: getPlotData(cf, duration),
                color: cf.color,
                showMark: true
            }
        });

        // Agregar la serie de la recta
        series.push({
            id: 'Resultante',
            type: 'line',
            label: 'Resultante',
            data: Array(duration).fill(0).map((_, i) => series.reduce((p, x) => p + (x?.data[i] || 0), 0)),
            color: 'red', // Color de la línea
            xAxisId: 'x-axis-id',
            showMark: false, // Opcional: muestra puntos en la línea
        });

        const Header = () => <div style={{ width: "100%", height: "5vh" }}>
            <Grid2 container spacing={0} sx={{ margin: 0, padding: 0, backgroundColor: 'white', padding: '0rem', paddingTop: '1rem', paddingLeft: '2rem', paddingRight: '3rem', marginBottom: '0rem', placeItems: 'end' }}>
                <Grid2 size={8}>
                    <Typography variant="h6" component="h2" gutterBottom color='black' children={'Flujo de Fondos'} />
                </Grid2>
                <Grid2 size={4} sx={{ textAlignLast: 'end' }}>
                    <IconButton size="large" children={<Build />} />
                    <IconButton size="large" children={<Download />} />
                </Grid2>
            </Grid2>
        </div>;

        const Plot = () => <div style={{ width: "100%", height: "45vh", padding: '1.5rem' }}>
            <ResponsiveChartContainer series={series} xAxis={xAxis} sx={{ margin: '0.5rem', marginBottom: '0rem', paddingBottom: '0rem', marginTop: '-3rem', paddingTop: '0rem' }}>
                <LinePlot />
                <ChartsXAxis label="Meses" position="bottom" axisId="x-axis-id" />
                <ChartsYAxis label="USD" />
                <ChartsTooltip />
                <ChartsGrid vertical horizontal />
                <MarkPlot />
                <ChartsReferenceLine y={0} />

            </ResponsiveChartContainer>
        </div>;

        return <div style={{ width: "100%", height: "50vh" }}>
            <Header />
            <Plot />
        </div>
    };

    const CashFlowTotalPlot = () => {

        const { duration, cashflows, indexes } = useSelector(state => state.proyecciones?.data);
        const xAxis = [
            {
                data: Array.from({ length: duration }, (_, i) => i),
                id: 'x-axis-id',
                type: 'band',
                scaleType: 'band'
            },
        ];

        // Configuración de las series
        const series = cashflows.map(cf => {
            const getPlotData = (cf, duration) => {
                const func = new MathFunction(cf?.serialized);
                return Array(duration).fill().map((_, i) => {
                    let res = 0;
                    const { minX, maxX } = cf?.serialized;
                    for (let j = 0; j <= i; j++) {
                        if (j >= minX && j <= maxX)
                            res += func.evaluate(j)
                    }
                    return res;
                });
            };

            return {
                id: cf.name,
                stack: 'a',
                type: 'bar',
                label: cf.name,
                data: getPlotData(cf, duration), // Datos adecuados para cada serie
                color: cf.color,
                xAxisId: 'x-axis-id', // Asociar al eje "x-axis-id"
            };
        });

        // Agregar la serie de la recta
        series.push({
            id: 'Resultante',
            type: 'line',
            label: 'Resultante',
            data: Array(duration).fill(0).map((_, i) => series.reduce((p, x) => p + (x?.data[i] || 0), 0)),
            color: 'red', // Color de la línea
            xAxisId: 'x-axis-id',
            showMark: true, // Opcional: muestra puntos en la línea
        });

        const Header = () => <div style={{ width: "100%", height: "5vh" }}>
            <Grid2 container spacing={0} sx={{ margin: 0, padding: 0, backgroundColor: 'white', padding: '0rem', paddingTop: '1rem', paddingLeft: '2rem', paddingRight: '3rem', marginBottom: '0rem', placeItems: 'end' }}>
                <Grid2 size={8}>
                    <Typography variant="h6" component="h2" gutterBottom color='black' children={'Acumulado'} />
                </Grid2>
                <Grid2 size={4} sx={{ textAlignLast: 'end' }}>
                    <IconButton size="large" children={<Build />} />
                    <IconButton size="large" children={<Download />} />
                </Grid2>
            </Grid2>
        </div>;

        const Plot = () => <div style={{ width: "100%", height: "45vh", padding: '1.5rem' }}>
            <ResponsiveChartContainer series={series} xAxis={xAxis} sx={{ margin: '0.5rem', marginBottom: '0rem', marginTop: '-3rem' }} >
                <BarPlot /> {/* Gráfico de barras */}
                <LinePlot /> {/* Gráfico de líneas */}
                <ChartsXAxis label="Meses" position="bottom" axisId="x-axis-id" />
                <ChartsYAxis label="USD" />
                <ChartsTooltip />
                <ChartsGrid vertical horizontal />
                <ChartsReferenceLine y={0} />
            </ResponsiveChartContainer>
        </div>;

        return <div style={{ width: "100%", height: "50vh" }}>
            <Header />
            <Plot />
        </div>
    };

    const IndexesPlot = () => {
        const { general, land } = useSelector(state => state.proyecciones?.data?.parameters);
        const range = Array.from({ length: general.period[1] - general.period[0] + 1 }, (_, i) => general.period[0] + i);

        const xAxis = [{ data: range, id: 'x-axis-id' }];
        const smoothStep = newSmoothStep(3);

        const series = [
            { type: 'line', label: 'CAC', data: range.map(x => (0.5 + (x / range.length) / 10) * 3000) },
            { type: 'line', label: 'Dolar Blue', data: range.map(x => (0.3 + (x / range.length) * (x / range.length) / 5) * 4000) },
            { type: 'line', label: 'Precio M2 Prom', data: range.map(x => (0.5 + smoothStep(x / range.length) / 2) * 4000), showMark: true },
        ];

        return <div style={{ width: "100%", height: "45vh" }}>
            <div style={{ width: "100%", height: "5vh" }}>
                <Grid2 container spacing={0} sx={{ margin: 0, padding: 0, backgroundColor: 'white', padding: '0rem', paddingLeft: '2rem', paddingRight: '3rem', marginBottom: '0rem', placeItems: 'end' }}>
                    <Grid2 size={8}>
                        <Typography variant="h6" component="h2" gutterBottom color='black'>
                            Índices
                        </Typography>
                    </Grid2>
                    <Grid2 size={4} sx={{ textAlignLast: 'end' }}>
                        <IconButton size="large">
                            <Build />
                        </IconButton>
                        <IconButton size="large">
                            <Download />
                        </IconButton>
                    </Grid2>
                </Grid2>
            </div>
            <div style={{ width: "100%", height: "40vh" }}>
                <ResponsiveChartContainer series={series} xAxis={xAxis} sx={{ margin: '0.5rem', marginBottom: '1rem', marginTop: '-3rem', paddingTop: '0rem' }}>
                    <LinePlot />
                    <ChartsXAxis label="Meses" position="bottom" axisId="x-axis-id" />
                    <ChartsYAxis label="USD" />
                    <ChartsTooltip />
                    <ChartsGrid vertical horizontal />
                    <MarkPlot />
                </ResponsiveChartContainer>
            </div>
        </div>
    };

    return (<Grid2 container spacing={0} sx={{ margin: 0, padding: 0, backgroundColor: 'white' }}>
        <TopBar />
        <Grid2 size={3} sx={{ flexGrow: 1, display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' } }}>
            <Parameters />
        </Grid2>
        <Grid2  size={{ xs: 12, sm: 12, md: 9, lg: 9, xl: 9 }}>
            <CashFlowPlot />
            <CashFlowTotalPlot />
            {/* <IndexesPlot /> */}
        </Grid2>
    </Grid2>);
}

export default Proyecciones;
