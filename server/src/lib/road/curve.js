const Obj = require('./obj')
function Curve(args){
    Obj.call(this, "curve", args.start, args.end);
    this.r = args.r;
    this.center = args.center;
    this.start_angles = args.start_angles;
    this.end_angles = args.end_angles;
    this.bulge = args.bulge;
}
Curve.prototype = Object.create(Obj.prototype)

// 計算距離起點某弧長的座標
Curve.prototype.__calculatePCoordinates = function(circleCenter, radius, aCoord, arcLength) {
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

Curve.prototype.pointOfLength = function(Length){ 
    const pCoords = calculatePCoordinates([this.center.x, this.center.y], this.r, [this.start_angles.x, this.start_angles.y], Length);
    if (this.bulge > 0) return pCoords[0];
    return pCoords[1];
}

module.exports = Curve