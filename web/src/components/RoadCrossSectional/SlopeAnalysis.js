import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Arc, Text, Rect, Line, Circle } from 'react-konva';
import {findZeroIndex, genZero, genSlope, pointDistOfLine} from '../../Action/ext'
const SlopeAnalysis = ({basePoints, mainOffset, scale, offset, centerH}) => {
    const [baseY] = useState(50)
    const [points, setPoints] = useState([]);
    const [zeroIndex, setZeroIndex] = useState(0)
    useEffect(() => {
        const baseContentWithZero = genZero(basePoints);
        setPoints(baseContentWithZero)
        const zeroIndex = findZeroIndex(baseContentWithZero);
        if (zeroIndex >= 0) {
            setZeroIndex(zeroIndex)
        }
        console.log(baseContentWithZero)
    }, [basePoints])

    const trainX = (x) => (x - mainOffset.minX) * scale.x + offset.x
    const trainY = (y) => (mainOffset.maxY - y) * scale.y + baseY + offset.y

    const shows = () => {
        let h = points[zeroIndex][1];
        console.log(points)
        const ps = [
                        [trainX(points[0][0]), trainY(points[0][1])],
                        [trainX(0), trainY(h)],
                        [trainX(points[points.length - 1][0]), trainY(points[points.length - 1][1])]
                    ]
        const slopeL = (points[0][1] - points[zeroIndex][1]) / points[0][0];
        const slopeR = (points[zeroIndex][1] - points[points.length - 1][1]) / points[points.length - 1][0];
        return <>
            {
                ps.map(([x, y], i) => <Circle key={`slope_point_${i}`} 
                                                    x={x} y={y} 
                                                    radius={2}
                                                    fill={"red"}
                                                    stroke="black"
                                                    strokeWidth={1}/>)
            }

            <Line
                points={ps.reduce((map, [x,y]) => ([...map, x,y - baseY]), [])}
                stroke={ "red"}
                strokeWidth={1}
                lineCap="round"
                lineJoin="round"
                y={50}
            />

            <Text
                x={(ps[0][0] + ps[1][0]) / 2}
                y={baseY+10}
                text={`L.Slope=${(slopeL* 100).toFixed(3) } %`}
                fontSize={10}
                fontFamily="Calibri"
                fill={"red"}
            />
            <Text
                x={(ps[1][0] + ps[2][0]) / 2}
                y={baseY + 10}
                text={`R.Slope=${(slopeR * 100).toFixed(3)} %`}
                fontSize={10}
                fontFamily="Calibri"
                fill={"red"}
            />
        </>
    }
    return <>
    {
        points.length > zeroIndex ? shows() : <></>
    }
    </>
}

export default SlopeAnalysis;