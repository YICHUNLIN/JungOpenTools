import React, { useState, useMemo, useCallback } from 'react';
import {
    Container,
    Grid,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    AlertTitle,
    CssBaseline,
    ThemeProvider,
    createTheme,
    Tooltip,
    Divider,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// --- MUI 主題設定 ---
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // 藍色系
        },
    },
    typography: {
        h1: { fontSize: '2.5rem', fontWeight: 'bold' },
        h2: { fontSize: '1.75rem', fontWeight: '500' },
        h3: { fontSize: '1.25rem', fontWeight: 'bold' },
    }
});

// --- 常數與數據庫 ---
// 強度(psi) vs. 水膠比(w/cm)
const WCM_TO_STRENGTH_TABLE = {
    0.41: 6000, 0.48: 5000, 0.57: 4000, 0.68: 3000, 0.82: 2000
};
const PSI_TO_KGCM2 = 0.070307; // 單位換算常數

// --- 通用工具函數 ---
const interpolate = (x, x0, y0, x1, y1) => {
    if (x1 === x0) return y0;
    // 進行線性內插或外插
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
        type="number"
        helperText={tooltip}
        InputLabelProps={{ shrink: true }}
        {...props}
    />
);

// --- 主應用程式組件 ---
export default function ConcreteInverse() {
    // --- 狀態管理 (State) ---
    const [inputs, setInputs] = useState({
        water: 180,
        cement: 280,
        slag: 60,
        coarseSand: 410,
        fineSand: 410,
        sixPartsStone: 570,
        threePartsStone: 380,
        admixtureType: 'none', 
        admixtureWeight: 3.4, // 新增：減水劑摻入量 (kg)
        // 用於體積校核的預設參數
        cementSg: 3.15,
        scmSg: 2.90,
        coarseAggrSg: 2.68,
        fineAggrSg: 2.64,
        airContent: 2.0,
    });
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    // --- 事件處理器 ---
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        const processedValue = name !== 'admixtureType' ? parseFloat(value) || 0 : value;
        setInputs(prev => ({ ...prev, [name]: processedValue }));
    }, []);

    // --- 核心計算邏輯 ---
    const calculateStrength = useCallback(() => {
        setError('');
        setResult(null);

        const { water, cement, slag, coarseSand, fineSand, sixPartsStone, threePartsStone, admixtureType, admixtureWeight, ...sgValues } = inputs;
        
        const totalCementitious = cement + slag;
        if (totalCementitious === 0) {
            setError("錯誤：膠結材料（水泥+爐石粉）總量不能為零。");
            return;
        }

        const wcm = water / totalCementitious;

        // 反向推估強度
        const wcmValues = Object.keys(WCM_TO_STRENGTH_TABLE).map(Number).sort((a, b) => a - b);
        let lowerWcm = wcmValues.filter(v => v <= wcm).pop() || wcmValues[0];
        let upperWcm = wcmValues.filter(v => v >= wcm).shift() || wcmValues[wcmValues.length - 1];
        
        let baseStrengthFcr = interpolate(wcm, lowerWcm, WCM_TO_STRENGTH_TABLE[lowerWcm], upperWcm, WCM_TO_STRENGTH_TABLE[upperWcm]);

        // 根據粗骨材級配調整強度
        const totalCoarseAggregate = sixPartsStone + threePartsStone;
        let gradationPenalty = 0;
        if (totalCoarseAggregate > 0) {
            const largeStoneRatio = sixPartsStone / totalCoarseAggregate;
            const deviation = Math.abs(largeStoneRatio - 0.65);
            if (deviation > 0.15) {
                gradationPenalty = (deviation - 0.15) * 600;
            }
        }
        
        // *** 根據減水劑類型與摻入量(kg)給予強度加成 ***
        let admixtureBonus = 0;
        if (admixtureType !== 'none' && admixtureWeight > 0) {
            const admixtureDosagePercent = (admixtureWeight / totalCementitious) * 100;
            if (admixtureType === 'normal') {
                // e.g., 0.5% dosage -> 3% bonus
                admixtureBonus = baseStrengthFcr * (admixtureDosagePercent / 100) * 6;
            } else if (admixtureType === 'high_range') {
                // e.g., 1.0% dosage -> 7% bonus
                admixtureBonus = baseStrengthFcr * (admixtureDosagePercent / 100) * 7;
            }
        }

        const adjustedFcr = baseStrengthFcr - gradationPenalty + admixtureBonus;

        // 從平均強度(f'cr)推估指定強度(f'c)
        const overdesignMargin = (adjustedFcr <= 5000 + 1200) ? 1200 : 1400;
        const estimatedFcPsi = Math.round((adjustedFcr - overdesignMargin) / 10) * 10;

        // 換算為 kgf/cm2
        const estimatedFcKgcm2 = Math.round((estimatedFcPsi * PSI_TO_KGCM2) / 5) * 5;

        // 體積校核
        const totalFineAggregate = coarseSand + fineSand;
        const waterVolume = water / 1000;
        const cementVolume = cement / (sgValues.cementSg * 1000);
        const slagVolume = slag / (sgValues.scmSg * 1000);
        const coarseAggrVolume = totalCoarseAggregate / (sgValues.coarseAggrSg * 1000);
        const fineAggrVolume = totalFineAggregate / (sgValues.fineAggrSg * 1000);
        const totalVolume = waterVolume + cementVolume + slagVolume + coarseAggrVolume + fineAggrVolume + (sgValues.airContent / 100);

        setResult({
            estimatedFcPsi: estimatedFcPsi > 0 ? estimatedFcPsi : 0,
            estimatedFcKgcm2: estimatedFcKgcm2 > 0 ? estimatedFcKgcm2 : 0,
            wcm: wcm.toFixed(3),
            totalVolume: totalVolume.toFixed(3)
        });

    }, [inputs]);

    return (
            <Container maxWidth="md" sx={{ py: 4,  minHeight: '100vh' }}>
                <header>
                    <Typography variant="h1" align="center" gutterBottom color="text.primary">
                        混凝土強度反向推估工具
                    </Typography>
                    <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
                        輸入材料用量以預估 28 天抗壓強度
                    </Typography>
                </header>

                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12} sm={10} md={8}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h2" gutterBottom>材料用量 (每立方米 m³)</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}><MuiInput label="水 (kg)" name="water" value={inputs.water} onChange={handleInputChange} /></Grid>
                                <Grid item xs={12} sm={6}><MuiInput label="水泥 (kg)" name="cement" value={inputs.cement} onChange={handleInputChange} /></Grid>
                                <Grid item xs={12} sm={6}><MuiInput label="爐石粉 (kg)" name="slag" value={inputs.slag} onChange={handleInputChange} /></Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="admixture-type-label">減水劑類型</InputLabel>
                                        <Select
                                            labelId="admixture-type-label"
                                            id="admixtureType"
                                            name="admixtureType"
                                            value={inputs.admixtureType}
                                            label="減水劑類型"
                                            onChange={handleInputChange}
                                        >
                                            <MenuItem value="none">無</MenuItem>
                                            <MenuItem value="normal">普通型 (減水率 5-12%)</MenuItem>
                                            <MenuItem value="high_range">高性能 (強塑劑, 12-30%)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {inputs.admixtureType !== 'none' && (
                                    <Grid item xs={12}>
                                        <MuiInput label="減水劑摻入量 (kg)" name="admixtureWeight" type="number" value={inputs.admixtureWeight} onChange={handleInputChange} inputProps={{ step: 0.1 }} />
                                    </Grid>
                                )}
                                <Grid item xs={12}><Divider>骨材</Divider></Grid>
                                <Grid item xs={12} sm={6}><MuiInput label="六分石 (3/4&quot;) (kg)" name="sixPartsStone" value={inputs.sixPartsStone} onChange={handleInputChange} /></Grid>
                                <Grid item xs={12} sm={6}><MuiInput label="三分石 (3/8&quot;) (kg)" name="threePartsStone" value={inputs.threePartsStone} onChange={handleInputChange} /></Grid>
                                <Grid item xs={12} sm={6}><MuiInput label="粗砂 (kg)" name="coarseSand" value={inputs.coarseSand} onChange={handleInputChange} /></Grid>
                                <Grid item xs={12} sm={6}><MuiInput label="細砂 (kg)" name="fineSand" value={inputs.fineSand} onChange={handleInputChange} /></Grid>
                            </Grid>
                            <Button variant="contained" color="primary" size="large" fullWidth onClick={calculateStrength} startIcon={<SpeedIcon />} sx={{ mt: 3 }}>預估強度</Button>
                        </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={10} md={8}>
                         {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                         {result && (
                            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                                <Typography color="text.secondary">預估 28 天指定強度 (f'c)</Typography>
                                <Typography variant="h2" component="p" color="primary" sx={{ my: 1, fontSize: '3.5rem', lineHeight: 1.1 }}>
                                    {result.estimatedFcPsi} <span style={{fontSize: '1.5rem'}}>psi</span>
                                </Typography>
                                <Typography color="text.secondary" sx={{ mt: -1, mb: 2, fontSize: '1.1rem' }}>
                                    (約 {result.estimatedFcKgcm2} kgf/cm²)
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'left' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">水膠比 (w/cm)</Typography>
                                        <Typography fontWeight="bold">{result.wcm}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">總體積校核</Typography>
                                        <Typography fontWeight="bold">{result.totalVolume} m³</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                         )}
                         <Alert severity="info" sx={{ mt: 2 }}>
                            <AlertTitle>計算假設</AlertTitle>
                            此預估值已考量減水劑、骨材級配與標準安全餘裕 (Overdesign)，並非材料能達到的絕對最大強度。體積校核應接近 1.0 m³。
                        </Alert>
                    </Grid>
                </Grid>
            </Container>
    );
}
