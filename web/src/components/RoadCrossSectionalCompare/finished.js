import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Arc, Text, Rect, Line, Circle } from 'react-konva';
import {findZeroIndex, genZero, genSlope, pointDistOfLine} from '../../Action/ext'

const Finished = ({data, basePoints, mainOffset, scale, offset, centerH,lwidth, rwidth, lslope, rslope}) => {
    const [baseY] = useState(50)
    const [points, setPoints] = useState([]);
    const [zeroIndex, setZeroIndex] = useState(0);

    useEffect(() => {
        const baseContentWithZero = genZero(basePoints);
        setPoints(baseContentWithZero)
        const zeroIndex = findZeroIndex(baseContentWithZero);
        if (zeroIndex >= 0) {
            setZeroIndex(zeroIndex)
        }
    }, [data]);

    const trainX = (x) => (x - mainOffset.minX) * scale.x + offset.x
    const trainY = (y) => (mainOffset.maxY - y) * scale.y + baseY + offset.y
    const shows = () => {
        let h = points[zeroIndex][1] + centerH;
        let leftH = genSlope(lwidth, lslope, h)
        let rightH = genSlope(rwidth, rslope, h);
        const s1 = points.filter(p => p[0] < 0)
            .map(p => ([trainX(p[0]), trainY(p[1]), pointDistOfLine({x:p[0], y:p[1]},{x: -lwidth,y: leftH}, {x:0, y:h})]))
        const s2 = points.filter(p => p[0] >= 0)
            .map(p => ([trainX(p[0]), trainY(p[1]), pointDistOfLine({x:p[0], y:p[1]}, {x:0, y:h},{x: rwidth,y: rightH})]))
        const ps = [
                        [trainX(-lwidth), trainY(leftH)],
                        [trainX(0), trainY(h)],
                        [trainX(rwidth),trainY(rightH)]];

        const genThreePoint = () => {
            return ps.map(([x, y], i) => <Circle key={`slope_point_${i}`} 
                                                    x={x} y={y} 
                                                    radius={2}
                                                    fill={"red"}
                                                    stroke="black"
                                                    strokeWidth={1}/>);
        }

        const genLineAndText = () => {
            return <>
                    <Line
                    points={ps.reduce((map, [x,y]) => ([...map, x,y - baseY]), [])}
                    stroke={ "blue"}
                    strokeWidth={1}
                    lineCap="round"
                    lineJoin="round"
                    y={50}
                />

                <Text
                    x={ps[0][0]}
                    y={baseY}
                    text={`N-LT.H=${leftH.toFixed(3)}`}
                    fontSize={8}
                    fontFamily="Calibri"
                    fill={"red"}
                />
                <Text
                    x={(ps[0][0] + ps[1][0]) / 2}
                    y={baseY}
                    text={`L.Slope=${lslope * 100} %`}
                    fontSize={8}
                    fontFamily="Calibri"
                    fill={"red"}
                />
                <Text
                    x={ps[1][0]}
                    y={baseY-10}
                    text={`N-CL.H=${h.toFixed(3)}`}
                    fontSize={8}
                    fontFamily="Calibri"
                    fill={"red"}
                />

                <Text
                    x={(ps[1][0] + ps[2][0]) / 2}
                    y={baseY}
                    text={`R.Slope=${rslope * 100} %`}
                    fontSize={8}
                    fontFamily="Calibri"
                    fill={"red"}
                />
                <Text
                    x={ps[2][0]}
                    y={baseY}
                    text={`N-RT.H=${rightH.toFixed(3)}`}
                    fontSize={8}
                    fontFamily="Calibri"
                    fill={"red"}
                />
            </>
        }
        return <>
            { genThreePoint()}
            {genLineAndText()}
        </>
    }
    return <>
    {
        points.length > zeroIndex ? shows() : <></>
    }
    </>
}

export default Finished;