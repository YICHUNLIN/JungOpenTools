import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  IconButton, 
  Stack, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions,
  Alert,
  GlobalStyles,
  Tooltip
} from '@mui/material';

// --- 科技感主題設定 ---
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff', 
    },
    secondary: {
      main: '#00f3ff', // 科技青色：用於高亮滾動過程
    },
    background: {
      default: '#000000', 
      paper: '#0a0a0a',   
    },
    divider: '#1f1f23',
    error: {
      main: '#ff003c',
    },
    success: {
      main: '#00ffaa',
    }
  },
  typography: {
    fontFamily: '"JetBrains Mono", "Roboto Mono", "Share Tech Mono", monospace',
    h1: { fontWeight: 900, letterSpacing: '-0.02em' },
    h2: { fontWeight: 900, letterSpacing: '-0.02em' },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' },
  },
  shape: {
    borderRadius: 0, 
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '0.2em',
          borderRadius: 0,
          borderWidth: '1px',
          '&:hover': {
            borderWidth: '1px',
            boxShadow: '0 0 15px rgba(255,255,255,0.3)',
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 0,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          '& fieldset': { borderColor: '#1f1f23' },
          '&:hover fieldset': { borderColor: '#3f3f46 !important' },
        }
      }
    }
  },
});

const Icons = {
  Trophy: () => (
    <svg viewBox="0 0 256 256" width="20" height="20" fill="currentColor">
      <path d="M168,24H88a8,8,0,0,0-8,8V56H40A32,32,0,0,0,8,88v24a32,32,0,0,0,32,32h8.51a48,48,0,0,0,45.41,35.79A40.06,40.06,0,0,0,120,207.13V224H104a8,8,0,0,0,0,16h48a8,8,0,0,0,0-16H136V207.13a40.06,40.06,0,0,0,26.08-27.34A48,48,0,0,0,207.49,144H216a32,32,0,0,0,32-32V88a32,32,0,0,0-32-32H176V32A8,8,0,0,0,168,24ZM40,128a16,16,0,0,1-16-16V88A16,16,0,0,1,40,72h8V128Zm176-16a16,16,0,0,1-16,16h-8.51l.51-56h8a16,16,0,0,1,16,16ZM96,144V72h64v72a32,32,0,0,1-64,0Z"></path>
    </svg>
  ),
  UserPlus: () => (
    <svg viewBox="0 0 256 256" width="16" height="16" fill="currentColor">
      <path d="M256,128a8,8,0,0,1-8,8h-24v24a8,8,0,0,1-16,0v-24h-24a8,8,0,0,1,0-16h24v-24a8,8,0,0,1,16,0v24h24A8,8,0,0,1,256,128Zm-88,16a72,72,0,1,1-72-72A72.08,72.08,0,0,1,168,144Zm-16,0a56,56,0,1,0-56,56A56.06,56.06,0,0,0,152,144Zm-56,72c-42.34,0-80,24.18-80,56a8,8,0,0,0,16,0c0-21.64,30.31-40,64-40s64,18.36,64,40a8,8,0,0,0,16,0C176,240.18,138.34,216,96,216Z"></path>
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 256 256" width="14" height="14" fill="currentColor">
      <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
    </svg>
  ),
  Minus: () => (
    <svg viewBox="0 0 256 256" width="18" height="18" fill="currentColor">
      <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"></path>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 256 256" width="18" height="18" fill="currentColor">
      <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
    </svg>
  ),
  MagicWand: () => (
    <svg viewBox="0 0 256 256" width="20" height="20" fill="currentColor">
      <path d="M213.66,42.34a8,8,0,0,0-11.32,0L42.34,202.34a8,8,0,0,0,11.32,11.32L213.66,53.66A8,8,0,0,0,213.66,42.34ZM192,84.69,171.31,64,192,43.31,212.69,64ZM88,144a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16H80A8,8,0,0,1,88,144Zm40,40a8,8,0,0,1,8,8v32a8,8,0,0,1-16,0V192A8,8,0,0,1,128,184ZM80,32a8,8,0,0,0-8,8V72a8,8,0,0,0,16,0V40A8,8,0,0,0,80,32ZM40,88A8,8,0,0,0,40,72H8A8,8,0,0,0,8,88H40Z"></path>
    </svg>
  ),
  History: () => (
    <svg viewBox="0 0 256 256" width="14" height="14" fill="currentColor">
      <path d="M128,24a104,104,0,1,0,104,104A104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
    </svg>
  )
};

const App = () => {
  const [namesInput, setNamesInput] = useState("");
  const [batchCount, setBatchCount] = useState(1);
  const [history, setHistory] = useState([]);
  const [currentWinners, setCurrentWinners] = useState([]); 
  const [isSpinning, setIsSpinning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState("");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('lucky_draw_history_v3');
      const savedNames = localStorage.getItem('lucky_draw_names_v3');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      if (savedNames) setNamesInput(savedNames);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    localStorage.setItem('lucky_draw_history_v3', JSON.stringify(history));
    localStorage.setItem('lucky_draw_names_v3', namesInput);
  }, [history, namesInput]);

  const getParsedNames = useCallback(() => {
    const names = namesInput.split(',').map(name => name.trim()).filter(name => name !== "");
    return [...new Set(names)];
  }, [namesInput]);

  const allNamesList = useMemo(() => getParsedNames(), [getParsedNames]);
  const historySet = useMemo(() => new Set(history), [history]);
  const remainingCount = allNamesList.filter(name => !historySet.has(name)).length;

  // 動態計算縮放比例
  const winnerConfig = useMemo(() => {
    if (batchCount <= 1) return { variant: "h1", p: { xs: 8, md: 12 }, grid: 12 };
    if (batchCount <= 4) return { variant: "h2", p: { xs: 4, md: 8 }, grid: 6 };
    if (batchCount <= 12) return { variant: "h4", p: { xs: 2, md: 4 }, grid: 4 };
    if (batchCount <= 20) return { variant: "h5", p: { xs: 1.5, md: 3 }, grid: 3 };
    return { variant: "h6", p: { xs: 1, md: 2 }, grid: 2 };
  }, [batchCount]);

  const handleDraw = () => {
    if (isSpinning) return;
    setError("");
    setCurrentWinners([]);
    setShowConfetti(false);

    if (allNamesList.length === 0) { setError("MISSING_DATA: 請輸入名單"); return; }
    const availableNames = allNamesList.filter(name => !historySet.has(name));
    if (availableNames.length === 0) { setError("TERMINATED: 名單已抽完"); return; }

    const actualDrawCount = Math.min(batchCount, availableNames.length);
    setIsSpinning(true);

    let counter = 0;
    const duration = 2500; 
    const intervalTime = 60; 
    const steps = duration / intervalTime;

    const interval = setInterval(() => {
      const tempName = allNamesList[Math.floor(Math.random() * allNamesList.length)];
      setCurrentWinners([{ name: tempName, isLocked: false }]);
      counter++;

      if (counter >= steps) {
        clearInterval(interval);
        const shuffled = [...availableNames].sort(() => 0.5 - Math.random());
        const selectedWinners = shuffled.slice(0, actualDrawCount);
        revealWinnersOneByOne(selectedWinners, allNamesList);
      }
    }, intervalTime);
  };

  const revealWinnersOneByOne = (winners, pool) => {
    setCurrentWinners(winners.map(() => ({ name: "ANALYZING...", isLocked: false })));
    
    winners.forEach((finalName, index) => {
      setTimeout(() => {
        let miniCounter = 0;
        const miniDuration = 1200; 
        const miniIntervalTime = 50;
        const miniSteps = miniDuration / miniIntervalTime;

        const miniInterval = setInterval(() => {
          const randomTempName = pool[Math.floor(Math.random() * pool.length)];
          setCurrentWinners(prev => {
            const next = [...prev];
            if (next[index]) next[index] = { name: randomTempName, isLocked: false };
            return next;
          });
          miniCounter++;

          if (miniCounter >= miniSteps) {
            clearInterval(miniInterval);
            setCurrentWinners(prev => {
              const next = [...prev];
              if (next[index]) next[index] = { name: finalName, isLocked: true };
              return next;
            });

            if (index === winners.length - 1) {
              setHistory(prev => [...winners, ...prev]); 
              setIsSpinning(false);
              setShowConfetti(true);
              setTimeout(() => setShowConfetti(false), 4000);
            }
          }
        }, miniIntervalTime);
      }, index * 600); 
    });
  };

  const confirmReset = () => {
    setHistory([]);
    setCurrentWinners([]);
    setShowConfetti(false);
    setError("");
    setIsResetModalOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={{
        'html, body, #root': { height: '100%', margin: 0, padding: 0, overflow: 'hidden' },
        '@keyframes winner-reveal': {
          '0%': { transform: 'scale(0.98) translateY(10px)', opacity: 0, filter: 'brightness(2)' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: 1, filter: 'brightness(1)' },
        },
        '@keyframes scan': {
          '0%': { top: '-10%' },
          '100%': { top: '110%' },
        },
        '@keyframes fall': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(110vh) rotate(90deg)', opacity: 0 },
        },
        '.animate-winner': {
          animation: 'winner-reveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          boxShadow: '0 0 30px rgba(255,255,255,0.2), inset 0 0 15px rgba(255,255,255,0.1)',
        },
        '.scanline': {
          position: 'absolute', width: '100%', height: '10px',
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.05), transparent)',
          zIndex: 5, pointerEvents: 'none', animation: 'scan 4s linear infinite',
        },
        '.custom-scrollbar::-webkit-scrollbar': { width: '1px' },
        '.custom-scrollbar::-webkit-scrollbar-thumb': { background: '#1f1f23' }
      }} />

      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', position: 'relative' }}>
        <div className="scanline" />
        {showConfetti && <ConfettiOverlay />}

        {/* --- 重設 Dialog --- */}
        <Dialog 
          open={isResetModalOpen} 
          onClose={() => setIsResetModalOpen(false)}
          PaperProps={{ square: true, sx: { bgcolor: '#050505', border: '1px solid #ff003c', p: 1 } }}
        >
          <DialogTitle sx={{ color: '#ff003c', letterSpacing: '0.2em', borderBottom: '1px solid rgba(255,0,60,0.2)' }}>
            SYSTEM_OVERRIDE: 確定重設？
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <DialogContentText color="text.secondary">此操作將永久清除所有本地中獎紀錄。無法還原。</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setIsResetModalOpen(false)} color="inherit">CANCEL</Button>
            <Button onClick={confirmReset} variant="outlined" color="error">CONFIRM_WIPE</Button>
          </DialogActions>
        </Dialog>

        {/* --- Header --- */}
        <Box component="header" sx={{ 
          borderBottom: '1px solid #1f1f23', 
          bgcolor: '#000000', height: 60, display: 'flex', alignItems: 'center', px: 3, position: 'relative', zIndex: 10
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <Box sx={{ color: 'secondary.main', animation: 'pulse 2s infinite' }}><Icons.Trophy /></Box>
            <Typography variant="h6" sx={{ fontSize: '0.9rem', color: '#fff' }}>
              LOTTERY_MODULE <span style={{ opacity: 0.3 }}>v5.3.1</span>
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
             <Box sx={{ px: 1.5, py: 0.5, border: '1px solid #1f1f23', fontSize: '0.7rem', color: '#52525b' }}>
               STATUS: <span style={{ color: '#00ffaa' }}>ONLINE</span>
             </Box>
             <IconButton onClick={() => setIsResetModalOpen(true)} disabled={isSpinning} sx={{ color: '#333', '&:hover': { color: '#ff003c' } }}>
               <Icons.Trash />
             </IconButton>
          </Stack>
        </Box>

        {/* --- Main Area --- */}
        <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
          {/* 左側設定 */}
          <Box sx={{ 
            width: 300, borderRight: '1px solid #1f1f23', display: 'flex', flexDirection: 'column', bgcolor: '#050505' 
          }}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#52525b', mb: 2 }}>
                <Icons.UserPlus />
                <Typography variant="caption" sx={{ letterSpacing: '0.1em', fontWeight: 900 }}>INPUT_BUFFER</Typography>
              </Box>
              <TextField
                multiline rows={12} fullWidth value={namesInput}
                onChange={(e) => setNamesInput(e.target.value)}
                placeholder="LOAD_NAMES_HERE..."
                disabled={isSpinning}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': { bgcolor: '#000', fontSize: '0.7rem', color: '#a1a1aa' }
                }}
              />
            </Box>
            
            <Box sx={{ px: 3, pb: 3, display: 'flex', gap: 1 }}>
              <Box sx={{ flex: 1, p: 1.5, border: '1px solid #1f1f23', textAlign: 'left' }}>
                <Typography variant="caption" color="#52525b" sx={{ fontSize: '0.6rem' }}>TOTAL_NODES</Typography>
                <Typography variant="h6" sx={{ fontSize: '1.2rem', color: '#fff' }}>{allNamesList.length}</Typography>
              </Box>
              <Box sx={{ flex: 1, p: 1.5, border: '1px solid #1f1f23', textAlign: 'left' }}>
                <Typography variant="caption" color="#52525b" sx={{ fontSize: '0.6rem' }}>AVAILABLE</Typography>
                <Typography variant="h6" sx={{ fontSize: '1.2rem', color: 'secondary.main' }}>{remainingCount}</Typography>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderTop: '1px solid #1f1f23' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #111', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icons.History />
                <Typography variant="caption" sx={{ letterSpacing: '0.1em', fontWeight: 900, color: '#52525b' }}>LOG_HISTORY</Typography>
              </Box>
              <Box className="custom-scrollbar" sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5 }}>
                {history.map((name, idx) => (
                  <Box key={idx} sx={{ 
                    p: 1.2, mb: 0.5, borderLeft: '2px solid #333', display: 'flex', justifyContent: 'space-between', bgcolor: '#080808',
                    '&:hover': { borderLeftColor: 'secondary.main', bgcolor: '#111' }
                  }}>
                    <Typography variant="caption" sx={{ color: '#333' }}>#{history.length - idx}</Typography>
                    <Typography variant="caption" sx={{ color: '#a1a1aa', fontWeight: 700 }}>{name}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* 右側主區域 */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: '#000', position: 'relative' }}>
            <Box sx={{ 
              flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, position: 'relative', overflow: 'hidden'
            }}>
              <Box sx={{ 
                position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                backgroundSize: '60px 60px'
              }} />

              {currentWinners.length === 0 ? (
                <Box sx={{ textAlign: 'center' }}>
                   <Typography variant="h2" sx={{ opacity: 0.05, letterSpacing: '1em', mb: 2 }}>STANDBY</Typography>
                   <Box sx={{ width: 100, height: 1, bgcolor: '#1f1f23', mx: 'auto' }} />
                </Box>
              ) : (
                <Grid container spacing={1.5} justifyContent="center" sx={{ maxWidth: '100%', zIndex: 20 }}>
                  {currentWinners.map((winner, i) => (
                    <Grid item key={i} xs={winnerStyles(batchCount).xs} sm={winnerStyles(batchCount).sm} md={winnerConfig.grid}>
                      <Paper variant="outlined" 
                        className={winner.isLocked ? "animate-winner" : ""} 
                        sx={{ 
                          p: winnerConfig.p,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid', 
                          borderColor: winner.isLocked ? '#fff' : 'secondary.main', // 滾動時邊框顏色改為青色
                          bgcolor: winner.isLocked ? '#fff' : 'rgba(0,243,255,0.05)', // 滾動時背景微亮
                          color: winner.isLocked ? '#000' : 'secondary.main', // 滾動時名字改為明顯青色
                          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                          position: 'relative',
                          minHeight: batchCount > 20 ? 'auto' : '100px'
                        }}
                      >
                        {!winner.isLocked && <Box sx={{ position: 'absolute', top: 5, left: 5, width: 4, height: 4, bgcolor: 'secondary.main' }} />}
                        
                        <Typography variant={winnerConfig.variant} sx={{ 
                          fontWeight: 900, letterSpacing: '-0.02em', textAlign: 'center',
                          // 移除了模糊濾鏡，並在滾動時加上文字陰影
                          filter: 'none',
                          textShadow: !winner.isLocked ? '0 0 10px rgba(0,243,255,0.5)' : 'none',
                          wordBreak: 'break-all',
                          fontSize: winnerConfig.variant === 'h1' ? { xs: '3rem', md: '6rem' } : 'inherit'
                        }}>
                          {winner.name}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            <Box sx={{ 
              p: 6, borderTop: '1px solid #1f1f23', bgcolor: '#050505', display: 'flex', justifyContent: 'center', position: 'relative'
            }}>
              <Stack direction="row" spacing={0} sx={{ width: '100%', maxWidth: 800 }}>
                <Box sx={{ 
                  display: 'flex', alignItems: 'center', border: '1px solid #1f1f23', borderRight: 'none', px: 3, bgcolor: '#000'
                }}>
                  <IconButton onClick={() => setBatchCount(Math.max(1, batchCount - 1))} disabled={isSpinning || batchCount <= 1} sx={{ color: '#333' }}>
                    <Icons.Minus />
                  </IconButton>
                  <Box sx={{ minWidth: 120, textAlign: 'center' }}>
                    <Typography variant="caption" color="#52525b" display="block" sx={{ fontSize: '0.6rem' }}>SEQUENCE_COUNT</Typography>
                    <Typography variant="h5" fontWeight={900}>{batchCount.toString().padStart(2, '0')}</Typography>
                  </Box>
                  <IconButton onClick={() => setBatchCount(Math.min(remainingCount || 1, batchCount + 1))} disabled={isSpinning || batchCount >= (remainingCount || 1)} sx={{ color: '#333' }}>
                    <Icons.Plus />
                  </IconButton>
                </Box>
                
                <Button
                  fullWidth variant="outlined" size="large" onClick={handleDraw} disabled={isSpinning}
                  sx={{ 
                    py: 3, fontSize: '1.5rem', borderWidth: '1px !important', color: '#fff', borderColor: '#fff',
                    bgcolor: '#000',
                    '&:hover': { bgcolor: '#fff', color: '#000' },
                    '&.Mui-disabled': { borderColor: '#1f1f23', color: '#1f1f23' }
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    {!isSpinning && <Icons.MagicWand />}
                    <span>{isSpinning ? 'ANALYZING...' : 'INITIATE_DRAW'}</span>
                  </Stack>
                </Button>
              </Stack>
            </Box>

            {error && (
              <Box sx={{ position: 'absolute', bottom: 160, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
                <Alert severity="error" variant="filled" icon={false} sx={{ bgcolor: '#ff003c', color: '#fff', fontSize: '0.7rem', px: 4 }}>
                  {error}
                </Alert>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

// 輔助函式：處理移動端網格
const winnerStyles = (count) => {
  if (count <= 1) return { xs: 12, sm: 12 };
  if (count <= 4) return { xs: 6, sm: 6 };
  return { xs: 6, sm: 4 };
};

const ConfettiOverlay = () => {
  const pieces = Array.from({ length: 120 });
  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 4;
        const duration = 2 + Math.random() * 2;
        const size = 1 + Math.random() * 3;
        const heightMultiplier = 5 + Math.random() * 15;
        const colors = ['#ffffff', '#a1a1aa', '#00f3ff'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return (
          <Box key={i} className="animate-fall" sx={{ 
            position: 'absolute', top: '-10%', left: `${left}%`, 
            animationDelay: `${delay}s`, animationDuration: `${duration}s` 
          }}>
            <Box sx={{ 
              width: size, height: size * heightMultiplier, backgroundColor: color, 
              opacity: 0.6, boxShadow: `0 0 10px ${color}`
            }} />
          </Box>
        );
      })}
    </Box>
  );
};

export default App;