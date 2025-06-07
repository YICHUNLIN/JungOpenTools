import React, { useState, useEffect, useRef } from 'react';
import {
    Container, Box, Typography, Grid, TextField, Button,
    Accordion, AccordionSummary, AccordionDetails, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox,
    Tabs, Tab, Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// --- 組態設定 ---
const MATERIALS = {
    'coarse-3/4': { name: '六分石 (3/4")', defaultProportion: 30 },
    'coarse-3/8': { name: '三分石 (3/8")', defaultProportion: 25 },
    'coarse-1/4': { name: '二分石 (1/4")', defaultProportion: 0 },
    'fine': { name: '砂', defaultProportion: 40 },
    'filler': { name: '礦物填料', defaultProportion: 5 },
};

const SIEVES = [
    { id: 'sieve-1', name: '1"' }, { id: 'sieve-3/4', name: '3/4"' },
    { id: 'sieve-1/2', name: '1/2"' }, { id: 'sieve-3/8', name: '3/8"' },
    { id: 'sieve-no4', name: '#4' }, { id: 'sieve-no8', name: '#8' },
    { id: 'sieve-no16', name: '#16' }, { id: 'sieve-no30', name: '#30' },
    { id: 'sieve-no50', name: '#50' }, { id: 'sieve-no100', name: '#100' },
    { id: 'sieve-no200', name: '#200' },
];

const DEFAULT_GRADATIONS = {
    'coarse-3/4': [100, 95, 55, 25, 5, 2, 1, 1, 1, 1, 1],
    'coarse-3/8': [100, 100, 100, 95, 30, 5, 2, 1, 1, 1, 1],
    'coarse-1/4': [100, 100, 100, 100, 80, 20, 5, 2, 1, 1, 1],
    'fine': [100, 100, 100, 100, 100, 95, 80, 55, 30, 15, 8],
    'filler': [100, 100, 100, 100, 100, 100, 100, 100, 100, 98, 90],
};

const DEFAULT_SPEC_LIMITS = {
    lower: [100, 90, null, 60, 42, 30, 20, 12, 6, 3, 2],
    upper: [100, 100, null, 85, 65, 50, 38, 28, 18, 11, 7],
};


// --- 子組件 ---

// 使用 Canvas API 繪製圖表的組件
const CanvasGradationChart = ({ chartData }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !chartData) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // 為了清晰度，設定畫布的實際大小和 CSS 大小
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const padding = { top: 40, right: 20, bottom: 50, left: 60 };
        const chartWidth = canvas.width / dpr - padding.left - padding.right;
        const chartHeight = canvas.height / dpr - padding.top - padding.bottom;
        const { labels, datasets } = chartData;

        // 清除畫布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 繪製座標軸標題和圖表標題
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px "Noto Sans TC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('級配曲線圖', canvas.width / dpr / 2, padding.top / 2);

        ctx.font = '12px "Noto Sans TC", sans-serif';
        ctx.fillText('篩號 (Sieve Size)', padding.left + chartWidth / 2, canvas.height / dpr - 10);
        ctx.save();
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('通過百分比 (%)', - (padding.top + chartHeight / 2), 20);
        ctx.restore();


        // 繪製網格線和標籤
        ctx.strokeStyle = '#e0e0e0';
        ctx.fillStyle = '#666';
        ctx.lineWidth = 1;
        ctx.font = '10px "Noto Sans TC", sans-serif';

        // Y 軸網格線
        ctx.textAlign = 'right';
        for (let i = 0; i <= 10; i++) {
            const y = padding.top + chartHeight - (i / 10) * chartHeight;
            const value = i * 10;
            ctx.fillText(value, padding.left - 10, y + 3);
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartWidth, y);
            ctx.stroke();
        }

        // X 軸網格線
        ctx.textAlign = 'center';
        labels.forEach((label, i) => {
            const x = padding.left + chartWidth - (i / (labels.length - 1)) * chartWidth;
            ctx.fillText(label, x, padding.top + chartHeight + 20);
        });

        // 繪製數據線條
        datasets.forEach(dataset => {
            ctx.strokeStyle = dataset.borderColor;
            ctx.lineWidth = dataset.borderWidth;
            ctx.beginPath();
            let firstPoint = true;

            dataset.data.forEach((point, i) => {
                if (point === null) {
                    // 如果點為空，結束當前線段，為下一段做準備
                    ctx.stroke();
                    firstPoint = true;
                    return;
                }
                const x = padding.left + chartWidth - (i / (labels.length - 1)) * chartWidth;
                const y = padding.top + chartHeight - (point / 100) * chartHeight;

                if (firstPoint) {
                    ctx.moveTo(x, y);
                    firstPoint = false;
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
        });
        
    }, [chartData]);

    return <Box sx={{ height: 400, width: '100%' }}><canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas></Box>;
};


// --- 主應用程式組件 ---

function AsphaltConcrete() {
    // --- State 管理 ---
    const [totalWeight, setTotalWeight] = useState(2000);
    const [asphaltBinder, setAsphaltBinder] = useState(5);
    const [proportions, setProportions] = useState(
        Object.keys(MATERIALS).reduce((acc, key) => ({ ...acc, [key]: MATERIALS[key].defaultProportion }), {})
    );
    const [gradations, setGradations] = useState(DEFAULT_GRADATIONS);
    const [specLimits, setSpecLimits] = useState(() =>
        SIEVES.map((sieve, i) => ({
            sieveId: sieve.id,
            sieveName: sieve.name,
            lower: DEFAULT_SPEC_LIMITS.lower[i],
            upper: DEFAULT_SPEC_LIMITS.upper[i],
            enabled: DEFAULT_SPEC_LIMITS.lower[i] !== null
        }))
    );
    
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    // --- 事件處理函式 ---

    const handleProportionChange = (key, value) => {
        setProportions(prev => ({ ...prev, [key]: value }));
    };

    const handleGradationChange = (materialKey, sieveIndex, value) => {
        setGradations(prev => {
            const newGrads = { ...prev };
            newGrads[materialKey][sieveIndex] = value;
            return newGrads;
        });
    };

    const handleSpecChange = (sieveIndex, field, value) => {
        setSpecLimits(prev => {
            const newSpecs = [...prev];
            newSpecs[sieveIndex][field] = value;
            return newSpecs;
        });
    };

    const handleCalculate = () => {
        setError('');
        setResults(null);

        // 驗證
        const totalProportion = Object.values(proportions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        if (Math.round(totalProportion) !== 100) {
            setError(`集料摻配比例總和必須為 100%，目前為 ${totalProportion}%。`);
            return;
        }

        // 計算合成級配
        const combinedGradation = SIEVES.map((_, i) =>
            Object.keys(MATERIALS).reduce((sum, key) =>
                sum + (proportions[key] / 100) * gradations[key][i], 0
            )
        );

        // 整理結果
        const analysisResult = combinedGradation.map((value, i) => {
            const spec = specLimits[i];
            let status = 'na'; // Not Applicable
            if (spec.enabled) {
                status = (value >= spec.lower && value <= spec.upper) ? 'pass' : 'fail';
            }
            return {
                sieveName: spec.sieveName,
                lower: spec.lower,
                upper: spec.upper,
                combined: value,
                status: status,
            };
        });

        // 計算拌合重量
        const totalAggregateWeight = totalWeight * (1 - asphaltBinder / 100);
        const asphaltWeight = totalWeight - totalAggregateWeight;
        const batchWeights = Object.keys(proportions).reduce((acc, key) => ({
            ...acc,
            [key]: totalAggregateWeight * (proportions[key] / 100)
        }), { asphaltBinder: asphaltWeight });

        // 準備圖表資料
        const chartData = {
            labels: SIEVES.map(s => s.name),
            datasets: [
                {
                    label: '規範上限', data: specLimits.map(s => s.enabled ? s.upper : null),
                    borderColor: 'rgba(255, 99, 132, 0.5)', borderWidth: 2, 
                },
                {
                    label: '規範下限', data: specLimits.map(s => s.enabled ? s.lower : null),
                    borderColor: 'rgba(255, 99, 132, 0.5)', borderWidth: 2, 
                },
                {
                    label: '合成級配', data: combinedGradation,
                    borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 3,
                }
            ]
        };
        
        setResults({ analysis: analysisResult, weights: batchWeights, chartData });
    };

    const proportionTotal = Object.values(proportions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom fontWeight="bold">
                    進階瀝青混凝土級配與配比計算機
                </Typography>
                <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
                    整合篩分析、級配規範與拌合重量計算 (React & MUI 版)
                </Typography>

                {/* --- 全域參數 --- */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="目標總重量 (公斤)" type="number" value={totalWeight}
                            onChange={(e) => setTotalWeight(parseFloat(e.target.value) || 0)} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="瀝青膠泥含量 (%)" type="number" value={asphaltBinder}
                            onChange={(e) => setAsphaltBinder(parseFloat(e.target.value) || 0)} />
                    </Grid>
                </Grid>

                {/* --- Accordion Sections --- */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* 步驟 1: 集料摻配比例 */}
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight="medium">步驟 1: 設定集料摻配比例 (%)</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                {Object.keys(MATERIALS).map(key => (
                                    <Grid item xs={6} md={4} lg={2.4} key={key}>
                                        <TextField fullWidth label={MATERIALS[key].name} type="number"
                                            value={proportions[key]}
                                            onChange={e => handleProportionChange(key, parseFloat(e.target.value) || 0)} />
                                    </Grid>
                                ))}
                            </Grid>
                            <Typography align="right" variant="h6" sx={{ mt: 2 }}
                                color={Math.round(proportionTotal) === 100 ? 'green' : 'error'}>
                                總計: {proportionTotal.toFixed(1)}%
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                    
                    {/* 步驟 2: 材料篩分析 */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight="medium">步驟 2: 輸入各材料篩分析資料 (% 通過率)</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>篩號</TableCell>
                                            {Object.values(MATERIALS).map(m => <TableCell key={m.name} align="right" sx={{ fontWeight: 'bold' }}>{m.name}</TableCell>)}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {SIEVES.map((sieve, sieveIndex) => (
                                            <TableRow key={sieve.id}>
                                                <TableCell>{sieve.name}</TableCell>
                                                {Object.keys(MATERIALS).map(key => (
                                                    <TableCell key={key} align="right">
                                                        <TextField type="number" size="small" sx={{ width: '80px' }}
                                                            value={gradations[key][sieveIndex]}
                                                            onChange={e => handleGradationChange(key, sieveIndex, parseFloat(e.target.value) || 0)}
                                                            inputProps={{ style: { textAlign: 'right' } }} />
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>

                    {/* 步驟 3: 規範上下限 */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight="medium">步驟 3: 設定級配規範上下限 (%)</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>啟用</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>篩號</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>規範下限</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>規範上限</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {specLimits.map((spec, i) => (
                                            <TableRow key={spec.sieveId}>
                                                <TableCell><Checkbox checked={spec.enabled} onChange={e => handleSpecChange(i, 'enabled', e.target.checked)} /></TableCell>
                                                <TableCell>{spec.sieveName}</TableCell>
                                                <TableCell><TextField type="number" size="small" fullWidth disabled={!spec.enabled} value={spec.lower ?? ''} onChange={e => handleSpecChange(i, 'lower', parseFloat(e.target.value) || 0)} inputProps={{ style: { textAlign: 'right' } }} /></TableCell>
                                                <TableCell><TextField type="number" size="small" fullWidth disabled={!spec.enabled} value={spec.upper ?? ''} onChange={e => handleSpecChange(i, 'upper', parseFloat(e.target.value) || 0)} inputProps={{ style: { textAlign: 'right' } }} /></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>
                </Box>

                {/* --- 計算按鈕 --- */}
                <Button variant="contained" size="large" fullWidth onClick={handleCalculate} sx={{ my: 4 }}>
                    執行計算與分析
                </Button>

                {/* --- 結果顯示區 --- */}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {results && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="h5" gutterBottom>分析結果</Typography>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                                <Tab label="級配曲線圖" />
                                <Tab label="級配分析表" />
                                <Tab label="材料拌合重量" />
                            </Tabs>
                        </Box>
                        
                        {/* 級配曲線圖 */}
                        <Box hidden={activeTab !== 0} sx={{ pt: 3 }}>
                            <CanvasGradationChart chartData={results.chartData} />
                        </Box>
                        
                        {/* 級配分析表 */}
                        <Box hidden={activeTab !== 1} sx={{ pt: 3 }}>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ '& > th': { fontWeight: 'bold' } }}>
                                            <TableCell>篩號</TableCell>
                                            <TableCell align="right">規範下限</TableCell>
                                            <TableCell align="right">合成級配</TableCell>
                                            <TableCell align="right">規範上限</TableCell>
                                            <TableCell align="center">狀態</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {results.analysis.map(row => (
                                            <TableRow key={row.sieveName} sx={{
                                                backgroundColor: row.status === 'pass' ? '#e8f5e9' : (row.status === 'fail' ? '#ffebee' : 'inherit')
                                            }}>
                                                <TableCell>{row.sieveName}</TableCell>
                                                <TableCell align="right">{row.lower !== null ? row.lower.toFixed(1) : '–'}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{row.combined.toFixed(1)}</TableCell>
                                                <TableCell align="right">{row.upper !== null ? row.upper.toFixed(1) : '–'}</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold', color: row.status === 'pass' ? 'green' : (row.status === 'fail' ? 'red' : 'grey') }}>
                                                    {row.status === 'pass' ? '合格' : (row.status === 'fail' ? '不合格' : '不適用')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>

                        {/* 材料拌合重量 */}
                        <Box hidden={activeTab !== 2} sx={{ pt: 3, maxWidth: 500, mx: 'auto' }}>
                            <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="h6" gutterBottom>總目標重量: {totalWeight.toFixed(2)} 公斤</Typography>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography color="secondary.main" fontWeight="bold">瀝青膠泥重量:</Typography>
                                    <Typography color="secondary.main" fontWeight="bold">{results.weights.asphaltBinder.toFixed(2)} 公斤</Typography>
                                </Box>
                                {Object.keys(MATERIALS).map(key => (
                                     <Box key={key} display="flex" justifyContent="space-between">
                                        <Typography>{MATERIALS[key].name}:</Typography>
                                        <Typography fontWeight="medium">{results.weights[key].toFixed(2)} 公斤</Typography>
                                    </Box>
                                ))}
                            </Paper>
                        </Box>
                    </Paper>
                )}
            </Paper>
        </Container>
    );
}

export default AsphaltConcrete;
