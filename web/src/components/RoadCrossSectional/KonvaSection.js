import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Arc, Text, Rect, Line, Group } from 'react-konva';
import PolyLine from './PolyLine';
import SlopeAnalysis from './SlopeAnalysis'
import {indexOfMax, indexOfMin} from '../../Action/ext'
import Leveling from './Leveling';
import { TextField } from '@mui/material';

// 繪圖板基礎層
const BaseLayer = ({name, width, height, mousePos, showGrid,toolConfig}) => {
    const [grid] = useState({x: Math.floor(height/20), y: Math.floor(width/20)})
    const genGrids = () => {
        const lines = [];
        for (var i = 0; i < grid.x; i++){
            lines.push(<Line key={`grid_x_${i}`}
                        points={[0,i*20, width, i*20]}
                        stroke={"grey"}
                        strokeWidth={1}  
                        lineCap="round"
                        lineJoin="round"
                        y={0}
                    />)
        }
        for(var i = 0; i < grid.y; i++){
            lines.push(<Line key={`grid_y_${i}`}
                        points={[i*20,0, i*20, height]}
                        stroke={"grey"}
                        strokeWidth={1}  
                        lineCap="round"
                        lineJoin="round"
                        y={0}
                    />)
        }
        return lines;
    }
    return <Layer>
        {
            toolConfig.hasOwnProperty("SHOW_GRIDS") ? genGrids() : ""
        }
        <Text
            x={10}
            y={15}
            text={name}
            fontSize={20}
            fontFamily="Calibri"
            fill="green"
        />
        {
            toolConfig.hasOwnProperty("SHOW_MOUSE_LOCATION") ? <Text
                x={10}
                y={height - 20}
                text={`(${mousePos.x}, ${mousePos.y})`}
                fontSize={12}
                fontFamily="Calibri"
                fill="red"
            /> : ''
        }
        
        <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            stroke="black"
            strokeWidth={2}
            />
    </Layer>
}


const Section = ({section, width, height, toolConfig}) => {
    const [mousePos, setMousePos] = useState({x: 0, y: 0})
    const [scale] = useState({x: 70, y: 70});
    const [offset] = useState({x:250, y: 50});
    const [mainOffset,setMainOffset] = useState({minX: 0, maxY: 0}) // 所有曲線的位移
    const [CL,setCL] = useState({x: 0, y: 0})
    const [levelingCenterH, setLevelingCenterH] = useState(0)
    // 計算位移
    useEffect(() => {
        if (section.layers.length > 0){
            const p = section.layers[0].points.filter(p => p[0]===0);
            setCL({...CL,y: p[1]})
        }
        const minX = section.layers.filter(l => l.type === "BASE").reduce((min, d) => {
            console.log(d.points)
            const s = d.points.reduce((min, p) => p[0] < min ? p[0] : min, 10000);
            return s < min ? s : min
        }, 10000);
        const maxY = section.layers.filter(l => l.type === "BASE").reduce((max, d) => {
            const s = d.points.reduce((max, p) => p[1] > max ? p[1] : max, -10000);
            return s < max ? s : max;
        }, 10000);
        setMainOffset({minX, maxY})
    }, [section])

    if (section.layers.filter(l => l.type === "BASE").length > 1) return <p>{section.name} BASE層 只能有一個</p>
    if (section.layers.filter(l => l.type === "LEVELING").length > 1) return <p>{section.name} LEVELING層 只能有一個</p>
    return <>
        {
            toolConfig.hasOwnProperty("SHOW_LEVELING") ? 
            <TextField 
            label="中心高,cm公分"
            variant="standard" 
            type='number'
            onChange={e => setLevelingCenterH(e.target.value / 100)}
            fullWidth/> : ''
        }
        
        <Stage width={width} height={height}
            onMouseMove={e => setMousePos({x: e.evt.clientX , y: e.evt.clientY })}>
                <BaseLayer 
                    width={width} 
                    height={height} 
                    name={section.name} 
                    toolConfig={toolConfig}
                    mousePos={mousePos}/>
                <Layer>
                    {
                        section.layers.filter(l => l.type === "BASE").map((s, i) => <PolyLine key={`polyline_${i}`}
                            data={s}
                            mainOffset={mainOffset}
                            lineColor={s.color}
                            textColor={s.color}
                            offset={offset}
                            scale={scale}
                            config={{
                                showText: toolConfig.hasOwnProperty("SHOW_POINT_TEXT"),
                                showCL: toolConfig.hasOwnProperty("SHOW_CL") && (i === 0)
                                }}/>
                        )
                    }
                    {

                        toolConfig.hasOwnProperty("SHOW_OTHER") ?
                        section.layers.filter(l => l.type === "NORMAL").map((s, i) => <PolyLine key={`polyline_normal_${i}`}
                            data={s}
                            mainOffset={mainOffset}
                            lineColor={s.color}
                            textColor={s.color}
                            offset={offset}
                            scale={scale}
                            config={{
                                showText: toolConfig.hasOwnProperty("SHOW_POINT_TEXT"),
                                showCL: toolConfig.hasOwnProperty("SHOW_CL") && (i === 0)
                            }}/>
                        ): ""
                    }
                    {
                        toolConfig.hasOwnProperty("SHOW_SLOPE_ANALYSIS") ?
                        section.layers.filter(l => l.type === "BASE")
                            .map((s, i) => <SlopeAnalysis key={`slope_analysis_${i}`}
                                basePoints={s.points}
                                mainOffset={mainOffset}
                                offset={offset}
                                scale={scale}/> ) : ''
                    }
                    {
                        toolConfig.hasOwnProperty("SHOW_LEVELING") ?
                        section.layers.filter(l => l.type === "LEVELING")
                            .map((s, i) => <Leveling key={`leveling_with_base_${i}`} 
                                centerH={levelingCenterH}
                                basePoints={section.layers.filter(l => l.type === "BASE")[0].points}
                                data={s} 
                                mainOffset={mainOffset}
                                offset={offset}
                                scale={scale}/>) : ""
                    }
                </Layer>
                <Layer >
                    {
                        toolConfig.hasOwnProperty("SHOW_LEGEND") ? 
                            // 圖例
                            section.layers.map((s, i) => 
                                <Text key={`legend_${i}`}
                                x={10}
                                y={50+ i * 20}
                                text={s.name}
                                fontSize={12}
                                fontFamily="Calibri"
                                fill={s.color ?? 'green'}/>
                            ) : ""
                    }
                    {
                        toolConfig.hasOwnProperty("SHOW_RATIO") 
                            ? <Text x={width-170} y={height-20}
                                text={`Scale:(${scale.x},${scale.y});Offset:(${offset.x},${offset.y})`}
                                fontSize={12}
                                fontFamily="Calibri"
                                fill={'red'}/> 
                            : ''
                    }
                    
                </Layer>     
        </Stage>
    
    </>
}

export default Section