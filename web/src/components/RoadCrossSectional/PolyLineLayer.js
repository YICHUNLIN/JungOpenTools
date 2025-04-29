import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Arc, Text, Rect, Line, Circle } from 'react-konva';

const PolyLineLayer = ({data, scale, offset, lineColor, pointColor, textColor}) => {
    const [minX, setMinX] = useState(0);
    const [maxY, setMaxY] = useState(0);
    useEffect(() => {
        setMinX(data.points.reduce((min, p) => p[0] < min ? p[0] : min, 10000))
        setMaxY(data.points.reduce((max, p) => p[1] > max ? p[1] : max, -1000))
    }, [data])
    
    return <Layer>
                <Line
                points={data.points.reduce((map, d) => ([...map, (d[0] - minX) * scale.x + offset.x, (maxY - d[1])*scale.y + offset.y]), [])}
                stroke={lineColor ?? "green"}
                strokeWidth={2}  
                lineCap="round"
                lineJoin="round"
                y={50}
                />
                {
                    data.points.reduce((map, d) => ([...map, [(d[0] - minX)*scale.x + offset.x, (maxY - d[1])*scale.y + 2* offset.y]]), [])
                        .map((p, i) => <Circle 
                                        key={`point_${i}_p`} 
                                        x={p[0]}
                                        y={p[1]}
                                        radius={3}
                                        fill={pointColor ?? "red"}
                                        stroke="black"
                                        strokeWidth={1}/>)
                }
                {
                    data.points.reduce((map, d) => ([...map, [(d[0] - minX)*scale.x + offset.x, (maxY - d[1] )*scale.y + 2* offset.y]]), [])
                        .map((p, i) => <Text key={`point_${i}_txt`}
                                    x={p[0]-20}
                                    y={p[1]+8 * (i % 2 == 0 ? 1 : 2)}
                                    text={`(${data.points[i][0].toFixed(3)}, ${data.points[i][1].toFixed(3)})`}
                                    fontSize={8}
                                    fontFamily="Calibri"
                                    fill={textColor ?? "red"}
                                />)
                }
            </Layer>
}

export default PolyLineLayer;