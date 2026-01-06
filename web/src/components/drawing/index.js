import React, { useRef, useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Stack,
  Button,
  Slider,
  Typography,
  Tooltip
} from '@mui/material';
import BrushIcon from '@mui/icons-material/Brush';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
// 引入 socket.io-client
import { io } from 'socket.io-client';

// 主應用程式組件
function DrawingApp() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  // 新增：用於儲存 socket 連線實例
  const socketRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);

  // 初始化 canvas 和 socket.io 連線
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    // --- Socket.io 連線設定 ---
    // 連線到後端伺服器
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    // 監聽從伺服器傳來的 'start-drawing-from-server' 事件
    socket.on('start-drawing-from-server', ({ offsetX, offsetY, color, lineWidth }) => {
      if (contextRef.current) {
        contextRef.current.strokeStyle = color;
        contextRef.current.lineWidth = lineWidth;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
      }
    });

    // 監聽從伺服器傳來的 'drawing-from-server' 事件
    socket.on('drawing-from-server', ({ offsetX, offsetY }) => {
      if (contextRef.current) {
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
      }
    });

    // 監聽從伺服器傳來的 'stop-drawing-from-server' 事件
    socket.on('stop-drawing-from-server', () => {
      if (contextRef.current) {
        contextRef.current.closePath();
      }
    });
    
    // 監聽從伺服器傳來的 'clear-canvas-from-server' 事件
    socket.on('clear-canvas-from-server', () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if(context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    });

    // 組件卸載時，斷開 socket 連線
    return () => {
      socket.disconnect();
    };

  }, []);

  // 更新本地 context 的樣式
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);

  // 開始繪圖 (本地使用者操作)
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    // 發送 'start-drawing' 事件到伺服器
    socketRef.current.emit('start-drawing', { offsetX, offsetY, color, lineWidth });
  };

  // 停止繪圖 (本地使用者操作)
  const stopDrawing = () => {
    if (isDrawing) {
      contextRef.current.closePath();
      setIsDrawing(false);
      // 發送 'stop-drawing' 事件到伺服器
      socketRef.current.emit('stop-drawing');
    }
  };

  // 繪圖中 (本地使用者操作)
  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
    // 發送 'drawing' 事件到伺服器
    socketRef.current.emit('drawing', { offsetX, offsetY });
  };

  // 清除畫布功能
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
    // 發送 'clear-canvas' 事件到伺服器
    socketRef.current.emit('clear-canvas');
  };

  // 下載圖片功能
  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = '我的協作畫作.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        React 協作繪圖工具
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
        使用 Socket.io & Material-UI
      </Typography>

      <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
          {/* 顏色選擇 */}
          <Box>
            <Typography gutterBottom variant="body2" sx={{ fontWeight: 'medium' }}>顏色</Typography>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ 
                width: '50px', 
                height: '36px', 
                border: '1px solid #ccc', 
                borderRadius: '4px', 
                cursor: 'pointer',
                padding: '2px'
              }}
            />
          </Box>

          {/* 筆刷粗細 */}
          <Box sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}>
            <Typography gutterBottom variant="body2" sx={{ fontWeight: 'medium' }}>筆刷粗細</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <BrushIcon />
              <Slider
                value={lineWidth}
                min={1}
                max={50}
                onChange={(e, newValue) => setLineWidth(newValue)}
                aria-labelledby="brush-width-slider"
              />
            </Stack>
          </Box>

          {/* 功能按鈕 (已移除 Undo/Redo) */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="清除所有內容">
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearCanvas}
              >
                清除
              </Button>
            </Tooltip>
            <Tooltip title="將畫作儲存為 PNG 檔">
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadImage}
              >
                下載
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* 繪圖畫布 */}
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onMouseLeave={stopDrawing}
          style={{ width: '100%', height: '500px', display: 'block', cursor: 'crosshair' }}
        />
      </Paper>
    </Container>
  );
}

export default DrawingApp;

