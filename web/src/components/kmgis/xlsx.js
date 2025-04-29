import React, { useState, useEffect } from 'react';
import { read, utils} from 'xlsx';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import SheetSelect from './sheetSelect'


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

const Xlsx = ({onData}) => {
    const [sheets, setSheets] = useState([])
    const [wb, setWB] = useState(null)

    return <>
        <Button
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
            >
            上傳檔案
            <VisuallyHiddenInput
                type="file"
                onChange={(e) =>{
                    var reader = new FileReader();
                    reader.readAsArrayBuffer(e.target.files[0]);
                    reader.onload = function(){
                        var data = new Uint8Array(reader.result);
                        var wb = read(data);
                        setWB(wb)
                        setSheets(wb.SheetNames)
                    }
                }}
            />
            </Button>
            {
                wb !== null ? <SheetSelect sheets={sheets} onSelect={s => onData(utils.sheet_to_json(wb.Sheets[s]))}/> : ''
            }
    </>
}

export default Xlsx