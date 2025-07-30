
import React, {useState} from 'react';
import {Select, MenuItem, FormControl, InputLabel} from '@mui/material';

 const FileSelect = ({files, onSelect, ...other}) => {
    const [value, setValue] = useState('');
    const Items = () => {
        const total = files.map((p, i) => <MenuItem 
                                    value={p}
                                    key={`storaged_file_select_${i}`}>
                        {i+1}. {p}
                    </MenuItem>)
        return total;
    }
    return <FormControl size='small' fullWidth>
        <InputLabel>資料選擇</InputLabel>
        <Select value={value} {...other}  onChange={e => {
            setValue(e.target.value);
            onSelect(e.target.value);
        }}>
            { Items() }
        </Select>
    </FormControl>
}

export default FileSelect