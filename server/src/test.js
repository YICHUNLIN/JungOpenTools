const {Point, Line, Curve} = require('./lib/road')
const data = [
    {
        type: 'line',
        start: {x:181013.6892,y:2704397.6247},
        end: {x:180995.2537,y:2704458.2973}
    },
    {
        type: 'curve',
        bulge:  -0.0088,
        center: {x:182047.3791,y:2704779.2833},
        r: 1100,
        start_angles: 197,
        end_angles: 195,
        start: {x:180995.2537,y:2704458.2973},
        end: {x:180984.6472,y:2704495.3804}
    },
    {
        type: 'line',
        start: {x:180984.6472,y:2704495.3804},
        end: {x:180979.4422,y:2704514.8645}
    },
    {
        type: 'curve',
        bulge:  0.0158,
        center: {x:179916.7103,y:2704230.9615},
        r: 1100,
        start_angles: 15,
        end_angles: 19,
        start: {x:180979.4422,y:2704514.8645},
        end: {x:180959.3663,y:2704581.4874}
    },
    {
        type: 'line',
        start: {x:180959.3663,y:2704581.4874},
        end: {x:180940.2467,y:2704638.3595}
    },
    {
        type: 'curve',
        bulge:   -0.0086,
        center: {x:181982.9028,y:2704988.8853 },
        r: 1100,
        start_angles: 199,
        end_angles: 197,
        start: {x:180940.2467,y:2704638.3595},
        end: {x:180928.8247,y:2704674.3709 }
    },
    {
        type: 'line',
        start: {x:180928.8247,y:2704674.3709 },
        end: {x:180868.5441,y:2704876.3979}
    },
    {
        type: 'curve',
        bulge:   0.0316,
        center: {x:180120.7715 ,y:2704653.2785 },
        r: 780.35,
        start_angles: 17,
        end_angles: 24,
        start: {x:180868.5441,y:2704876.3979},
        end: {x:180834.4925 ,y:2704968.7916 }
    },
    {
        type: 'line',
        start: {x:180834.4925 ,y:2704968.7916 },
        end: {x:180809.8978,y:2705024.4271}
    },
    {
        type: 'curve',
        bulge:  -0.0049,
        center: {x:180992.5010 ,y:2705105.1501 },
        r: 199.65,
        start_angles: 204,
        end_angles: 203,
        start: {x:180809.8978,y:2705024.4271},
        end: {x:180808.3619  ,y:2705027.9949}
    },
    {
        type: 'line',
        start: {x:180808.3619  ,y:2705027.9949},
        end: {x:180736.8242,y:2705199.7513}
    },
    {
        type: 'curve',
        bulge:  -0.0124,
        center: {x:182122.9913  ,y:2705772.0196},
        r: 1499.65,
        start_angles: 202,
        end_angles: 200,
        start: {x:180736.8242,y:2705199.7513},
        end: {x:180710.1574  ,y:2705269.1771}
    },
    {
        type: 'line',
        start: {x:180710.1574  ,y:2705269.1771},
        end: {x:180660.2823,y:2705409.3109}
    },
    {
        type: 'curve',
        bulge:  -0.0054,
        center: {x:181602.0617  ,y:2705744.5001 },
        r: 999.65,
        start_angles: 200,
        end_angles: 198,
        start: {x:180660.2823,y:2705409.3109},
        end: {x:180653.2743   ,y:2705429.6944}
    },
    {
        type: 'line',
        start: {x:180653.2743 ,y:2705429.6944},
        end: {x:180528.9190,y:2705804.8042}
    },
];



function calculatePCoordinates(circleCenter, radius, aCoord, arcLength) {
    const [xo, yo] = circleCenter;
    const [xa, ya] = aCoord;
    const r = radius;
    const l = arcLength;
  
    // 1. 計算向量 OA
    const oaVec = [xa - xo, ya - yo];
  
    // 2. 計算 OA 的單位向量 uaVec
    const oaMag = Math.sqrt(oaVec[0] ** 2 + oaVec[1] ** 2);
    const uaVec = [oaVec[0] / oaMag, oaVec[1] / oaMag];
  
    // 3. 計算弧 AP 所對應的圓心角 theta
    const theta = l / r;
  
    // 4. 計算逆時針方向的 P 點座標 (pCcw)
    const xpCcw = xo + r * (Math.cos(theta) * uaVec[0] - Math.sin(theta) * uaVec[1]);
    const ypCcw = yo + r * (Math.sin(theta) * uaVec[0] + Math.cos(theta) * uaVec[1]);
  
    const pCcwCoord = [xpCcw, ypCcw];
  
    // 5. 計算順時針方向的 P 點座標 (pCw)
    const xpCw = xo + r * (Math.cos(-theta) * uaVec[0] - Math.sin(-theta) * uaVec[1]);
    const ypCw = yo + r * (Math.sin(-theta) * uaVec[0] + Math.cos(-theta) * uaVec[1]);
  
    const pCwCoord = [xpCw, ypCw];
  
    return [pCcwCoord, pCwCoord];
  }
  
  // 示例
  const circleCenter = [182047.3791, 2704779.2833]; // 圓心
  const radius = 1100; // 半徑
  const aCoord = [180995.2537, 2704458.2973]; // 切點 A
  const arcLength = 5; // 弧 AP 的長度 (例如: 90 度對應的弧長)
  
  const pCoords = calculatePCoordinates(circleCenter, radius, aCoord, arcLength);
  console.log("逆時針方向的 P 點座標:", pCoords[0]);
  console.log("順時針方向的 P 點座標:", pCoords[1]);