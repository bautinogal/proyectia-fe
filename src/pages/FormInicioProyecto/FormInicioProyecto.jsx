import React, { memo, useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import { cleanError, cleanMessage, getData, setData } from './FormInicioProyectoSlice.js';

import { ResponsiveChartContainer, LineChart, LinePlot, ChartsXAxis, ChartsYAxis, ChartsTooltip, MarkPlot, ChartsGrid, ChartsReferenceLine, AreaPlot, BarChart, BarPlot } from "@mui/x-charts";

import {
    Accordion, AccordionActions, AccordionSummary, AccordionDetails, AppBar, Box, Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid2,
    IconButton, InputLabel, List, ListItem, Menu, MenuItem, Select, Slider, TextField, Toolbar, Tooltip, Typography, InputAdornment, Paper, Icon
} from '@mui/material';

import { ChromePicker } from 'react-color';
import { Add, Build, Circle, Delete, Download, Edit, ExpandMore, ColorLens, Colorize, Description, Dataset } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';

import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import DollarWidget from "./DollarWidget";
import PerWidget from "./PerWidget";

import { MathFunction, MathFunctionsTemplates } from "../../mathFunctions/index.js";
import { main } from "../../aiAPI/index.js"
import { styled } from '@mui/material/styles';
import SvgIcon from '@mui/material/SvgIcon';
import * as XLSX from 'xlsx';

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
const moneyFormat = (v) => "US$ " + new Intl.NumberFormat("de-DE", { style: "currency", currency: "ARS" }).format(parseFloat(v)).replace("ARS", "");
function FormInicioProyecto() {

    const dispatch = useDispatch();

    const useIsMobile = () => {
        const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

        useEffect(() => {
            const handleResize = () => setIsMobile(window.innerWidth <= 768);
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }, []);

        return isMobile;
    };
    const widgets = {
        dollar: DollarWidget,
        percent: PerWidget,
    };
    const Parameters = () => {

        const IndicadoresGenerales = () => {
            const uiSchema = {
                valorTerrenoTotal: { "ui:widget": "dollar" },
                valorM2construibles: { "ui:widget": "dollar" },
                valorM2vendibles: { "ui:widget": "dollar" },
            };

            const { m2construibles,
                m2vendibles,
                valorTerrenoTotal,
                valorM2construibles,
                valorM2vendibles } = useSelector(state => state.formInicioProyecto?.data);
            const schema = {
                type: 'object',
                required: [],
                properties: {
                    valorTerrenoTotal: { type: 'number', title: 'Valor Terreno US$', default: valorTerrenoTotal },
                    m2construibles: { type: 'number', title: 'M2 Totales', default: m2construibles },
                    m2vendibles: { type: 'number', title: 'M2 Vendibles', default: m2vendibles },
                    valorM2construibles: { type: 'number', title: 'Valor M2 Construibles US$', default: valorM2construibles },
                    valorM2vendibles: { type: 'number', title: 'Valor M2 Vendibles US$', default: valorM2vendibles },

                },
            };

            const onChange = (e) => { dispatch(setData(e.formData)) };
            const onError = (e) => console.log('errors');
            return (<ListItem>
                <Form schema={schema} uiSchema={uiSchema} widgets={widgets} validator={validator} onSubmit={onChange} onError={onError}>
                </Form>
            </ListItem>
            )
        };
        const IndicadoresDetallados = () => {
            const {
                costoPerProyecto,
                costoPerDirecion,
                costoPerGerenciamiento,
                costoJuridicoContableUS,
                //Comercializacion
                costoPerComisiones,
                costosMarketing,
                costosVarios,
                //Impuestos
                costosPerIVAVentas,
                costosPerIIBB,
                costosPerSellos,
                costosPerCheques, } = useSelector(state => state.formInicioProyecto?.data);

            const AccordionHeader = ({ cf, i }) => {

                return <Grid2 container spacing={0} sx={{ width: '100%', padding: 0, margin: 0 }}>
                    <Grid2 size={11}>
                        <Box display="flex" alignItems="center">
                            <Circle sx={{ height: '0.5rem' }} style={{ color: cf.color || 'white' }} />
                            <Typography children={cf.name} fontWeight={600} />
                        </Box>
                    </Grid2>
                </Grid2 >

            };
            const cat = [
                {
                    name: "Costos Obra",
                    schema: {
                        type: 'object',
                        required: [],
                        properties: {
                            costoPerProyecto: { type: 'number', title: 'M2 Vendibles', default: costoPerProyecto },
                            costoPerDirecion: { type: 'number', title: 'Valor M2 Construibles US$', default: costoPerDirecion },
                            costoPerGerenciamiento: { type: 'number', title: 'Valor M2 Vendibles US$', default: costoPerGerenciamiento },
                            costoJuridicoContableUS: { type: 'number', title: 'Juridico Contable - Valor Fijo US$', default: costoJuridicoContableUS },
                        },
                    },
                    uiSchema: {
                        costoPerProyecto: { "ui:widget": "percent" },
                        costoPerDirecion: { "ui:widget": "percent" },
                        costoPerGerenciamiento: { "ui:widget": "percent" },
                        costoJuridicoContableUS: { "ui:widget": "dollar" },
                    },
                },
                {
                    name: "Costos Comercial",
                    schema: {
                        type: 'object',
                        required: [],
                        properties: {
                            costoPerComisiones: { type: 'number', title: 'Porcentaje de Comisiones', default: costoPerComisiones },
                            costosMarketing: { type: 'number', title: 'Marketing - Valor Fijo en US$', default: costosMarketing },
                            costosVarios: { type: 'number', title: 'Varios - Valor Fijo en US$', default: costosVarios },
                        },
                    },
                    uiSchema: {
                        costoPerComisiones: { "ui:widget": "percent" },
                        costosMarketing: { "ui:widget": "dollar" },
                        costosVarios: { "ui:widget": "dollar" },
                    },
                },
                {
                    name: "Costos Impuestos",
                    schema: {
                        type: 'object',
                        required: [],
                        properties: {
                            costosPerIVAVentas: { type: 'number', title: 'Porcentaje IVA Ventas', default: costosPerIVAVentas },
                            costosPerIIBB: { type: 'number', title: 'Porcentaje IIBB', default: costosPerIIBB },
                            costosPerSellos: { type: 'number', title: 'Porcentaje Sellos', default: costosPerSellos },
                            costosPerCheques: { type: 'number', title: 'Porcentaje Cheques', default: costosPerCheques },
                        },
                    },
                    uiSchema: {
                        costosPerIVAVentas: { "ui:widget": "percent" },
                        costosPerIIBB: { "ui:widget": "percent" },
                        costosPerSellos: { "ui:widget": "percent" },
                        costosPerCheques: { "ui:widget": "percent" },
                    },
                }
            ];
            const onChange = (e) => { dispatch(setData(e.formData)) };
            const onError = (e) => console.log('errors');
            return (
                <>
                    {cat?.map((cf, i) => {
                        return <ListItem key={`params-cashflow-${cf.name}-${i}`}><Accordion sx={{ width: '100vw' }}>
                            <AccordionSummary expandIcon={<ExpandMore />} children={<AccordionHeader cf={cf} i={i} />} />
                            <AccordionDetails>
                                <ListItem>
                                    <Form schema={cf.schema} uiSchema={cf.uiSchema} widgets={widgets} validator={validator} onSubmit={onChange} onError={onError}>
                                    </Form>
                                </ListItem>
                            </AccordionDetails>
                        </Accordion></ListItem>
                    })
                    }
                </>
            )
        }
        return (<Box sx={{ width: '100%', height: { xs: 'flex', sm: 'flex', md: '100%', lg: '100%', xl: '100%' }, flexGrow: 1, pb: '1em', backgroundColor: theme.palette.neutral.light }}>
            <List>
                <Typography variant="h6" children='Proyecto:' sx={{ pl: '17px', pb: '5px' }} />
                <IndicadoresGenerales />
                <Divider />
                <Typography variant="h6" children='Detalle:' sx={{ p: '17px', pb: '5px' }} />
                <IndicadoresDetallados />
            </List>
        </Box>);
    };
    const TopBar = () => {
        const Bar = () => {
            const [anchorElNav, setAnchorElNav] = React.useState(null);

            const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
            const handleCloseNavMenu = () => setAnchorElNav(null);

            return (
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, width: '100%', left: 0, backgroundColor: theme.palette.secondary.main }}>

                    {/* Mobile Version */}
                    <Toolbar sx={{ flexGrow: 1, display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none', xl: 'none' } }}>
                        {/* Menu hamburguesa */}
                        <Box >
                            <IconButton size="large" onClick={handleOpenNavMenu} color="inherit"  >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                sx={{ p: 0 }}
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
    const Reporte = () => {
        const isMobile = useIsMobile();
        const { m2construibles,
            m2vendibles,
            valorTerrenoTotal,
            valorM2construibles,
            valorM2vendibles,
            costoPerProyecto,
            costoPerDirecion,
            costoPerGerenciamiento,
            costoJuridicoContableUS,
            //Comercializacion
            costoPerComisiones,
            costosMarketing,
            costosVarios,
            //Impuestos
            costosPerIVAVentas,
            costosPerIIBB,
            costosPerSellos,
            costosPerCheques, 
            costosPerIVAventas,
        
            alicuotaIVATerreno,
            alicuotaIVACostoObra,
            alicuotaIVAProyecto,
            alicuotaIVADireccion,
            alicuotaIVAGerenciamiento,
            alicuotaIVAJuridicoContable,
            alicuotaIVAComisiones,
            alicuotaIVAMarketing,
            alicuotaIVAVarios,

        } = useSelector(state => state.formInicioProyecto?.data);
        
        const handleDownloadXLS = () => {
            const columns = [];
            if (!Array.isArray(columns) || !Array.isArray(series)) {
                console.error('xAxis y series deben ser arrays válidos', typeof columns);
                return;
            }

            // Construir los encabezados asegurando que xAxis contiene solo números
            const headers = ['Categorias', ...columns.map(num => `Mes ${String(num)}`)];

            // Construir los datos asegurando que cada fila tenga la misma longitud
            const data = [].map(item => [
                `${item.label} US$`,
                ...columns.map((_, index) => item.data[index] ?? '-')
            ]);

            // Crear la hoja de cálculo
            const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

            // Descargar el archivo Excel
            XLSX.writeFile(workbook, `Flujo_de_Fondos.xlsx`);
        }
        const handleDownloadPDF = async () => {
            let res = await main([])
            console.log({ res })
        }
        const Header = () => <div style={{ width: "100%", height: "5vh", mb: '2rem' }}>
            <Grid2 container spacing={0} sx={{ margin: 0, padding: 0, backgroundColor: 'white', padding: '0rem', paddingTop: '1rem', paddingLeft: '2rem', paddingRight: '3rem', marginBottom: '0rem', placeItems: 'end' }}>
                <Grid2 size={8}>
                    <Typography variant="h6" component="h2" gutterBottom color='black' children={'Desglose'} />
                </Grid2>
                <Grid2 size={4} sx={{ textAlignLast: 'end' }}>
                    <Tooltip title='Descargar XLSX' children={<IconButton size="large" children={<Dataset />} onClick={() => handleDownloadXLS()} />} />
                    <Tooltip title='Descargar Reporte' children={<IconButton size="large" children={<Description />} onClick={() => handleDownloadPDF()} />} />
                </Grid2>
            </Grid2>
        </div>;
        const sizeCat = 3;
        const sizeConstruibles = 3
        const sizeVendibles = 3
        const sizeTotales = 3
        const valorM2vendiblesSinIVA = valorM2vendibles / (1 + (costosPerIVAVentas / 100))  
        const ventaTotalM2vendibles = valorM2vendibles * m2vendibles
        const ventaTotalM2vendiblesSinIVA = valorM2vendiblesSinIVA * m2vendibles
        const ingresosTotales = ventaTotalM2vendibles
        const valorTerrenoM2vendible = valorTerrenoTotal / m2vendibles
        const costoObraTotal = valorM2construibles * m2construibles
        const valorM2vendiblesTotalesPorTerreno = costoObraTotal / m2vendibles
        const valorTotalCostoProyecto = costoObraTotal * (costoPerProyecto/100)
        const valorM2construibleCostoProyecto = valorTotalCostoProyecto / m2construibles
        const valorM2vendiblesCostoProyecto = valorTotalCostoProyecto / m2vendibles

        const valorTotalCostoGerencia = costoObraTotal * (costoPerGerenciamiento/100)
        const valorM2construibleCostoGerencia = valorTotalCostoProyecto / m2construibles
        const valorM2vendiblesCostoGerencia = valorTotalCostoProyecto / m2vendibles

        const valorTotalCostoDireccion = costoObraTotal * (costoPerDirecion/100)
        const valorM2construibleCostoDireccion = valorTotalCostoProyecto / m2construibles
        const valorM2vendiblesCostoDireccion = valorTotalCostoProyecto / m2vendibles

        const costoJuridicoContableUSVendible = costoJuridicoContableUS / m2vendibles
        const costoJuridicoContableUSConstruible = costoJuridicoContableUS / m2construibles

        const costoPerComisionesVendible = valorM2vendibles * (costoPerComisiones / 100)
        const costoPerComisionesTotal = costoPerComisionesVendible * m2vendibles
        const costoPerComisionesConstruible = costoPerComisionesTotal / m2construibles

        const costosMarketingVendible = costosMarketing / m2vendibles
        const costosMarketingConstruible = costosMarketing / m2construibles

        const totalEgresos = valorTerrenoTotal + 
        costoObraTotal +
        valorTotalCostoProyecto + 
        valorTotalCostoDireccion + 
        valorTotalCostoGerencia + 
        costoJuridicoContableUS + 
        costoPerComisionesTotal + 
        costosMarketing + 
        costosVarios

        const margenAntesDeImpuestos = ingresosTotales - totalEgresos;

        const costosPerIVAventasTotal = ventaTotalM2vendiblesSinIVA * (costosPerIVAventas / 100)
        const costosPerIVAventasConstruible = costosPerIVAventasTotal / m2construibles
        const costosPerIVAventasVendible = costosPerIVAventasTotal / m2vendibles

        const costosPerIVAcostosTotal = valorTerrenoTotal * (alicuotaIVATerreno / 100) +
        costoObraTotal * (alicuotaIVACostoObra / 100) +
        valorTotalCostoProyecto * (alicuotaIVAProyecto / 100) +
        valorTotalCostoDireccion * (alicuotaIVADireccion / 100) +
        valorTotalCostoGerencia * (alicuotaIVAGerenciamiento / 100) +
        costoJuridicoContableUS * (alicuotaIVAJuridicoContable / 100) +
        costoPerComisionesTotal * (alicuotaIVAComisiones / 100) +
        costosMarketing * (alicuotaIVAMarketing / 100) +
        costosVarios * (alicuotaIVAVarios / 100) 
        const costosPerIVAcostosConstruible = costosPerIVAcostosTotal / m2construibles
        const costosPerIVAcostosVendible = costosPerIVAcostosTotal / m2vendibles

        const netoTotal = Math.max(0, costosPerIVAventasTotal - costosPerIVAcostosTotal)
        
        const iibbTotal = ventaTotalM2vendiblesSinIVA * (costosPerIIBB / 100)
        const iibbVendible = iibbTotal / m2vendibles
        const iibbConstruible = iibbTotal / m2construibles

        const sellosTotal = ventaTotalM2vendiblesSinIVA * (costosPerSellos / 100)
        const sellosVendible = sellosTotal / m2vendibles;
        const sellosConstruible = sellosTotal / m2construibles

        const impuestoChequeTotal = ventaTotalM2vendiblesSinIVA * (costosPerCheques / 100);
        const impuestoChequeVendible = impuestoChequeTotal / m2vendibles;
        const impuestoChequeConstruible = impuestoChequeTotal / m2construibles;

        const totalImpuestos = iibbTotal + sellosTotal + impuestoChequeTotal
        const totalImpuestosConstruible = iibbConstruible + sellosConstruible + impuestoChequeConstruible
        const totalImpuestosVendible = iibbVendible + sellosVendible + impuestoChequeVendible

        const margenTotalDespuesImpuestos = margenAntesDeImpuestos - netoTotal - totalImpuestos;
        const margenTotalDespuesImpuestosConstruible = margenTotalDespuesImpuestos / m2construibles;
        const margenTotalDespuesImpuestosVendible = margenTotalDespuesImpuestos / m2vendibles;
        
        const spaceBetweenRows = {marginTop: '2rem'} 

        const Desglose = () => <div style={{ width: "95%", height: "100vh", mt: '3rem', display: 'flex', justifySelf: 'center' }}>
                <Grid2 container spacing={0} alignContent={'flex-start'} sx={{ paddingTop: '1rem', paddingLeft: '2rem', paddingRight: '3rem', marginBottom: '0rem', width: '100%', }}>
                    <Grid2 size={sizeCat} children={<Typography children=''/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography fontWeight='bold' textAlign={'right'} children='M2 Construibles'/>} />
                    <Grid2 size={sizeVendibles} children={<Typography fontWeight='bold' textAlign={'right'} children='M2 Vendibles'/>} />
                    <Grid2 size={sizeTotales} children={<Typography fontWeight='bold' textAlign={'right'} children='Total'/>} />
                
                    <Grid2 size={12} children={<Divider/>} />

                    <Grid2 size={sizeCat} children={<Typography children='M2'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography textAlign={'right'} children={m2construibles} />} />
                    <Grid2 size={sizeVendibles} children={<Typography textAlign={'right'} children={m2vendibles} />} />
                    <Grid2 size={sizeTotales} children={<Typography textAlign={'right'} children='-'/>} />

                    <Grid2 size={sizeCat} children={<Typography sx={{...spaceBetweenRows}} fontWeight='bold' children='INGRESOS'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={''} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={''} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={''}/>} />

                    <Grid2 size={12} children={<Divider/>} />
                    <Grid2 size={sizeCat} children={<Typography children='Precio por M2 Vendible (c/IVA)'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={'-'} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={moneyFormat(valorM2vendibles)} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(ingresosTotales)}/>} />

                    <Grid2 size={sizeCat} children={<Typography children='sin IVA'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={'-'} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={moneyFormat(valorM2vendiblesSinIVA)} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={'-'}/>} />

                    <Grid2 size={12} children={<Divider/>} />
                    <Grid2 size={sizeCat} children={<Typography fontWeight={'bold'} children='Total Ingresos'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={'-'} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={'-'} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} fontWeight='bold' children={moneyFormat(ingresosTotales)}/>} />
                
                    <Grid2 size={12} children={<Divider/>} />

                    <Grid2 size={sizeCat} children={<Typography sx={{...spaceBetweenRows}} fontWeight='bold' children='EGRESOS'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={''} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={''} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={''}/>} />

                    <Grid2 size={12} children={<Divider/>} />

                    <Grid2 size={sizeCat} children={<Typography children='Terreno'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={'-'} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={moneyFormat(valorTerrenoM2vendible)} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(valorTerrenoTotal)}/>} />
                
                    <Grid2 size={sizeCat} children={<Typography children='Costo Obra'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={moneyFormat(valorM2construibles)} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={moneyFormat(valorM2vendiblesTotalesPorTerreno)} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(costoObraTotal)}/>} />
                
                    <Grid2 size={sizeCat} children={<Typography children='Proyecto'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={moneyFormat(valorM2construibleCostoProyecto)} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={moneyFormat(valorM2vendiblesCostoProyecto)} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(valorTotalCostoProyecto)}/>} />
                
                    <Grid2 size={sizeCat} children={<Typography  children='Dirección'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={moneyFormat(valorM2construibleCostoDireccion)} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={moneyFormat(valorM2vendiblesCostoDireccion)} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(valorTotalCostoDireccion)}/>} />

                    <Grid2 size={sizeCat} children={<Typography children='Gerenciamiento'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={moneyFormat(valorM2construibleCostoGerencia)} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={moneyFormat(valorM2vendiblesCostoGerencia)} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(valorTotalCostoGerencia)}/>} />

                    <Grid2 size={sizeCat} children={<Typography children='Abogado + Contador'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={moneyFormat(costoJuridicoContableUSConstruible)} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={moneyFormat(costoJuridicoContableUSVendible)} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(costoJuridicoContableUS)}/>} />
                
                    <Grid2 size={sizeCat} children={<Typography children='Comisiones'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={moneyFormat(costoPerComisionesConstruible)} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={moneyFormat(costoPerComisionesVendible)} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(costoPerComisionesTotal)}/>} />
                
                    <Grid2 size={sizeCat} children={<Typography children='Gastos Marketing'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={moneyFormat(costosMarketingConstruible)} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={moneyFormat(costosMarketingVendible)} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(costosMarketing)}/>} />
                
                    <Grid2 size={sizeCat} children={<Typography children='Gastos varios'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={'-'} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={'-'} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(costosVarios)}/>} />

                    <Grid2 size={12} children={<Divider/>} />

                    <Grid2 size={sizeCat} children={<Typography fontWeight='bold' children='Total Egresos'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={'-'} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={'-'} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} fontWeight='bold' children={moneyFormat(totalEgresos)}/>} />

                    <Grid2 size={12} children={<Divider/>} />

                    <Grid2 size={sizeCat} children={<Typography  sx={{...spaceBetweenRows}} fontWeight='bold' children='Margen Antes de Impuestos'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  sx={{...spaceBetweenRows}} textAlign={'right'} children={'-'} />} />
                    <Grid2 size={sizeVendibles} children={<Typography  sx={{...spaceBetweenRows}}  textAlign={'right'} children={'-'} />} />
                    <Grid2 size={sizeTotales} children={<Typography  sx={{...spaceBetweenRows}} textAlign={'right'} fontWeight='bold' children={moneyFormat(margenAntesDeImpuestos)}/>} />
                
                    <Grid2 size={12} children={<Divider/>} />

                    <Grid2 size={sizeCat} children={<Typography  sx={{...spaceBetweenRows}} fontWeight='bold' children='IMPUESTOS'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  sx={{...spaceBetweenRows}} textAlign={'right'} children={''} />} />
                    <Grid2 size={sizeVendibles} children={<Typography  sx={{...spaceBetweenRows}}  textAlign={'right'} children={''} />} />
                    <Grid2 size={sizeTotales} children={<Typography  sx={{...spaceBetweenRows}} textAlign={'right'} children={''}/>} />

                    <Grid2 size={sizeCat} children={<Typography children='IVA Ventas'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={moneyFormat(costosPerIVAventasConstruible)} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={moneyFormat(costosPerIVAventasVendible)} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(costosPerIVAventasTotal)}/>} />
                
                    <Grid2 size={sizeCat} children={<Typography children='IVA Costos'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={moneyFormat(costosPerIVAcostosConstruible)} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={moneyFormat(costosPerIVAcostosVendible)} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(costosPerIVAcostosTotal)}/>} />

                    <Grid2 size={sizeCat} children={<Typography children='Neto'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={'-'} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={'-'} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(netoTotal)}/>} />

                    <Grid2 size={sizeCat} children={<Typography children='IIBB'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={moneyFormat(iibbConstruible)} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={moneyFormat(iibbVendible)} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(iibbTotal)}/>} />
                
                    <Grid2 size={sizeCat} children={<Typography children='Sellos'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={moneyFormat(sellosConstruible)} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={moneyFormat(sellosVendible)} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(sellosTotal)}/>} />
                
                    <Grid2 size={sizeCat} children={<Typography children='Impuesto al cheque'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={moneyFormat(impuestoChequeConstruible)} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={moneyFormat(impuestoChequeVendible)} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(impuestoChequeTotal)}/>} />
                
                    <Grid2 size={sizeCat} children={<Typography children='Total Costos'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  textAlign={'right'} children={'-'} />} />
                    <Grid2 size={sizeVendibles} children={<Typography   textAlign={'right'} children={'-'} />} />
                    <Grid2 size={sizeTotales} children={<Typography  textAlign={'right'} children={moneyFormat(netoTotal)}/>} />
                
                
                    <Grid2 size={sizeCat} children={<Typography  sx={{...spaceBetweenRows}} fontWeight='bold' children='Margen Final'/>} />
                    <Grid2 size={sizeConstruibles} children={<Typography  sx={{...spaceBetweenRows}}  textAlign={'right'} children={moneyFormat(margenTotalDespuesImpuestosConstruible)} />} />
                    <Grid2 size={sizeVendibles} children={<Typography  sx={{...spaceBetweenRows}}   textAlign={'right'} children={moneyFormat(margenTotalDespuesImpuestosVendible)} />} />
                    <Grid2 size={sizeTotales} children={<Typography  sx={{...spaceBetweenRows}}  textAlign={'right'} children={moneyFormat(margenTotalDespuesImpuestos)}/>} />
                
                </Grid2>
       
        </div>;
        //main(series)
        // console.log({series: series.reduce((acc,x)=> {
        //    return acc + `\n ${x.label}: The cost and benefits of this variable along the month are: ${JSON.stringify(x.data?.map((j,i)=> ({ [`Mes ${i}`]: `US $ ${j}`})))}`
        //   }, "")})
        return <div style={{ width: "100%" }}>
            <Header />
            <Desglose />
        </div>
    };

    return (
        <Grid2 container spacing={0} sx={{
            flexGrow: 1,
            margin: 0,
            padding: 0,
            backgroundColor: 'white',

            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden' // Asegura que no haya scroll en el contenedor principal
        }}>
            <TopBar />

            <Grid2 container sx={{ flexGrow: 1, display: 'flex' }}>
                <Grid2 size={3} sx={{
                    display: { xs: 'none', sm: 'none', md: 'flex', lg: 'flex', xl: 'flex' }
                }}>
                    <Parameters />
                </Grid2>

                <Grid2 size={{ xs: 12, sm: 12, md: 9, lg: 9, xl: 9 }} sx={{
                    mt: { xs: '4rem', sm: '4rem', md: '2.5rem', lg: '2.5rem', xl: '2.5rem' },
                    flexGrow: 1,

                }}>
                    <Box sx={{
                        width: '100%', overflowY: 'auto', // Habilita el desplazamiento vertical
                        scrollbarWidth: 'none', // Especifico para Firefox
                        '::WebkitScrollbar': {
                            display: 'none' // Especifico para WebKit (Chrome, Safari, etc.)
                        },
                    }}> {/* Contenedor para evitar desbordes */}
                        <Reporte />
                    </Box>
                </Grid2>
            </Grid2>
        </Grid2>
    );


}

export default FormInicioProyecto;
