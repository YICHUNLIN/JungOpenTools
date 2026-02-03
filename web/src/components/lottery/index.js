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

// --- 自定義主題設定：強制使用直角 ---
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff', // 純白
    },
    background: {
      default: '#000000', // 極致黑
      paper: '#09090b',   // Zinc 950
    },
    divider: '#27272a',
    error: {
      main: '#ff0000',
    },
    success: {
      main: '#00ff00',
    }
  },
  typography: {
    fontFamily: '"JetBrains Mono", "Roboto Mono", "Inter", monospace',
    h2: { fontWeight: 900, letterSpacing: '-0.05em' },
    h4: { fontWeight: 800 },
    h6: { fontWeight: 700, textTransform: 'uppercase' },
  },
  shape: {
    borderRadius: 0, // 強制所有組件圓角為 0
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontWeight: 700,
          letterSpacing: '0.1em',
          borderRadius: 0,
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          }
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 0, // 確保 Paper 也是直角
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0, // 輸入框直角
        }
      }
    }
  },
});

// --- 內嵌 SVG 圖示 ---
const Icons = {
  Trophy: () => (
    <svg viewBox="0 0 256 256" width="24" height="24" fill="currentColor">
      <path d="M168,24H88a8,8,0,0,0-8,8V56H40A32,32,0,0,0,8,88v24a32,32,0,0,0,32,32h8.51a48,48,0,0,0,45.41,35.79A40.06,40.06,0,0,0,120,207.13V224H104a8,8,0,0,0,0,16h48a8,8,0,0,0,0-16H136V207.13a40.06,40.06,0,0,0,26.08-27.34A48,48,0,0,0,207.49,144H216a32,32,0,0,0,32-32V88a32,32,0,0,0-32-32H176V32A8,8,0,0,0,168,24ZM40,128a16,16,0,0,1-16-16V88A16,16,0,0,1,40,72h8V128Zm176-16a16,16,0,0,1-16,16h-8.51l.51-56h8a16,16,0,0,1,16,16ZM96,144V72h64v72a32,32,0,0,1-64,0Z"></path>
    </svg>
  ),
  UserPlus: () => (
    <svg viewBox="0 0 256 256" width="18" height="18" fill="currentColor">
      <path d="M256,128a8,8,0,0,1-8,8h-24v24a8,8,0,0,1-16,0v-24h-24a8,8,0,0,1,0-16h24v-24a8,8,0,0,1,16,0v24h24A8,8,0,0,1,256,128Zm-88,16a72,72,0,1,1-72-72A72.08,72.08,0,0,1,168,144Zm-16,0a56,56,0,1,0-56,56A56.06,56.06,0,0,0,152,144Zm-56,72c-42.34,0-80,24.18-80,56a8,8,0,0,0,16,0c0-21.64,30.31-40,64-40s64,18.36,64,40a8,8,0,0,0,16,0C176,240.18,138.34,216,96,216Z"></path>
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 256 256" width="16" height="16" fill="currentColor">
      <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
    </svg>
  ),
  Minus: () => (
    <svg viewBox="0 0 256 256" width="20" height="20" fill="currentColor">
      <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"></path>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 256 256" width="20" height="20" fill="currentColor">
      <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
    </svg>
  ),
  MagicWand: () => (
    <svg viewBox="0 0 256 256" width="24" height="24" fill="currentColor">
      <path d="M213.66,42.34a8,8,0,0,0-11.32,0L42.34,202.34a8,8,0,0,0,11.32,11.32L213.66,53.66A8,8,0,0,0,213.66,42.34ZM192,84.69,171.31,64,192,43.31,212.69,64ZM88,144a8,8,0,0,1-8,8H48a8,8,0,0,1,0-16H80A8,8,0,0,1,88,144Zm40,40a8,8,0,0,1,8,8v32a8,8,0,0,1-16,0V192A8,8,0,0,1,128,184ZM80,32a8,8,0,0,0-8,8V72a8,8,0,0,0,16,0V40A8,8,0,0,0,80,32ZM40,88A8,8,0,0,0,40,72H8A8,8,0,0,0,8,88H40Z"></path>
    </svg>
  ),
  History: () => (
    <svg viewBox="0 0 256 256" width="18" height="18" fill="currentColor">
      <path d="M128,24a104,104,0,1,0,104,104A104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
    </svg>
  ),
  AlertTriangle: () => (
    <svg viewBox="0 0 256 256" width="24" height="24" fill="currentColor">
      <path d="M236.8,188.09,149.35,36.22a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.34,24.34,0,0,0,40.55,224h174.9a24.34,24.34,0,0,0,21.35-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z"></path>
    </svg>
  )
};

const App = () => {
  // --- 狀態管理 ---
  const [namesInput, setNamesInput] = useState("");
  const [batchCount, setBatchCount] = useState(1);
  const [history, setHistory] = useState([]);
  const [currentWinners, setCurrentWinners] = useState([]); 
  const [isSpinning, setIsSpinning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState("");
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // --- 初始化與本地儲存 ---
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('lucky_draw_history_v3');
      const savedNames = localStorage.getItem('lucky_draw_names_v3');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      if (savedNames) setNamesInput(savedNames);
    } catch (e) {
      console.error("無法讀取歷史紀錄", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lucky_draw_history_v3', JSON.stringify(history));
    localStorage.setItem('lucky_draw_names_v3', namesInput);
  }, [history, namesInput]);

  // --- 邏輯處理 ---
  const getParsedNames = useCallback(() => {
    const names = namesInput
      .split(',')
      .map(name => name.trim())
      .filter(name => name !== "");
    return [...new Set(names)];
  }, [namesInput]);

  const allNamesList = useMemo(() => getParsedNames(), [getParsedNames]);
  const historySet = useMemo(() => new Set(history), [history]);
  const remainingCount = allNamesList.filter(name => !historySet.has(name)).length;

  const handleDraw = () => {
    if (isSpinning) return;
    setError("");
    setCurrentWinners([]);
    setShowConfetti(false);

    if (allNamesList.length === 0) {
      setError("請輸入名單");
      return;
    }

    const availableNames = allNamesList.filter(name => !historySet.has(name));
    if (availableNames.length === 0) {
      setError("名單已抽完");
      return;
    }

    const actualDrawCount = Math.min(batchCount, availableNames.length);
    setIsSpinning(true);

    let counter = 0;
    const duration = 2000; 
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
    setCurrentWinners(winners.map(() => ({ name: "...", isLocked: false })));
    
    winners.forEach((finalName, index) => {
      setTimeout(() => {
        let miniCounter = 0;
        const miniDuration = 1000; 
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
        '@keyframes winner-pop': {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        '@keyframes fall': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: 0 },
        },
        '.animate-winner-pop': {
          animation: 'winner-pop 0.3s ease-out forwards',
        },
        '.animate-fall': {
          animation: 'fall linear forwards',
        },
        '.custom-scrollbar::-webkit-scrollbar': { width: '2px' },
        '.custom-scrollbar::-webkit-scrollbar-thumb': { background: '#3f3f46' }
      }} />

      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        {showConfetti && <ConfettiOverlay />}

        {/* --- 重設 Dialog --- */}
        <Dialog 
          open={isResetModalOpen} 
          onClose={() => setIsResetModalOpen(false)}
          PaperProps={{ square: true, sx: { bgcolor: '#09090b', border: '1px solid #27272a' } }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: '1px solid #27272a' }}>
            <Box sx={{ color: 'error.main', display: 'flex' }}><Icons.AlertTriangle /></Box>
            CONFIRM RESET
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <DialogContentText color="text.secondary">確定要重設嗎？此動作無法復原。</DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setIsResetModalOpen(false)} color="inherit">CANCEL</Button>
            <Button onClick={confirmReset} variant="outlined" color="error">RESET NOW</Button>
          </DialogActions>
        </Dialog>

        {/* --- Header --- */}
        <Box component="header" sx={{ 
          borderBottom: '1px solid #27272a', 
          bgcolor: '#000000', height: 60, display: 'flex', alignItems: 'center', px: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <Icons.Trophy />
            <Typography variant="h6" sx={{ letterSpacing: '0.2em', fontSize: '1rem' }}>LUCKY DRAW 2026</Typography>
          </Box>
          <Tooltip title="RESET">
            <IconButton onClick={() => setIsResetModalOpen(true)} disabled={isSpinning} sx={{ color: '#52525b' }}>
              <Icons.Trash />
            </IconButton>
          </Tooltip>
        </Box>

        {/* --- Main Area --- */}
        <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
          {/* 左側設定：排滿高度 */}
          <Box sx={{ 
            width: 320, borderRight: '1px solid #27272a', display: 'flex', flexDirection: 'column', bgcolor: '#09090b' 
          }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #27272a' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 2 }}>
                <Icons.UserPlus />
                <Typography variant="caption" fontWeight={900}>NAMES CONFIG</Typography>
              </Box>
              <TextField
                multiline
                rows={15}
                fullWidth
                value={namesInput}
                onChange={(e) => setNamesInput(e.target.value)}
                placeholder="貼上名單..."
                disabled={isSpinning}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': { bgcolor: '#000', fontSize: '0.75rem', fontFamily: 'monospace' }
                }}
              />
            </Box>
            <Box sx={{ p: 3, display: 'flex', gap: 1 }}>
              <Box sx={{ flex: 1, p: 2, border: '1px solid #27272a', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" display="block">TOTAL</Typography>
                <Typography variant="h5" fontWeight={900}>{allNamesList.length}</Typography>
              </Box>
              <Box sx={{ flex: 1, p: 2, border: '1px solid #27272a', textAlign: 'center' }}>
                <Typography variant="caption" color="success.main" display="block">REMAINS</Typography>
                <Typography variant="h5" fontWeight={900} color="success.main">{remainingCount}</Typography>
              </Box>
            </Box>

            {/* 歷史紀錄：放置在左側下方填滿 */}
            <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderTop: '1px solid #27272a' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #18181b', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icons.History />
                <Typography variant="caption" fontWeight={900}>HISTORY</Typography>
              </Box>
              <Box className="custom-scrollbar" sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
                {history.map((name, idx) => (
                  <Box key={idx} sx={{ 
                    p: 1.5, mb: 0.5, border: '1px solid #18181b', display: 'flex', justifyContent: 'space-between',
                    '&:hover': { bgcolor: '#111' }
                  }}>
                    <Typography variant="caption" sx={{ color: '#52525b', minWidth: 24 }}>{history.length - idx}</Typography>
                    <Typography variant="caption" fontWeight={700}>{name}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* 右側主區域：大氣排滿 */}
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: '#000' }}>
            <Box sx={{ 
              flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, position: 'relative' 
            }}>
              {/* 背景格線裝飾 */}
              <Box sx={{ 
                position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />

              {currentWinners.length === 0 ? (
                <Typography variant="h2" sx={{ opacity: 0.1, letterSpacing: '0.5em', fontStyle: 'italic' }}>READY</Typography>
              ) : (
                <Grid container spacing={1} justifyContent="center" sx={{ maxWidth: '100%' }}>
                  {currentWinners.map((winner, i) => (
                    <Grid item key={i} xs={12} sm={batchCount > 1 ? 6 : 12} md={batchCount > 4 ? 3 : (batchCount > 1 ? 4 : 12)}>
                      <Paper variant="outlined" className={winner.isLocked ? "animate-winner-pop" : ""} sx={{ 
                        p: batchCount === 1 ? 12 : 6,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid', borderColor: winner.isLocked ? '#fff' : '#27272a',
                        bgcolor: winner.isLocked ? '#fff' : 'transparent',
                        color: winner.isLocked ? '#000' : '#3f3f46',
                        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}>
                        <Typography variant={batchCount === 1 ? "h1" : "h3"} sx={{ 
                          fontWeight: 900, letterSpacing: '-0.02em', textAlign: 'center'
                        }}>
                          {winner.name}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {/* 底部控制區：方正厚實 */}
            <Box sx={{ 
              p: 6, borderTop: '1px solid #27272a', bgcolor: '#09090b', display: 'flex', justifyContent: 'center' 
            }}>
              <Stack direction="row" spacing={0} sx={{ width: '100%', maxWidth: 800 }}>
                <Box sx={{ 
                  display: 'flex', alignItems: 'center', border: '2px solid #27272a', borderRight: 'none', px: 2 
                }}>
                  <IconButton onClick={() => setBatchCount(Math.max(1, batchCount - 1))} disabled={isSpinning || batchCount <= 1}>
                    <Icons.Minus />
                  </IconButton>
                  <Box sx={{ minWidth: 100, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary" display="block">BATCH</Typography>
                    <Typography variant="h6" fontWeight={900}>{batchCount}</Typography>
                  </Box>
                  <IconButton onClick={() => setBatchCount(Math.min(remainingCount || 1, batchCount + 1))} disabled={isSpinning || batchCount >= (remainingCount || 1)}>
                    <Icons.Plus />
                  </IconButton>
                </Box>
                
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={handleDraw}
                  disabled={isSpinning}
                  sx={{ 
                    py: 3, fontSize: '1.5rem', borderWidth: '2px !important', color: '#fff', borderColor: '#fff',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: '#fff' }
                  }}
                >
                  {isSpinning ? 'DRAWING...' : 'START DRAW'}
                </Button>
              </Stack>
            </Box>

            {error && (
              <Box sx={{ position: 'absolute', bottom: 150, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                <Alert severity="error" variant="filled" icon={false} sx={{ bgcolor: '#ff0000', color: '#fff' }}>
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

// --- 彩帶特效 (黑白灰奢華色系) ---
const ConfettiOverlay = () => {
  const pieces = Array.from({ length: 100 });
  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 4;
        const duration = 2.5 + Math.random() * 3;
        const size = 2 + Math.random() * 6;
        const colors = ['#ffffff', '#a1a1aa', '#52525b', '#27272a'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return (
          <Box key={i} className="animate-fall" sx={{ 
            position: 'absolute', top: '-20px', left: `${left}%`, 
            animationDelay: `${delay}s`, animationDuration: `${duration}s` 
          }}>
            <Box sx={{ 
              width: size, height: size * 3, backgroundColor: color, 
              opacity: 0.8
            }} />
          </Box>
        );
      })}
    </Box>
  );
};

export default App;