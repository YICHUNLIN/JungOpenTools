import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Arc, Text, Group, Line, Circle } from 'react-konva';
import {findZeroIndex, genZero} from '../../Action/ext'



const PolyLine = ({data, scale, offset, lineColor, pointColor, textColor, config, mainOffset}) => {
    const [baseY] = useState(50)
    const [points, setPoints] = useState([])
    useEffect(() => {
        setPoints(genZero(data.points))
    }, [data]);
    return <Group draggable 
                    x={0} 
                    y={0} 
                    onDragMove={e => {}}
                    onDragEnd={e => {}}>
            {
                config?.showCL ? <>
                    <Line
                        points={[-mainOffset.minX * scale.x + offset.x, 10, -mainOffset.minX * scale.x + offset.x, 80]}
                        stroke={"red"}
                        strokeWidth={1}  
                        lineCap="round"
                        lineJoin="round"
                        y={baseY}
                    />
                    <Text
                        x={- mainOffset.minX * scale.x + offset.x - 5}
                        y={baseY}
                        text={`CL`}
                        fontSize={8}
                        fontFamily="Calibri"
                        fill={"red"}
                    />
                </> : ""
            }
            
            {
                points.reduce((map, d) => ([...map, [(d[0] - mainOffset.minX)*scale.x + offset.x, (mainOffset.maxY - d[1])*scale.y + baseY + offset.y]]), [])
                    .map((p, i) => <Circle 
                                    key={`point_${i}_p`} 
                                    x={p[0]}
                                    y={p[1]}
                                    radius={2}
                                    fill={pointColor ?? "red"}
                                    stroke="black"
                                    strokeWidth={1}/>)
            }
            {
                config?.showText ? 
                points.reduce((map, d) => ([...map, [(d[0] - mainOffset.minX)*scale.x + offset.x, (mainOffset.maxY - d[1] )*scale.y + baseY + offset.y]]), [])
                    .map((p, i) => <Text key={`point_${i}_txt`}
                                x={p[0]-20}
                                y={p[1]+30 * (i % 2 == 0 ? 1 : 1.7)}
                                text={`(${points[i][0].toFixed(3)}, ${points[i][1].toFixed(3)})`}
                                fontSize={8}
                                fontFamily="Calibri"
                                fill={textColor ?? "red"}
                            />)
                : ""
            }
            <Line
                points={points.reduce((map, d) => ([...map, (d[0] - mainOffset.minX) * scale.x + offset.x, (mainOffset.maxY - d[1])*scale.y + offset.y]), [])}
                stroke={lineColor ?? "green"}
                strokeWidth={2}
                lineCap="round"
                lineJoin="round"
                y={baseY}
                />
    </Group>
}

export default PolyLine;