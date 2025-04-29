import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Arc, Text, Rect, Line, Circle } from 'react-konva';
import PolyLineLayer from './PolyLineLayer';
import { Table, TableBody, TableCell, TableRow, TextField } from '@mui/material';

/**
點號	1	2	3	4	5	6	7	8
支距	-1.598	-0.008	2.034	4.01	6.14	6.201	8.432	8.453
前視讀數	1.194	1.156	1.121	1.136	1.182	1.179	1.125	1.125
高程	7.991	8.029	8.064	8.049	8.003	8.006	8.06	8.06 


 */

const BaseLayer = ({name, width, height, mousePos}) => {
    return <Layer>
        <Text
            x={10}
            y={15}
            text={name}
            fontSize={20}
            fontFamily="Calibri"
            fill="green"
        />
        <Text
            x={10}
            y={height - 20}
            text={`(${mousePos.x}, ${mousePos.y})`}
            fontSize={12}
            fontFamily="Calibri"
            fill="red"
        />
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
const Section = ({section, width, height}) => {
    const [mousePos, setMousePos] = useState({x: 0, y: 0})
    const [scale, setScale] = useState({x: 70, y: 200});
    const [offset, setOffset] = useState({x: 50, y: 50})
    return <>
        {/* <Table>
            <TableBody>
                <TableRow>
                    <TableCell><TextField variant="standard" label="左邊坡度%" fullWidth/></TableCell>
                    <TableCell><TextField variant="standard" label="中心點高程" fullWidth/></TableCell>
                    <TableCell><TextField variant="standard" label="右邊坡度%" fullWidth/></TableCell>
                </TableRow>
            </TableBody>
        </Table> */}
        <Stage width={width} height={height}
            onMouseMove={e => setMousePos({x: e.evt.clientX , y: e.evt.clientY })}>
                <BaseLayer width={width} height={height} name={section.name} mousePos={mousePos}/>
                {
                    section.layers.map((s, i) => 
                    <PolyLineLayer  key={`polyline_layer_${i}`}
                        data={s}
                        lineColor={s.color}
                        offset={offset}
                        scale={scale}/>)
                }
                {

                }
                {
                    section.layers.map((s, i) => 
                        // 圖例
                        <Layer key={`legend_${i}`}>
                            <Text 
                            x={10}
                            y={50+ i * 10}
                            text={s.name}
                            fontSize={12}
                            fontFamily="Calibri"
                            fill={s.color ?? 'green'}/>
                        </Layer>)
                }        
        </Stage>
    
    </>
}

export default Section