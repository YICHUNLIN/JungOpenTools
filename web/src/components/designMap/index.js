import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Material-UI Imports
import {
    AppBar,
    Box,
    Button,
    CssBaseline,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Paper,
    Snackbar,
    Alert,
    Divider,
    Tooltip
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ConstructionIcon from '@mui/icons-material/Construction';
import DeleteIcon from '@mui/icons-material/Delete';
import ChairIcon from '@mui/icons-material/Chair';
import TableBarIcon from '@mui/icons-material/TableBar';
import CircleIcon from '@mui/icons-material/Circle';
import PngIcon from '@mui/icons-material/Image';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import CountertopsIcon from '@mui/icons-material/Countertops';
import WeekendIcon from '@mui/icons-material/Weekend';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';


// --- MUI Theme ---
const theme = createTheme({
    palette: {
        primary: {
            main: '#6d4c41', // a brown shade for cafe theme
        },
        secondary: {
            main: '#ffab40', // an amber accent
        },
        background: {
            default: '#f5f5f5'
        }
    },
    typography: {
        fontFamily: '"Noto Sans TC", "Roboto", "Helvetica", "Arial", sans-serif',
    },
});

// --- 樣式設定與元件定義 ---
const ITEM_STYLES = {
    'square-table': { name: '方桌', width: 60, height: 60, bgColor: '#795548', shape: 'rounded', icon: <TableBarIcon /> },
    'round-table': { name: '圓桌', width: 60, height: 60, bgColor: '#795548', shape: 'rounded-full', icon: <CircleIcon sx={{fontSize: '20px'}}/> },
    'bar-counter': { name: '吧台', width: 150, height: 50, bgColor: '#8d6e63', shape: 'rounded', icon: <CountertopsIcon /> },
    'sofa': { name: '沙發', width: 120, height: 50, bgColor: '#a1887f', shape: 'rounded', icon: <WeekendIcon /> },
    'chair': { name: '椅子', width: 30, height: 30, bgColor: '#616161', shape: 'rounded', icon: <ChairIcon /> },
    'default': { name: '未知', width: 50, height: 50, bgColor: '#9e9e9e', shape: 'rounded', icon: null }
};


const CafeItem = ({ data, tableNumber, onUpdate, isSelected, onInteractionStart, onResizeStart }) => {
    const itemRef = useRef(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState(data.name || '');
    const styleInfo = ITEM_STYLES[data.type] || ITEM_STYLES.default;

    useEffect(() => {
        if (!isEditingName) {
            setEditedName(data.name || '');
        }
    }, [data.name, isEditingName]);
    
    const handleMouseDown = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.closest('.resize-handle')) return;
        onInteractionStart(e, data.id, 'drag');
    };
    
    const handleRotationStart = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onInteractionStart(e, data.id, 'rotate');
    };

    const handleNameCommit = () => { if (isEditingName && editedName !== (data.name || '')) { onUpdate(data.id, { name: editedName }); } setIsEditingName(false); };
    const handleNameKeyDown = (e) => { if (e.key === 'Enter') { handleNameCommit(); e.target.blur(); } else if (e.key === 'Escape') { setEditedName(data.name || ''); setIsEditingName(false); e.target.blur(); }};
    const handleDoubleClick = (e) => { if (data.type === 'square-table' || data.type === 'round-table' || data.type === 'bar-counter' || data.type === 'sofa') { e.stopPropagation(); setEditedName(data.name || ''); setIsEditingName(true); }};
    
    const isTable = data.type === 'square-table' || data.type === 'round-table';
    const isBar = data.type === 'bar-counter';
    const isSofa = data.type === 'sofa';
    const canResizeNonProportionally = isBar || isSofa;

    const itemStyle = {
        width: data.width, 
        height: data.height, 
        left: data.left, 
        top: data.top, 
        transform: `rotate(${data.rotation || 0}deg)`, 
        zIndex: isSelected ? 101 : 2, 
        cursor: 'grab',
        backgroundColor: styleInfo.bgColor,
        borderRadius: styleInfo.shape === 'rounded-full' ? '50%' : '4px',
        border: isSelected ? '2px solid #2979ff' : '2px solid transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .1)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        position: 'absolute'
    };
    
    const renderContent = () => {
        if (isTable) return <Typography variant="body2" sx={{fontWeight: 'bold', userSelect: 'none'}}>{data.name || `桌號 ${tableNumber}`}</Typography>
        if (isBar) return <Typography variant="body2" sx={{fontWeight: 'bold', userSelect: 'none'}}>{data.name || '吧台'}</Typography>
        if (isSofa) return <WeekendIcon/>
        return null;
    };

    return (
        <Box ref={itemRef} id={data.id} sx={itemStyle} onMouseDown={handleMouseDown} onTouchStart={handleMouseDown} onDoubleClick={handleDoubleClick}>
            {(isTable || isBar || isSofa) && isSelected && isEditingName ? (<input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} onBlur={handleNameCommit} onKeyDown={handleNameKeyDown} onClick={(e) => e.stopPropagation()} style={{width: '100%', height: '100%', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', color: 'black', fontWeight: 'bold', fontSize: '1rem', border: 'none', outline: 'none', borderRadius: '4px'}} autoFocus />) : (renderContent())}
            {isSelected && !isEditingName && (isSofa || isTable) && (<Box className="resize-handle" sx={{ position: 'absolute', width: 12, height: 12, bgcolor: '#2979ff', border: '1px solid white', borderRadius: '50%', top: -18, left: 'calc(50% - 6px)', cursor: 'alias' }} onMouseDown={handleRotationStart} onTouchStart={handleRotationStart} />)}
            {isSelected && canResizeNonProportionally && (
                <>
                    <Box className="resize-handle" sx={{position: 'absolute', right: -5, top: '50%', transform: 'translateY(-50%)', width: 10, height: 10, bgcolor: '#2979ff', border: '1px solid white', cursor: 'ew-resize'}} onMouseDown={(e) => onResizeStart(e, data.id, 'right')} />
                    <Box className="resize-handle" sx={{position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)', width: 10, height: 10, bgcolor: '#2979ff', border: '1px solid white', cursor: 'ns-resize'}} onMouseDown={(e) => onResizeStart(e, data.id, 'bottom')} />
                </>
            )}
             {isSelected && isTable && (
                <Box className="resize-handle" sx={{position: 'absolute', right: -5, bottom: -5, width: 10, height: 10, bgcolor: '#2979ff', border: '1px solid white', cursor: 'se-resize'}} onMouseDown={(e) => onResizeStart(e, data.id, 'proportional')} />
            )}
        </Box>
    );
};

const ToolbarComponent = ({ isDrawing, setIsDrawing, onDeleteLine, selectedLineId, onDeleteItems, hasSelection, onCopy, onPaste, clipboardHasContent }) => {
    return (
        <Drawer variant="permanent" anchor="left" sx={{ width: 240, flexShrink: 0, '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' } }}>
            <Toolbar />
            <Box sx={{ overflow: 'auto', p: 1 }}>
                <Typography variant="h6" sx={{ p: 1 }}>工具箱</Typography>
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => setIsDrawing(!isDrawing)} selected={isDrawing}>
                            <ListItemIcon><ConstructionIcon /></ListItemIcon>
                            <ListItemText primary={isDrawing ? '結束繪製' : '繪製牆面'} />
                        </ListItemButton>
                    </ListItem>
                     {selectedLineId && (<ListItem disablePadding>
                        <ListItemButton onClick={onDeleteLine} sx={{color: 'red'}}>
                            <ListItemIcon><DeleteIcon color="error"/></ListItemIcon>
                            <ListItemText primary="刪除牆面" />
                        </ListItemButton>
                    </ListItem>)}
                     {hasSelection && (<ListItem disablePadding>
                        <ListItemButton onClick={onDeleteItems} sx={{color: 'red'}}>
                            <ListItemIcon><DeleteIcon color="error"/></ListItemIcon>
                            <ListItemText primary="刪除物件" />
                        </ListItemButton>
                    </ListItem>)}
                    {hasSelection && (<ListItem disablePadding>
                        <ListItemButton onClick={onCopy}>
                            <ListItemIcon><ContentCopyIcon /></ListItemIcon>
                            <ListItemText primary="複製" />
                        </ListItemButton>
                    </ListItem>)}
                    {clipboardHasContent && (<ListItem disablePadding>
                        <ListItemButton onClick={onPaste}>
                            <ListItemIcon><ContentPasteIcon /></ListItemIcon>
                            <ListItemText primary="貼上" />
                        </ListItemButton>
                    </ListItem>)}
                </List>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ p: 1 }}>傢俱物件</Typography>
                <List>
                     {Object.entries(ITEM_STYLES).filter(([key]) => key !== 'default').map(([type, { name, icon }]) => (
                         <ListItem key={type} draggable onDragStart={(e) => {e.dataTransfer.setData("application/cafe-item", type);}} sx={{cursor: 'grab', '&:active': {cursor: 'grabbing'}}}>
                            <Paper elevation={2} sx={{p: 2, display: 'flex', alignItems: 'center', width: '100%'}}>
                                <ListItemIcon>{icon}</ListItemIcon>
                                <ListItemText primary={name} />
                            </Paper>
                        </ListItem>
                     ))}
                </List>
            </Box>
        </Drawer>
    );
};

export default function DesignMap() {
    const [historyState, setHistoryState] = useState({
        history: [{ items: {}, lines: {} }],
        index: 0
    });

    const { history, index: historyIndex } = historyState;
    const currentState = history[historyIndex];
    const { items, lines } = currentState;

    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedLineId, setSelectedLineId] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentLine, setCurrentLine] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [pngExportReady, setPngExportReady] = useState(false);
    const [selectionBox, setSelectionBox] = useState(null);
    const [clipboard, setClipboard] = useState(null);
    
    const interactionRef = useRef(null);
    
    const fileInputRef = useRef(null);
    const floorPlanRef = useRef(null);
    
    const updateState = useCallback((updater, recordHistory = true) => {
        setHistoryState(current => {
            const { history, index } = current;
            const lastState = history[index];
            const newState = updater(lastState);
            if (recordHistory) {
                const newHistory = history.slice(0, index + 1);
                return {
                    history: [...newHistory, newState],
                    index: newHistory.length
                };
            } else {
                const newHistory = [...history];
                newHistory[index] = newState;
                return { ...current, history: newHistory };
            }
        });
    }, []);

    const commitHistory = useCallback(() => {
         updateState(state => state);
    }, [updateState]);

    const undo = () => { setHistoryState(prev => ({...prev, index: Math.max(0, prev.index - 1)})); };
    const redo = () => { setHistoryState(prev => ({...prev, index: Math.min(prev.history.length - 1, prev.index + 1)}));};


    useEffect(() => {
        const scriptId = 'html2canvas-script';
        if (window.html2canvas) { setPngExportReady(true); return; }
        const handleLoad = () => setPngExportReady(true);
        let script = document.getElementById(scriptId);
        if (script) { script.addEventListener('load', handleLoad); } 
        else {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
            script.async = true;
            script.addEventListener('load', handleLoad);
            document.head.appendChild(script);
        }
        return () => { const el = document.getElementById(scriptId); if (el) el.removeEventListener('load', handleLoad); }
    }, []);

    const tableNumbers = useMemo(() => {
        const tableItems = Object.values(items).filter(item => item.type === 'square-table' || item.type === 'round-table').sort((a, b) => a.id.localeCompare(b.id));
        const numbers = {};
        tableItems.forEach((item, index) => { numbers[item.id] = index + 1; });
        return numbers;
    }, [items]);
    
    const showMessage = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
    const handleCloseSnackbar = () => setSnackbar({...snackbar, open: false});
    
    const handleUpdateItem = useCallback((id, data) => { updateState(prev => ({ ...prev, items: { ...prev.items, [id]: { ...prev.items[id], ...data } } })); }, [updateState]);
    const handleDeleteItems = useCallback(() => { updateState(prev => { const newItems = { ...prev.items }; selectedIds.forEach(id => delete newItems[id]); return { ...prev, items: newItems }; }); setSelectedIds([]); }, [selectedIds, updateState]);
    const handleAddItem = useCallback((type, position) => {
        const newId = `item-${Date.now()}`;
        const dims = ITEM_STYLES[type] || ITEM_STYLES.default;
        const newItemData = { id: newId, type, width: `${dims.width}px`, height: `${dims.height}px`, left: `${position.x}px`, top: `${position.y}px`, rotation: 0, name: '' };
        updateState(prev => ({ ...prev, items: { ...prev.items, [newId]: newItemData } }));
        setSelectedIds([newId]);
    }, [updateState]);

    const handleDeleteLine = useCallback(() => { if (selectedLineId) { updateState(prev => { const newLines = { ...prev.lines }; delete newLines[selectedLineId]; return { ...prev, lines: newLines }; }); setSelectedLineId(null); } }, [selectedLineId, updateState]);
    
    const getPointFromEvent = (e) => { const rect = floorPlanRef.current.getBoundingClientRect(); const event = e.touches ? e.touches[0] : e; return { x: event.clientX - rect.left, y: event.clientY - rect.top }; }
    
    const handleItemInteractionStart = (e, clickedItemId, interactionType = 'drag') => {
        e.preventDefault();
        e.stopPropagation();

        const isShift = e.shiftKey;
        let newSelectedIds = selectedIds;

        if (interactionType === 'drag') {
             if (isShift) {
                newSelectedIds = selectedIds.includes(clickedItemId) ? selectedIds.filter(id => id !== clickedItemId) : [...selectedIds, clickedItemId];
            } else if (!selectedIds.includes(clickedItemId)) {
                newSelectedIds = [clickedItemId];
            }
        } else {
             newSelectedIds = [clickedItemId];
        }
        
        setSelectedIds(newSelectedIds);
        setSelectedLineId(null);

        const startMouse = getPointFromEvent(e);
        
        if (interactionType === 'drag') {
            const dragItemsInfo = newSelectedIds.map(id => ({
                id,
                initialLeft: parseFloat(items[id].left),
                initialTop: parseFloat(items[id].top)
            }));
            interactionRef.current = { type: 'drag', startMouse, items: dragItemsInfo };
        } else { // rotate
             const item = items[clickedItemId];
             interactionRef.current = { type: 'rotate', id: clickedItemId, itemRect: document.getElementById(clickedItemId).getBoundingClientRect() };
        }
    };
    
    const handleResizeStart = (e, id, handleType) => { e.stopPropagation(); e.preventDefault(); setSelectedIds([id]); const startMouse = getPointFromEvent(e); const item = items[id]; interactionRef.current = ({ type: 'resize', id, handle: handleType, startMouse, initialWidth: parseFloat(item.width), initialHeight: parseFloat(item.height), initialRotation: item.rotation || 0 }); };
    
    const handleMouseDown = (e) => {
        const target = e.target;
        const isInteractive = target.closest('[id^="item-"]') || target.closest('.resize-handle') || target.closest('[data-interactive="true"]');
        if (isInteractive || interactionRef.current) return;

        if (isDrawing) {
            setSelectedIds([]);
            setSelectedLineId(null);
            const startPoint = getPointFromEvent(e);
            setCurrentLine({ id: `line-${Date.now()}`, points: [startPoint, startPoint] });
            interactionRef.current = { type: 'draw-line' };
            return;
        }

        const startPos = getPointFromEvent(e);
        setSelectionBox({
            x: startPos.x,
            y: startPos.y,
            width: 0,
            height: 0,
            startX: startPos.x,
            startY: startPos.y,
        });
        if (!e.shiftKey) {
             setSelectedIds([]);
             setSelectedLineId(null);
        }
    };

    const handleMouseMove = (e) => {
        if (!interactionRef.current && !selectionBox && !isDrawing) return;
        
        const currentPos = getPointFromEvent(e);
        if (isDrawing && currentLine) { setCurrentLine(prev => ({ ...prev, points: [prev.points[0], currentPos] })); return; }
        
        const interaction = interactionRef.current;
        if (interaction) {
            const dx = currentPos.x - (interaction.startMouse?.x || 0);
            const dy = currentPos.y - (interaction.startMouse?.y || 0);
            
            if (interaction.type === 'drag') {
                updateState(prev => {
                    const newItemsState = { ...prev.items };
                    interaction.items.forEach(({ id, initialLeft, initialTop }) => {
                         newItemsState[id] = { ...newItemsState[id], left: `${initialLeft + dx}px`, top: `${initialTop + dy}px` };
                    });
                    return { ...prev, items: newItemsState }
                }, false);
            } else if (interaction.type === 'rotate') {
                const { id, itemRect } = interaction;
                const floorRect = floorPlanRef.current.getBoundingClientRect();
                const centerX = (itemRect.left - floorRect.left) + itemRect.width / 2;
                const centerY = (itemRect.top - floorRect.top) + itemRect.height / 2;
                const angle = Math.atan2(currentPos.y - centerY, currentPos.x - centerX) * (180 / Math.PI) + 90;
                updateState(prev => ({ ...prev, items: { ...prev.items, [id]: { ...prev.items[id], rotation: angle } } }), false);
            } else if (interaction.type === 'resize') {
                const { id, handle, startMouse, initialWidth, initialHeight, initialRotation } = interaction;
                const angleRad = (initialRotation * Math.PI) / 180;
                const projectedDx = dx * Math.cos(-angleRad) - dy * Math.sin(-angleRad);
                const projectedDy = dx * Math.sin(-angleRad) + dy * Math.cos(-angleRad);

                let newWidth = initialWidth;
                let newHeight = initialHeight;

                switch (handle) {
                    case 'right': newWidth = Math.max(20, initialWidth + projectedDx); break;
                    case 'bottom': newHeight = Math.max(20, initialHeight + projectedDy); break;
                    case 'proportional': const delta = Math.max(projectedDx, projectedDy); newWidth = Math.max(20, initialWidth + delta); newHeight = newWidth; break;
                    default: break;
                }
                updateState(prev => ({ ...prev, items: { ...prev.items, [id]: { ...prev.items[id], width: `${newWidth}px`, height: `${newHeight}px` } } }), false);
            }
        } else if (selectionBox) {
            const x = Math.min(selectionBox.startX, currentPos.x);
            const y = Math.min(selectionBox.startY, currentPos.y);
            const width = Math.abs(currentPos.x - selectionBox.startX);
            const height = Math.abs(currentPos.y - selectionBox.startY);
            setSelectionBox(prev => ({ ...prev, x, y, width, height }));
        }
    };

    const handleMouseUp = () => {
        if (isDrawing && currentLine) { setIsDrawing(false); if (Math.hypot(currentLine.points[1].x - currentLine.points[0].x, currentLine.points[1].y - currentLine.points[0].y) > 5) { updateState(prev => ({...prev, lines: {...prev.lines, [currentLine.id]: {id: currentLine.id, points: [currentLine.points[0], currentLine.points[1]]}}})); } setCurrentLine(null); }
        
        if (interactionRef.current) {
            commitHistory();
            interactionRef.current = null;
        }

        if (selectionBox) {
             const idsInBox = Object.values(items).filter(item => {
                const itemLeft = parseFloat(item.left);
                const itemTop = parseFloat(item.top);
                const itemWidth = parseFloat(item.width);
                const itemHeight = parseFloat(item.height);
                return (
                    selectionBox.x < itemLeft + itemWidth &&
                    selectionBox.x + selectionBox.width > itemLeft &&
                    selectionBox.y < itemTop + itemHeight &&
                    selectionBox.y + selectionBox.height > itemTop
                );
            }).map(item => item.id);
            
            setSelectedIds(prev => [...new Set([...prev, ...idsInBox])]);
            setSelectionBox(null);
        }
    };

    const handleJsonExport = () => { const dataToExport = { items, lines }; const jsonString = JSON.stringify(dataToExport, null, 2); const blob = new Blob([jsonString], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'cafe-layout.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); showMessage('配置已匯出！'); };
    const handleJsonImport = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (event) => { try { const importedData = JSON.parse(event.target.result); if (typeof importedData.items !== 'object' || typeof importedData.lines !== 'object') { throw new Error('Invalid JSON format'); } updateState(()=>({items: importedData.items || {}, lines: importedData.lines || {}})); showMessage('配置已成功匯入！'); } catch (error) { console.error("Failed to import JSON:", error); showMessage('匯入失敗，請檢查檔案格式。', 'error'); } finally { e.target.value = null; } }; reader.readAsText(file); };
    const handleClearCanvas = () => { showMessage('正在清除畫布...', 'info'); updateState(()=>({items: {}, lines: {}})); setSelectedIds([]); setSelectedLineId(null); showMessage('畫布已清除！'); };
    const onDrop = (e) => { e.preventDefault(); const type = e.dataTransfer.getData("application/cafe-item"); if (!type) return; const floorPlanBounds = floorPlanRef.current.getBoundingClientRect(); const dims = ITEM_STYLES[type] || ITEM_STYLES.default; const position = { x: e.clientX - floorPlanBounds.left, y: e.clientY - floorPlanBounds.top }; handleAddItem(type, { x: position.x - dims.width / 2, y: position.y - dims.height / 2 }); };
    
    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex', height: '100vh' }}>
                <CssBaseline />
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar>
                        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>咖啡廳座位規劃工具</Typography>
                        <Tooltip title="復原 (Ctrl+Z)"><Button color="inherit" onClick={undo} disabled={historyIndex === 0}><UndoIcon /></Button></Tooltip>
                        <Tooltip title="重做 (Ctrl+Y)"><Button color="inherit" onClick={redo} disabled={historyIndex === history.length - 1}><RedoIcon /></Button></Tooltip>
                        <Button color="inherit" startIcon={<UploadFileIcon />} component="label">匯入 JSON <input type="file" ref={fileInputRef} hidden onChange={handleJsonImport} accept=".json" /></Button>
                        <Button color="inherit" startIcon={<DownloadIcon />} onClick={handleJsonExport}>匯出 JSON</Button>
                        <Button color="inherit" startIcon={<PngIcon />} onClick={()=>{}} disabled={!pngExportReady}>匯出 PNG</Button>
                        <Button color="secondary" variant="contained" startIcon={<DeleteIcon />} onClick={handleClearCanvas} sx={{ ml: 2 }}>清除畫布</Button>
                    </Toolbar>
                </AppBar>
                <ToolbarComponent isDrawing={isDrawing} setIsDrawing={setIsDrawing} onDeleteLine={handleDeleteLine} selectedLineId={selectedLineId} onDeleteItems={handleDeleteItems} hasSelection={selectedIds.length > 0} onCopy={()=>{}} onPaste={()=>{}} clipboardHasContent={false} />
                <Box component="main" sx={{ flexGrow: 1, p: 3, position: 'relative' }} onMouseUp={handleMouseUp} onMouseMove={handleMouseMove} >
                    <Toolbar />
                    <Paper ref={floorPlanRef} onDrop={onDrop} onDragOver={(e) => e.preventDefault()}
                        sx={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                            overflow: 'hidden',
                            backgroundColor: '#f7f7f7',
                            backgroundImage: 'linear-gradient(to right, #e0e0e0 1px, transparent 1px), linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                            cursor: isDrawing ? 'crosshair' : 'default'
                        }}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}
                    >
                         {selectionBox && (
                            <Box sx={{
                                position: 'absolute',
                                border: '1px dashed #2979ff',
                                backgroundColor: 'rgba(41, 121, 255, 0.2)',
                                left: selectionBox.x,
                                top: selectionBox.y,
                                width: selectionBox.width,
                                height: selectionBox.height
                            }}/>
                        )}
                        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                             {Object.values(lines).map(line => (<g key={line.id}><line x1={line.points[0].x} y1={line.points[0].y} x2={line.points[1].x} y2={line.points[1].y} stroke={selectedLineId === line.id ? theme.palette.secondary.main : "#333333"} strokeWidth="5" strokeLinecap="round" style={{pointerEvents: 'auto', cursor: 'pointer'}} onClick={(e) => { e.stopPropagation(); setSelectedLineId(line.id); setIsDrawing(false); setSelectedIds([]) }} /> </g>))}
                             {currentLine && (<line x1={currentLine.points[0].x} y1={currentLine.points[0].y} x2={currentLine.points[1].x} y2={currentLine.points[1].y} stroke={theme.palette.secondary.main} strokeWidth="5" strokeDasharray="5,5" strokeLinecap="round" />)}
                        </svg>
                        {Object.values(items).map(item => (<CafeItem key={item.id} data={item} tableNumber={tableNumbers[item.id]} onUpdate={handleUpdateItem} isSelected={selectedIds.includes(item.id)} onInteractionStart={handleItemInteractionStart} onResizeStart={handleResizeStart} />))}
                    </Paper>
                </Box>
                <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
}
