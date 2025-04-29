
import React, {useState} from 'react';
import {Select, MenuItem, FormControl, InputLabel} from '@mui/material';

 const ColSelect = ({name, cols, onSelect, ...other}) => {
    const [value, setValue] = useState('');
    const Items = () => {
        const total = cols.map((p, i) => <MenuItem 
                                    value={p}
                                    key={`sheet_select_${i}`}>
                        {i+1}. {p}
                    </MenuItem>)
        return total;
    }
    return <FormControl size='small' fullWidth>
        <InputLabel>{name}</InputLabel>
        <Select value={value} {...other}  onChange={e => {
            setValue(e.target.value);
            onSelect(e.target.value);
        }}>
            { Items() }
        </Select>
    </FormControl>
}

export default ColSelect