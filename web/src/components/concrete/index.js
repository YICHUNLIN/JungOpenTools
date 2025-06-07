import React, { useState, useMemo, useCallback } from 'react';
import {
    Container,
    Grid,
    Paper,
    TextField,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    AlertTitle,
    CssBaseline,
    ThemeProvider,
    createTheme
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';

// --- MUI 主題設定 ---
const theme = createTheme({
    palette: {
        primary: {
            main: '#2e7d32', // 綠色系
        },
    },
    typography: {
        h1: { fontSize: '2.5rem', fontWeight: 'bold' },
        h2: { fontSize: '1.75rem', fontWeight: '500' },
    }
});

// --- 常數與數據庫 ---
const WCM_TABLE = { 6000: 0.41, 5000: 0.48, 4000: 0.57, 3000: 0.68, 2000: 0.82 };
const WATER_CONTENT_BASE_TABLE = {
    4.75: { slumpMidLow: 37.5, waterLow: 225, slumpMidHigh: 162.5, waterHigh: 255 },
    9.5:  { slumpMidLow: 37.5, waterLow: 207, slumpMidHigh: 162.5, waterHigh: 243 },
    12.5: { slumpMidLow: 37.5, waterLow: 199, slumpMidHigh: 162.5, waterHigh: 228 },
    19:   { slumpMidLow: 37.5, waterLow: 190, slumpMidHigh: 162.5, waterHigh: 216 },
};
const COARSE_AGGR_FACTOR_TABLE = {
    9.5:  { '2.6': 0.50, '2.8': 0.48, '3.0': 0.46 },
    12.5: { '2.6': 0.59, '2.8': 0.57, '3.0': 0.55 },
    19:   { '2.6': 0.66, '2.8': 0.64, '3.0': 0.62 },
};

// --- 通用工具函數 ---
const interpolate = (x, x0, y0, x1, y1) => {
    if (x1 === x0) return y0;
    return y0 + (x - x0) * (y1 - y0) / (x1 - x0);
};

// --- 可重用UI組件 ---
const MuiInput = ({ label, id, value, onChange, tooltip, ...props }) => (
    <TextField
        id={id}
        name={id}
        label={label}
        value={value}
        onChange={onChange}
        variant="outlined"
        size="small"
        fullWidth
        helperText={tooltip}
        InputLabelProps={{ shrink: true }}
        {...props}
    />
);


// --- 主應用程式組件 ---
export default function Concrete() {
    // --- 狀態管理 (State) ---
    const [inputs, setInputs] = useState({
        targetStrengthPsi: 4000,
        slumpMm: 100,
        maxAggrSizeMm: 19,
        scmPercentage: 30,
        coarseAggrUnitWeight: 1600,
        fineAggrFm: 2.7,
        cementSg: 3.15,
        scmSg: 2.90,
        coarseAggrSg: 2.68,
        fineAggrSg: 2.64,
        airContent: 2.0,
    });
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    // --- 衍生狀態 (Derived State) ---
    const isConcreteMode = useMemo(() => inputs.maxAggrSizeMm >= 4.75, [inputs.maxAggrSizeMm]);

    // --- 事件處理器 ---
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    }, []);

    // --- 核心計算邏輯 ---
    const calculateMix = useCallback(() => {
        setError('');
        setResults(null);
        
        const { targetStrengthPsi, slumpMm, maxAggrSizeMm, scmPercentage, ...rest } = inputs;
        const { coarseAggrUnitWeight, fineAggrFm, cementSg, scmSg, coarseAggrSg, fineAggrSg, airContent } = rest;

        const fcr = (targetStrengthPsi <= 5000) ? targetStrengthPsi + 1200 : targetStrengthPsi + 1400;

        const strengths = Object.keys(WCM_TABLE).map(Number).sort((a, b) => a - b);
        const lowerStrength = strengths.filter(s => s <= fcr).pop() || strengths[0];
        const upperStrength = strengths.filter(s => s >= fcr).shift() || strengths[strengths.length - 1];
        const wcm = interpolate(fcr, lowerStrength, WCM_TABLE[lowerStrength], upperStrength, WCM_TABLE[upperStrength]);

        const aggrSizes = Object.keys(WATER_CONTENT_BASE_TABLE).map(Number).sort((a, b) => a - b);
        const lowerSize = aggrSizes.filter(s => s <= maxAggrSizeMm).pop() || aggrSizes[0];
        const upperSize = aggrSizes.filter(s => s >= maxAggrSizeMm).shift() || aggrSizes[aggrSizes.length - 1];
        const waterAtLowerSize = interpolate(slumpMm, WATER_CONTENT_BASE_TABLE[lowerSize].slumpMidLow, WATER_CONTENT_BASE_TABLE[lowerSize].waterLow, WATER_CONTENT_BASE_TABLE[lowerSize].slumpMidHigh, WATER_CONTENT_BASE_TABLE[lowerSize].waterHigh);
        const waterAtUpperSize = interpolate(slumpMm, WATER_CONTENT_BASE_TABLE[upperSize].slumpMidLow, WATER_CONTENT_BASE_TABLE[upperSize].waterLow, WATER_CONTENT_BASE_TABLE[upperSize].slumpMidHigh, WATER_CONTENT_BASE_TABLE[upperSize].waterHigh);
        const water = interpolate(maxAggrSizeMm, lowerSize, waterAtLowerSize, upperSize, waterAtUpperSize);

        const totalCementitious = water / wcm;
        const slagWeight = totalCementitious * (scmPercentage / 100);
        const cementWeight = totalCementitious - slagWeight;
        
        let coarseAggrWeight = 0;
        if (isConcreteMode) {
            const concreteAggrSizes = Object.keys(COARSE_AGGR_FACTOR_TABLE).map(Number).sort((a, b) => a - b);
            const lowerConcreteSize = concreteAggrSizes.filter(s => s <= maxAggrSizeMm).pop() || concreteAggrSizes[0];
            const upperConcreteSize = concreteAggrSizes.filter(s => s >= maxAggrSizeMm).shift() || concreteAggrSizes[concreteAggrSizes.length - 1];
            const fmLevels = Object.keys(COARSE_AGGR_FACTOR_TABLE[lowerConcreteSize]).map(Number).sort((a, b) => a - b);
            const lowerFm = fmLevels.filter(f => f <= fineAggrFm).pop() || fmLevels[0];
            const upperFm = fmLevels.filter(f => f >= fineAggrFm).shift() || fmLevels[fmLevels.length - 1];
            const factorAtLowerSize = interpolate(fineAggrFm, lowerFm, COARSE_AGGR_FACTOR_TABLE[lowerConcreteSize][lowerFm.toFixed(1)], upperFm, COARSE_AGGR_FACTOR_TABLE[lowerConcreteSize][upperFm.toFixed(1)]);
            const factorAtUpperSize = interpolate(fineAggrFm, lowerFm, COARSE_AGGR_FACTOR_TABLE[upperConcreteSize][lowerFm.toFixed(1)], upperFm, COARSE_AGGR_FACTOR_TABLE[upperConcreteSize][upperFm.toFixed(1)]);
            const factor = interpolate(maxAggrSizeMm, lowerConcreteSize, factorAtLowerSize, upperConcreteSize, factorAtUpperSize);
            coarseAggrWeight = factor * coarseAggrUnitWeight;
        }

        const waterVolume = water / 1000;
        const cementVolume = cementWeight / (cementSg * 1000);
        const slagVolume = slagWeight / (scmSg * 1000);
        const coarseAggrVolume = isConcreteMode ? (coarseAggrWeight / (coarseAggrSg * 1000)) : 0;
        const fineAggrVolume = 1 - (waterVolume + cementVolume + slagVolume + coarseAggrVolume + (airContent / 100));

        if (fineAggrVolume < 0) {
            setError("計算錯誤：配比體積超過1m³，請檢查輸入參數(可能需水量過高)。");
            return;
        }
        
        const fineAggrWeight = fineAggrVolume * fineAggrSg * 1000;

        setResults({
            water: water.toFixed(1), cementWeight: cementWeight.toFixed(1), slagWeight: slagWeight.toFixed(1), fineAggrWeight: fineAggrWeight.toFixed(1),
            coarseAggrWeight: isConcreteMode ? coarseAggrWeight.toFixed(1) : 0,
            aggregateLabel: isConcreteMode ? "細骨材 (砂)" : "總骨材",
            totalWeight: (water + cementWeight + slagWeight + fineAggrWeight + coarseAggrWeight).toFixed(1),
        });

    }, [inputs, isConcreteMode]);

    // --- 渲染 (Render) ---
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                <header>
                    <Typography variant="h1" align="center" gutterBottom color="text.primary">
                        進階配比設計計算機
                    </Typography>
                    <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
                        Material-UI 版本 / 全粒徑與全坍度支援
                    </Typography>
                </header>

                <Grid container spacing={4}>
                    {/* 輸入區 */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h2" gutterBottom>設計參數</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}><MuiInput label="目標強度 (psi)" id="targetStrengthPsi" type="number" value={inputs.targetStrengthPsi} onChange={handleInputChange} /></Grid>
                                <Grid item xs={12}><MuiInput label="坍度 (mm)" id="slumpMm" type="number" value={inputs.slumpMm} onChange={handleInputChange} inputProps={{ min: 25, max: 250, step: 5 }} /></Grid>
                                <Grid item xs={12}><MuiInput label="最大粒徑 (mm)" id="maxAggrSizeMm" type="number" value={inputs.maxAggrSizeMm} onChange={handleInputChange} inputProps={{ min: 0.075, max: 19, step: 0.1 }} tooltip={`模式: ${isConcreteMode ? "混凝土" : "砂漿/漿體"}`} /></Grid>
                                <Grid item xs={12}><MuiInput label="爐石粉取代率 (%)" id="scmPercentage" type="number" value={inputs.scmPercentage} onChange={handleInputChange} inputProps={{ min: 0, max: 70 }} /></Grid>
                            </Grid>
                        </Paper>
                        <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
                             <Typography variant="h2" gutterBottom>材料特性</Typography>
                             <Grid container spacing={2}>
                                {isConcreteMode && (
                                    <>
                                        <Grid item xs={12} sm={6}><MuiInput label="粗骨材乾搗單位重 (kg/m³)" id="coarseAggrUnitWeight" type="number" value={inputs.coarseAggrUnitWeight} onChange={handleInputChange} /></Grid>
                                        <Grid item xs={12} sm={6}><MuiInput label="細骨材細度模數 (FM)" id="fineAggrFm" type="number" value={inputs.fineAggrFm} onChange={handleInputChange} inputProps={{ step: 0.1 }} /></Grid>
                                    </>
                                )}
                                <Grid item xs={12} sm={6}><MuiInput label="水泥比重 (SG)" id="cementSg" type="number" value={inputs.cementSg} onChange={handleInputChange} inputProps={{ step: 0.01 }} /></Grid>
                                <Grid item xs={12} sm={6}><MuiInput label="爐石粉比重 (SG)" id="scmSg" type="number" value={inputs.scmSg} onChange={handleInputChange} inputProps={{ step: 0.01 }} /></Grid>
                                {isConcreteMode && <Grid item xs={12} sm={6}><MuiInput label="粗骨材比重 (SG, SSD)" id="coarseAggrSg" type="number" value={inputs.coarseAggrSg} onChange={handleInputChange} inputProps={{ step: 0.01 }} /></Grid>}
                                <Grid item xs={12} sm={6}><MuiInput label={isConcreteMode ? "細骨材比重 (SG, SSD)" : "總骨材比重 (SG, SSD)"} id="fineAggrSg" type="number" value={inputs.fineAggrSg} onChange={handleInputChange} inputProps={{ step: 0.01 }} /></Grid>
                                <Grid item xs={12} sm={6}><MuiInput label="預估含氣量 (%)" id="airContent" type="number" value={inputs.airContent} onChange={handleInputChange} inputProps={{ step: 0.1 }} /></Grid>
                             </Grid>
                        </Paper>
                    </Grid>
                    
                    {/* 結果區 */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                            <Button variant="contained" color="primary" size="large" fullWidth onClick={calculateMix} startIcon={<CalculateIcon />} sx={{ mb: 3 }}>計算配比</Button>
                            <Typography variant="h2" gutterBottom>計算結果 (每立方米 m³)</Typography>
                             {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                             {results ? (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><Typography fontWeight="bold">材料</Typography></TableCell>
                                                <TableCell align="right"><Typography fontWeight="bold">建議用量 (kg)</Typography></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            <TableRow><TableCell>水 (Water)</TableCell><TableCell align="right">{results.water}</TableCell></TableRow>
                                            <TableRow><TableCell>水泥 (Cement)</TableCell><TableCell align="right">{results.cementWeight}</TableCell></TableRow>
                                            <TableRow><TableCell>爐石粉 (Slag)</TableCell><TableCell align="right">{results.slagWeight}</TableCell></TableRow>
                                            <TableRow><TableCell>{results.aggregateLabel}</TableCell><TableCell align="right">{results.fineAggrWeight}</TableCell></TableRow>
                                            {isConcreteMode && <TableRow><TableCell>粗骨材 (碎石)</TableCell><TableCell align="right">{results.coarseAggrWeight}</TableCell></TableRow>}
                                            <TableRow sx={{ '& > *': { borderBottom: 'unset', fontWeight: 'bold', backgroundColor: 'action.hover' } }}><TableCell>總計</TableCell><TableCell align="right">{results.totalWeight}</TableCell></TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : !error && (
                                 <Typography color="text.secondary">請輸入參數並點擊計算按鈕。</Typography>
                            )}
                            <Alert severity="warning" sx={{ mt: 4 }}>
                                <AlertTitle>重要聲明</AlertTitle>
                                <ul>
                                    <li>本程式結果為理論起始配比，僅供學術參考，實際應用前務必進行試拌。</li>
                                    <li>粒徑低於9.5mm的用水量為外插估計值，風險自負。</li>
                                    <li>計算未考慮骨材含水率，工地現場必須進行調整。</li>
                                </ul>
                            </Alert>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </ThemeProvider>
    );
}
