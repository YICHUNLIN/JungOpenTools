import React, {useState } from 'react';
import { connect } from 'react-redux'
import Section from './KonvaSection';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import { Table, TableBody, TableCell, TableRow, TextField } from '@mui/material';

const ToolBtn = ({info, onClick}) => {
    const [enable, setEnable] = useState(false)
    return <Button 
            color={enable ? "success" : 'primary'}
            onClick={e => {
                onClick(info.id);
                setEnable(!enable)
            }}>{info.name}</Button>
}

const ToolTips = ({onClick}) => {
    const [funcs] = useState([
        {name: "圖例", id: "SHOW_LEGEND"},
        {name: "滑鼠座標", id: "SHOW_MOUSE_LOCATION"},
        {name: "網格", id: "SHOW_GRIDS"}, 
        {name: "中心線", id: "SHOW_CL"},
        {name: "點位資訊", id: "SHOW_POINT_TEXT"},
        {name: "鋪築調整", id: "SHOW_LEVELING"},
        {name: "洩水分析", id: "SHOW_SLOPE_ANALYSIS"},
        {name: "倍率", id: "SHOW_RATIO"}])
    return <>
        {
            funcs.map((f, i) => <ToolBtn key={`tool_tips_${i}`} info={f} onClick={onClick}/>)
        }
    </>
}
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });
const Upload = ({onData, onError}) => {
    return <Button
    component="label"
    role={undefined}
    variant="contained"
    tabIndex={-1}
    startIcon={<CloudUploadIcon />}
    >
    上傳檔案(.json Only)
    <VisuallyHiddenInput
        type="file"
        accept=".json,application/json"
        onChange={(e) =>{
            var reader = new FileReader();
            reader.onload = function (ee) {
                if (ee){
                    try{
                        const d = JSON.parse(ee.target.result)
                        onData(d)
                    }catch(e){
                        onError(`File content not allow:  ${e}`)
                    }
                }
            };
            reader.readAsText(e.target.files[0]);
        }}
    />
</Button>
}
const RoadCrossSectional = ({}) => {
    const [data, setData] = useState([])
    const [error, setError] = useState("");
    const [funcs, setFuncs] = useState([]);
    return <>
        <h3>道路斷面分析</h3>
        <Upload onData={setData} onError={setError}/>
        <p/>
        <ToolTips onClick={(e) => {
            setFuncs(funcs.includes(e) ? funcs.filter(f => f !== e) : [...funcs, e])
        }}/>
        <p/>
        {
            data.map((d, i) => <Section 
                                    key={`section_${i}`}
                                    toolConfig={funcs.reduce((map, f) => ({[f]: true, ...map}), {})}
                                    section={d} 
                                    width={1400} 
                                    height={300}/>)
        }
        {
            error
        }
    </>
}


const mapStateToProps = (state, ownProps) => {
    return {  }
}
export default connect(mapStateToProps, {})(RoadCrossSectional) 