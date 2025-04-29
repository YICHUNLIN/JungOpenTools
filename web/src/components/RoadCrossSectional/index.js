import React, {useState } from 'react';
import { connect } from 'react-redux'
import Section from './KonvaSection';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import { Table, TableBody, TableCell, TableRow, TextField } from '@mui/material';

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
const RoadCrossSectional = ({}) => {
    const [data, setData] = useState([])
    const [error, setError] = useState("")
    return <>
        <h3>道路斷面分析</h3>
        <Button
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
                                setData(d)
                            }catch(e){
                                setError(`File content not allow:  ${e}`)
                            }
                        }
                    };
                    reader.readAsText(e.target.files[0]);
                }}
            />
        </Button>
        <p/>
        {
            data.map((d, i) => <Section key={`section_${i}`} section={d} width={1400} height={300}/>)
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