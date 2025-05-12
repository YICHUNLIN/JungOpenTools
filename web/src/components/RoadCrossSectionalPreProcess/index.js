import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Xlsx from './xlsx';
import {utils} from 'xlsx';
import { Button } from '@mui/material';
const parser = (raw) => {
    const range = raw['!ref'];
    console.log(range.match(/[A-Z]+:\d+/));
}
const combine = (ori) => {
    const m = /K(\d*)\+(\d*\.\d*)/
    const result = ori.reduce((map, o) => {
        const r = o["名稱"].match(m)
        if (!r) return map;
        let miles = parseFloat(`${r[1]}`);
        if (miles % 10 !== 0){
            miles = Math.round(parseFloat(`${r[1]}${r[2]}`))
        }
        if (map.hasOwnProperty(miles - 1)) miles = miles - 1;
        if (map.hasOwnProperty(miles + 1)) miles = miles + 1;
        const obj = {x: o['偏距'], y: 0}
        return {...map, [miles]: map.hasOwnProperty(miles) ? [...map[miles], obj] : [obj]}
    }, {})
    return result;
}
const makeHCombine = (ori) => {
    return ori.reduce((map, o) => ({...map, [o["里程"]]: Object.keys(o).reduce((m, k) => (parseInt(k) ? [...m, o[k]]: m), [])}), {});
}


const RoadCrossSectionalPreProcess = ({}) => {
    const [data, setData] = useState([])
    const [hdata, setHData] = useState([])
    const [result, setResult] = useState([])
    useEffect(() => {
        const d = combine(data);
        const hd = makeHCombine(hdata);
        const o = Object.keys(d).reduce((map, k) => {
            if (hd.hasOwnProperty(k)){
                const s = d[k].map((p, i) => ([p.x, hd[k][i]]));
                return {...map, [k]: s}
            }
            return map;
        }, {});
        const result = Object.keys(o)
            .map(k => {
                return {
                    name: k,
                    layers: [
                        {
                            name: "刨除前",
                            type: "BASE",
                            points: o[k],
                            color: 'green'
                        },
                        {
                            name: "完成面",
                            type: "LEVELING",
                            lslope:0.015,
                            rslope:0.015,
                            llength:Math.abs(o[k][0][0]),
                            rlength:Math.abs(o[k][o[k].length-1][0]),
                            color: "blue"
                        }
                    ]
                }
            })
        setResult(result)
    }, [hdata, data])

    const exportData = () => {
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
          JSON.stringify(result)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "data.json";
        link.click();
      };
    return <>
        <h3>道路斷面分析-前置作業(小金路網專用)</h3>
        <p>選擇里程資料(Sheet)</p>
        <Xlsx onData={d => setData(utils.sheet_to_json(d))}/>
        <p>選擇高程資料(Sheet)</p>
        <Xlsx onData={d => setHData(utils.sheet_to_json(d))}/>
        <p></p>
        <Button onClick={exportData}>下載資料</Button>
    </>
}


const mapStateToProps = (state, ownProps) => {
    return {  }
}
export default connect(mapStateToProps, {})(RoadCrossSectionalPreProcess) 