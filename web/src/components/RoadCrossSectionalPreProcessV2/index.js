import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Xlsx from './xlsx';
import {utils} from 'xlsx';
import { Button, Divider } from '@mui/material';
const parser = (raw) => {
    const range = raw['!ref'];
    console.log(range.match(/[A-Z]+:\d+/));
}
const combine = (ori) => {
    return ori.reduce((map, o) => ({...map, [o["里程"]]: Object.keys(o).reduce((m, k) => (parseInt(k) ? [...m, o[k]]: m), [])}), {});
}
const makeHCombine = (ori) => {
    return ori.reduce((map, o) => ({...map, [o["里程"]]: Object.keys(o).reduce((m, k) => (parseInt(k) ? [...m, o[k]]: m), [])}), {});
}

// 組合里程資料與高程資料
const combineMileAndH = (miles, Hs) => {
    const d = combine(miles);
    const hd = makeHCombine(Hs);
    const o = Object.keys(d).reduce((map, k) => {
        if (hd.hasOwnProperty(k)){
            const s = d[k].map((p, i) => ([p, hd[k][i]]));
            return {...map, [k]: s}
        } else console.log(k)
        return map;
    }, {});
    return o;
}


const RoadCrossSectionalPreProcess = ({}) => {
    const [fileData, setFileData] = useState({step1: {d: [], h: []}, step2: {d: [], h: []}})

    const exportData = () => {
        const {step1, step2} = fileData;
        const o1 = combineMileAndH(step1.d, step1.h);
        const o2 = combineMileAndH(step2.d, step2.h);
        let r = [];
        if (Object.keys(o2).length > 0) {
            Object.keys(o2).map(k => {
                    const md = {
                        name: k,
                        layers: [
                            {
                                name: "刨除後",
                                type: "BASE",
                                points: o2[k],
                                color: 'green'
                            },
                            {
                                name: "假設完成面",
                                type: "LEVELING",
                                lslope:0.015,
                                rslope:0.015,
                                llength:Math.abs(o2[k][0][0]),
                                rlength:Math.abs(o2[k][o2[k].length-1][0]),
                                color: "blue"
                            }
                        ]
                    }
                    console.log(k, o1.hasOwnProperty(k))
                    if (o1.hasOwnProperty(k)) 
                        md.layers = [...md.layers, {
                            name: "刨除前",
                            type: "NORMAL",
                            points: o1[k],
                            color: 'grey'
                        }]
                    else console.log(o1)
                    return md;
                })
        } else {
            r = Object.keys(o1)
                .map(k => {
                    return {
                        name: k,
                        layers: [
                            {
                                name: "刨除前",
                                type: "BASE",
                                points: o1[k],
                                color: 'green'
                            },
                            {
                                name: "假設完成面",
                                type: "LEVELING",
                                lslope:0.015,
                                rslope:0.015,
                                llength:Math.abs(o1[k][0][0]),
                                rlength:Math.abs(o1[k][o1[k].length-1][0]),
                                color: "blue"
                            }
                        ]
                    }
                })
        }


        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
          JSON.stringify(r)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "data.json";
        link.click();
      };
    return <>
        <h3>道路斷面分析-前置作業(小金路網專用,Version2)</h3>
        <h4>1. 刨除前</h4>
        <p>選擇里程資料(Sheet)</p>
        
        <Xlsx onData={d => {
            setFileData({...fileData, step1: {...fileData.step1, d: utils.sheet_to_json(d)}})
        }}/>
        <p>選擇高程資料(Sheet)</p>
        <Xlsx onData={d => setFileData({...fileData, step1: {...fileData.step1, h: utils.sheet_to_json(d)}})}/>
        <Divider/>
        <h4>2. 刨除後</h4>
        <p>選擇里程資料(Sheet)</p>
        <Xlsx onData={d => setFileData({...fileData, step2: {...fileData.step2, d: utils.sheet_to_json(d)}})}/>
        <p>選擇高程資料(Sheet)</p>
        <Xlsx onData={d => setFileData({...fileData, step2: {...fileData.step2, h: utils.sheet_to_json(d)}})}/>
        <Divider/>
        <Button onClick={ exportData}>下載資料</Button>
    </>
}


const mapStateToProps = (state, ownProps) => {
    return {  }
}
export default connect(mapStateToProps, {})(RoadCrossSectionalPreProcess) 