import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Arc, Text, Rect, Line, Circle } from 'react-konva';
import {findZeroIndex, genZero, genSlope, pointDistOfLine} from '../../Action/ext'
const Leveling = ({data, basePoints, mainOffset, scale, offset, centerH}) => {
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
    }, [data])

    const trainX = (x) => (x - mainOffset.minX) * scale.x + offset.x
    const trainY = (y) => (mainOffset.maxY - y) * scale.y + baseY + offset.y

    const shows = () => {
        let h = points[zeroIndex][1] + centerH;
        let leftH = genSlope(data.llength, data.lslope, h)
        let rightH = genSlope(data.rlength, data.rslope, h)
        const s1 = points.filter(p => p[0] < 0)
            .map(p => ([trainX(p[0]), trainY(p[1]), pointDistOfLine({x:p[0], y:p[1]},{x: -data.llength,y: leftH}, {x:0, y:h})]))
        const s2 = points.filter(p => p[0] >= 0)
            .map(p => ([trainX(p[0]), trainY(p[1]), pointDistOfLine({x:p[0], y:p[1]}, {x:0, y:h},{x: data.rlength,y: rightH})]))
        const ps = [
                        [trainX(-data.llength), trainY(leftH)],
                        [trainX(0), trainY(h)],
                        [trainX(data.rlength),trainY(rightH)]
                    ]
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
                stroke={ "blue"}
                strokeWidth={1}
                lineCap="round"
                lineJoin="round"
                y={50}
            />
            {
                s1.map((s, i) => <Text 
                                    key={`s1_diff_${i}`} 
                                    x={s[0] - 10} y={s[1] + 50 + (i % 2 == 0 ? 5 : 0)} 
                                    text={`${s[2]}`} 
                                    fontSize={8} 
                                    fontFamily="Calibri" 
                                    fill="red"/>)
            }

            {
                s2.map((s, i) => <Text 
                                    key={`s1_diff_${i}`} 
                                    x={s[0] - 10} y={s[1] + 50 + (i % 2 == 0 ? 5 : 0)} 
                                    text={`${s[2]}`} 
                                    fontSize={8} 
                                    fontFamily="Calibri" 
                                    fill="red"/>)
            }

            <Text
                x={ps[0][0]}
                y={baseY}
                text={`NewL.H=${leftH.toFixed(3)}`}
                fontSize={8}
                fontFamily="Calibri"
                fill={"red"}
            />
            <Text
                x={(ps[0][0] + ps[1][0]) / 2}
                y={baseY}
                text={`L.Slope=${data.lslope * 100} %`}
                fontSize={8}
                fontFamily="Calibri"
                fill={"red"}
            />
            <Text
                x={ps[1][0]}
                y={baseY}
                text={`NewCL.H=${h}`}
                fontSize={8}
                fontFamily="Calibri"
                fill={"red"}
            />

            <Text
                x={(ps[1][0] + ps[2][0]) / 2}
                y={baseY}
                text={`R.Slope=${data.rslope * 100} %`}
                fontSize={8}
                fontFamily="Calibri"
                fill={"red"}
            />
            <Text
                x={ps[2][0]}
                y={baseY}
                text={`NewR.H=${rightH.toFixed(3)}`}
                fontSize={8}
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

export default Leveling;