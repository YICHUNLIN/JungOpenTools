export const indexOfMax = (arr) => {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

export const indexOfMin = (arr) => {
    if (arr.length === 0) {
        return -1;
    }

    var min = arr[0];
    var minIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] < min) {
            minIndex = i;
            min = arr[i];
        }
    }

    return minIndex;
}

export const findOfMax = (arr) => {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }

    return max;
}

export const findOfMin = (arr) => {
    if (arr.length === 0) {
        return -1;
    }

    var min = arr[0];

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] < min) {
            min = arr[i];
        }
    }

    return min;
}

// 斷面高成資料中 產生 X=0的CL
export const genZero = (points) => {
    if (points.filter(d => d[0] === 0).length > 0) return points;// 如果本來就有0,不用產生
    let native = points.filter(d => (d[0] < 0));
    let pastive = points.filter(d => (d[0] > 0));
    const n = native[indexOfMax(native.map(d => d[0]))];
    const p = pastive[indexOfMin(pastive.map(d => d[0]))];
    const y = n[1] + (p[1] - n[1]) * ((0 - n[0]) / (p[0] - n[0]))
    const zeroY = parseFloat(y.toFixed(3));
    return [...native, [0, zeroY], ...pastive]
}

export const findZeroIndex = (points) => {
    return points.findIndex(item => item[0] === 0)
}

/**
 * dist X距離, slope 坡度, h 中心線的高程
 */
export const genSlope = (dist, slope, h) => {
    return h - dist * slope;
}

/**
 * 行列式
 * @param {*} vertexes 
 * @returns 
 */
export const det = (vertexes) => {
    let add = 0.0;
    let minus = 0.0;
    for(var i = 0; i < vertexes.length; i++) {
        let next = i + 1;
        if (next == vertexes.length) next = 0;
        add += vertexes[i][0] * vertexes[next][1];
    }

    for(var i = 0; i < vertexes.length; i++) {
        let next = i + 1;
        if (next == vertexes.length) next = 0;
        minus += vertexes[next][0] * vertexes[i][1];
    }
    return Math.abs(add - minus) / 2
}

export const pointDistOfLine = (p, p1, p2) => {
    const m = (p1.y - p2.y) / (p1.x - p2.x);
    const b =  p1.y - m * p1.x;
    const y = m * p.x + b;
    const l = y - p.y;
    return (l > 0 ? l : -l).toFixed(3);
}