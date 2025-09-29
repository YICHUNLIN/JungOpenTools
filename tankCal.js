
/**
 * @param {*} storage {
 *  n 季實際儲存天數
 *  H 平均儲存液面高
 *  Q 季物料進料量
 * }
 * 儲存液體參數
 * @param {*} content {
 *  Mv 分子量 g/g-mole
 *  Kp 產品係數
 * }
 * 
 * 桶槽參數
 * @param {*} tank {
 *  D  桶槽直徑
 *  H 桶槽高度
 *  alpha 顏色係數(槽頂顏色-側面顏色)
 * }
 * 
 * 溫度參數
 * @param {*} temp {
 *  T       平均縣市溫度
 *  deltaT  平均日溫差
 * }
 * 
 * 大氣壓力參數 atm press
 * @param {*} atmPress {
 *  P           液體狀況時之真實爭氣壓 psia, 與儲槽內溫度有關 (金門縣重油)
 *  deltaPv     平均日蒸氣壓差 psia
 * }
 */

function TankCal(storage, content, tank, temp, psiaPress){
    // PI * r^2 * H
    const V = Math.PI * (tank.D/2)*(tank.D/2) * tank.H;
    const N = (4 * storage.Q) / V;
    const Kn = N > 36 ? (180+N)/(6*N) : 1;
    //const Kn = 1;

    const R = 0.082057;           // L·atm/(mol·K)
    const TK = temp.T + 273.15;        // 攝氏 → 開氏
    const Patm = psiaPress.P * (1/14.6959);  // psia → atm
    // 密度 (g/L)
    const rho_gL = (Patm * content.Mv) / (R * TK);
    // 轉成 g/cm3
    //const Wv = rho_gL / 1000;
    const Wv = 2.32671 / 1000000
    const total1 = 4596.41 * Wv * ((
            (1.296 * temp.deltaT + 56 * tank.alpha) 
                    / 
            (1.8 * temp.T + 492))
            +
            ((psiaPress.deltaPv - 0.06) 
                    / 
            (14.7 - psiaPress.P))
        )
    const total2 = 2.885 / 1000 * content.Mv * psiaPress.P * Kn;
    const total3 = 0.174 * psiaPress.P;
    const Hvo = tank.H - storage.H + 0.01 * tank.D;
    const Lt = (total1 * tank.D * tank.D * Hvo) / (1 + total3 * Hvo) + total2 * storage.Q;
    return {V, N, Kn, Wv, total1, total2, total3, Hvo, Lt, Q: storage.Q,年逸散量:Lt*4/1000
    }
  
}


// const result = TankCal(
//     {n: 90, H: 1.5, Q: 56.25},
//     {Mv:190, Kp: 1}, 
//     {D: 1.2, H: 1.75, alpha: 0.89}, 
//     {T: 23.4, deltaT: 5.7},
//     {P: 0.000072, deltaPv: 0.00003})
// console.log(result)

const result = TankCal(
    {n: 90, H: 3.2, Q: 18.75},
    {Mv:190, Kp: 1}, 
    {D: 2.5, H: 4, alpha: 0.89}, 
    {T: 23.4, deltaT: 5.7},
    {P: 0.000072, deltaPv: 0.00003})
console.log(result)

module.exports = TankCal;