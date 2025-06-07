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
    createTheme,
    Tooltip,
    Divider
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

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
        h3: { fontSize: '1.25rem', fontWeight: 'bold' },
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
const MuiInput = ({ label, name, value, onChange, tooltip, ...props }) => (
    <TextField
        id={name}
        name={name}
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
export default function App() {
    // --- 狀態管理 (State) ---
    const [inputs, setInputs] = useState({
        targetStrengthPsi: 4000,
        slumpMm: 100,
        maxAggrSizeMm: 19,
        scmPercentage: 30,
        laAbrasion: 30,
        coarseAggrUnitWeight: 1600,
        fineAggrFm: 2.7,
        cementSg: 3.15,
        scmSg: 2.90,
        coarseAggrSg: 2.68,
        fineAggrSg: 2.64,
        airContent: 2.0,
        coarseMoisture: 1.2, // 新增：粗骨材含水率
        fineMoisture: 3.5,   // 新增：細骨材含水率
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
        
        const { targetStrengthPsi, slumpMm, maxAggrSizeMm, scmPercentage, laAbrasion, coarseMoisture, fineMoisture, ...rest } = inputs;
        const { coarseAggrUnitWeight, fineAggrFm, cementSg, scmSg, coarseAggrSg, fineAggrSg, airContent } = rest;

        // 步驟 A: 計算設計強度 (f'cr)，並根據洛杉磯磨損率進行調整
        const baseOverdesign = (targetStrengthPsi <= 5000) ? 1200 : 1400;
        const laAdjustment = laAbrasion > 30 ? Math.round(((laAbrasion - 30) / 5)) * 150 : 0;
        const fcr = targetStrengthPsi + baseOverdesign + laAdjustment;

        const strengths = Object.keys(WCM_TABLE).map(Number).sort((a, b) => a - b);
        const lowerStrength = strengths.filter(s => s <= fcr).pop() || strengths[0];
        const upperStrength = strengths.filter(s => s >= fcr).shift() || strengths[strengths.length - 1];
        const wcm = interpolate(fcr, lowerStrength, WCM_TABLE[lowerStrength], upperStrength, WCM_TABLE[upperStrength]);

        const aggrSizes = Object.keys(WATER_CONTENT_BASE_TABLE).map(Number).sort((a, b) => a - b);
        const lowerSize = aggrSizes.filter(s => s <= maxAggrSizeMm).pop() || aggrSizes[0];
        const upperSize = aggrSizes.filter(s => s >= maxAggrSizeMm).shift() || aggrSizes[aggrSizes.length - 1];
        const waterAtLowerSize = interpolate(slumpMm, WATER_CONTENT_BASE_TABLE[lowerSize].slumpMidLow, WATER_CONTENT_BASE_TABLE[lowerSize].waterLow, WATER_CONTENT_BASE_TABLE[lowerSize].slumpMidHigh, WATER_CONTENT_BASE_TABLE[lowerSize].waterHigh);
        const waterAtUpperSize = interpolate(slumpMm, WATER_CONTENT_BASE_TABLE[upperSize].slumpMidLow, WATER_CONTENT_BASE_TABLE[upperSize].waterLow, WATER_CONTENT_BASE_TABLE[upperSize].slumpMidHigh, WATER_CONTENT_BASE_TABLE[upperSize].waterHigh);
        const water_ssd = interpolate(maxAggrSizeMm, lowerSize, waterAtLowerSize, upperSize, waterAtUpperSize);

        const totalCementitious = water_ssd / wcm;
        const slagWeight = totalCementitious * (scmPercentage / 100);
        const cementWeight = totalCementitious - slagWeight;
        
        let coarseAggrWeight_ssd = 0;
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
            coarseAggrWeight_ssd = factor * coarseAggrUnitWeight;
        }

        const waterVolume = water_ssd / 1000;
        const cementVolume = cementWeight / (cementSg * 1000);
        const slagVolume = slagWeight / (scmSg * 1000);
        const coarseAggrVolume = isConcreteMode ? (coarseAggrWeight_ssd / (coarseAggrSg * 1000)) : 0;
        const fineAggrVolume = 1 - (waterVolume + cementVolume + slagVolume + coarseAggrVolume + (airContent / 100));

        if (fineAggrVolume < 0) {
            setError("計算錯誤：配比體積超過1m³，請檢查輸入參數(可能需水量過高)。");
            return;
        }
        
        const fineAggrWeight_ssd = fineAggrVolume * fineAggrSg * 1000;

        // *** 步驟 H: 含水率調整 ***
        const waterFromCoarse = isConcreteMode ? coarseAggrWeight_ssd * (coarseMoisture / 100) : 0;
        const waterFromFine = fineAggrWeight_ssd * (fineMoisture / 100);
        const adjustedWater = water_ssd - waterFromCoarse - waterFromFine;
        
        const coarseAggrWeight_wet = isConcreteMode ? coarseAggrWeight_ssd * (1 + coarseMoisture / 100) : 0;
        const fineAggrWeight_wet = fineAggrWeight_ssd * (1 + fineMoisture / 100);
        
        setResults({
            ssd: {
                water: water_ssd.toFixed(1),
                cement: cementWeight.toFixed(1),
                slag: slagWeight.toFixed(1),
                fine: fineAggrWeight_ssd.toFixed(1),
                coarse: coarseAggrWeight_ssd.toFixed(1),
            },
            wet: {
                water: adjustedWater.toFixed(1),
                fine: fineAggrWeight_wet.toFixed(1),
                coarse: coarseAggrWeight_wet.toFixed(1),
            },
            aggregateLabel: isConcreteMode ? "細骨材 (砂)" : "總骨材",
        });

    }, [inputs, isConcreteMode]);

    // --- 渲染 (Render) ---
    return (
            <Container maxWidth="lg" sx={{ py: 4,  minHeight: '100vh' }}>
                <header>
                    <Typography variant="h1" align="center" gutterBottom color="text.primary">
                        進階配比設計計算機
                    </Typography>
                </header>

                <Grid container spacing={4}>
                    {/* 輸入區 */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h2" gutterBottom>設計參數</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}><MuiInput label="目標強度 (psi)" name="targetStrengthPsi" type="number" value={inputs.targetStrengthPsi} onChange={handleInputChange} /></Grid>
                                <Grid item xs={12}><MuiInput label="坍度 (mm)" name="slumpMm" type="number" value={inputs.slumpMm} onChange={handleInputChange} inputProps={{ min: 25, max: 250, step: 5 }} /></Grid>
                                <Grid item xs={12}><MuiInput label="最大粒徑 (mm)" name="maxAggrSizeMm" type="number" value={inputs.maxAggrSizeMm} onChange={handleInputChange} inputProps={{ min: 0.075, max: 19, step: 0.1 }} tooltip={`模式: ${isConcreteMode ? "混凝土" : "砂漿/漿體"}`} /></Grid>
                                <Grid item xs={12}><MuiInput label="爐石粉取代率 (%)" name="scmPercentage" type="number" value={inputs.scmPercentage} onChange={handleInputChange} inputProps={{ min: 0, max: 70 }} /></Grid>
                            </Grid>
                        </Paper>
                        <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
                             <Typography variant="h2" gutterBottom>材料特性</Typography>
                             <Grid container spacing={2}>
                                {isConcreteMode && (
                                    <>
                                        <Grid item xs={12} sm={6}><MuiInput label="粗骨材乾搗單位重 (kg/m³)" name="coarseAggrUnitWeight" type="number" value={inputs.coarseAggrUnitWeight} onChange={handleInputChange} /></Grid>
                                        <Grid item xs={12} sm={6}><MuiInput label="細骨材細度模數 (FM)" name="fineAggrFm" type="number" value={inputs.fineAggrFm} onChange={handleInputChange} inputProps={{ step: 0.1 }} /></Grid>
                                        <Grid item xs={12} sm={6}>
                                            <MuiInput label="洛杉磯磨損率 (%)" name="laAbrasion" type="number" value={inputs.laAbrasion} onChange={handleInputChange} inputProps={{ min: 10, max: 60 }} InputProps={{endAdornment: (<Tooltip title="評估骨材韌性的指標，數值越高代表越軟。程式會自動補償強度。"><InfoOutlinedIcon color="action" sx={{ cursor: 'pointer' }} /></Tooltip>)}}/>
                                        </Grid>
                                        <Grid item xs={12} sm={6}><MuiInput label="粗骨材含水率 (%)" name="coarseMoisture" type="number" value={inputs.coarseMoisture} onChange={handleInputChange} inputProps={{ step: 0.1 }} /></Grid>
                                    </>
                                )}
                                <Grid item xs={12} sm={6}><MuiInput label="水泥比重 (SG)" name="cementSg" type="number" value={inputs.cementSg} onChange={handleInputChange} inputProps={{ step: 0.01 }} /></Grid>
                                <Grid item xs={12} sm={6}><MuiInput label="爐石粉比重 (SG)" name="scmSg" type="number" value={inputs.scmSg} onChange={handleInputChange} inputProps={{ step: 0.01 }} /></Grid>
                                {isConcreteMode && <Grid item xs={12} sm={6}><MuiInput label="粗骨材比重 (SG, SSD)" name="coarseAggrSg" type="number" value={inputs.coarseAggrSg} onChange={handleInputChange} inputProps={{ step: 0.01 }} /></Grid>}
                                <Grid item xs={12} sm={6}><MuiInput label={isConcreteMode ? "細骨材比重 (SG, SSD)" : "總骨材比重 (SG, SSD)"} name="fineAggrSg" type="number" value={inputs.fineAggrSg} onChange={handleInputChange} inputProps={{ step: 0.01 }} /></Grid>
                                <Grid item xs={12} sm={6}><MuiInput label={isConcreteMode ? "細骨材含水率 (%)" : "總骨材含水率 (%)"} name="fineMoisture" type="number" value={inputs.fineMoisture} onChange={handleInputChange} inputProps={{ step: 0.1 }} /></Grid>
                                <Grid item xs={12} sm={6}><MuiInput label="預估含氣量 (%)" name="airContent" type="number" value={inputs.airContent} onChange={handleInputChange} inputProps={{ step: 0.1 }} /></Grid>
                             </Grid>
                        </Paper>
                    </Grid>
                    
                    {/* 結果區 */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                            <Button variant="contained" color="primary" size="large" fullWidth onClick={calculateMix} startIcon={<CalculateIcon />} sx={{ mb: 3 }}>計算配比</Button>
                            <Typography variant="h2" gutterBottom>計算結果</Typography>
                             {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                             {results ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="h3" color="text.secondary" gutterBottom>理論配比 (SSD 狀態)</Typography>
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableBody>
                                                    <TableRow><TableCell>總用水量</TableCell><TableCell align="right">{results.ssd.water} kg</TableCell></TableRow>
                                                    <TableRow><TableCell>水泥</TableCell><TableCell align="right">{results.ssd.cement} kg</TableCell></TableRow>
                                                    <TableRow><TableCell>爐石粉</TableCell><TableCell align="right">{results.ssd.slag} kg</TableCell></TableRow>
                                                    <TableRow><TableCell>{results.aggregateLabel}</TableCell><TableCell align="right">{results.ssd.fine} kg</TableCell></TableRow>
                                                    {isConcreteMode && <TableRow><TableCell>粗骨材</TableCell><TableCell align="right">{results.ssd.coarse} kg</TableCell></TableRow>}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Divider sx={{ my: 2 }} />
                                        <Typography variant="h3" color="primary" gutterBottom>工地調整後配比 (濕潤狀態)</Typography>
                                        <TableContainer component={Paper} variant="outlined">
                                            <Table size="small">
                                                <TableBody>
                                                    <TableRow sx={{ backgroundColor: 'success.lightest' }}><TableCell><Typography fontWeight="bold">實際拌合水量</Typography></TableCell><TableCell align="right"><Typography fontWeight="bold">{results.wet.water} kg</Typography></TableCell></TableRow>
                                                    <TableRow><TableCell>水泥</TableCell><TableCell align="right">{results.ssd.cement} kg</TableCell></TableRow>
                                                    <TableRow><TableCell>爐石粉</TableCell><TableCell align="right">{results.ssd.slag} kg</TableCell></TableRow>
                                                    <TableRow><TableCell>{results.aggregateLabel} (濕潤重)</TableCell><TableCell align="right">{results.wet.fine} kg</TableCell></TableRow>
                                                    {isConcreteMode && <TableRow><TableCell>粗骨材 (濕潤重)</TableCell><TableCell align="right">{results.wet.coarse} kg</TableCell></TableRow>}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Grid>
                                </Grid>
                            ) : !error && (
                                 <Typography color="text.secondary">請輸入參數並點擊計算按鈕。</Typography>
                            )}
                            <Alert severity="info" sx={{ mt: 4 }}>
                                <AlertTitle>提示</AlertTitle>
                                本計算已包含骨材含水率之調整，工地調整後配比為實際現場應使用之重量。
                            </Alert>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
    );
}
