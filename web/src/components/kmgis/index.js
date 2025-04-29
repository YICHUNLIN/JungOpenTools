import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import { TableBody, TableRow, TextField, Table, TableCell, TableHead } from '@mui/material';
import Divider from '@mui/material/Divider';
import Xlsx from './xlsx';
import ColSelect from './colSelect';
import {wgs84totwd97, twd97towgs84} from '../../Action/webgis'
import {CopyToClipboard} from 'react-copy-to-clipboard';

const Funcs = ({onChange}) => {
    const [select, setSelect] = useState(0)
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          '& > *': {
            m: 1,
          },
        }}
      >
        <ButtonGroup variant="outlined" aria-label="Basic button group">
          <Button color={select === 0 ? "success" : "primary"} onClick={e => {
            setSelect(0)
            onChange(0)
          }}>TWD97 {"=>"} WGS84</Button>
          <Button color={select === 1 ? "success" : "primary"} onClick={e => {
            setSelect(1)
            onChange(1)
          }}>WGS84 {"=>"} TWD97</Button>
        </ButtonGroup>
      </Box>
    );
  }

const WToT=({onExec}) => {
  const [patchRaw, setPatchRaw] = useState([])
  const [singleRaw, setSingleRaw] = useState({lat: 0.0, lng: 0.0})
  const [result, setResult] = useState([])
    return <>
        <Box>
            座標轉換：
            <TextField 
            variant="standard" 
            fullWidth
            type='number'
            onChange={e => setSingleRaw({...singleRaw, lat: parseFloat(e.target.value)})}
            label="lat="/>
            <TextField 
            variant="standard" 
            type='number'
            fullWidth
            onChange={e => setSingleRaw({...singleRaw, lng: parseFloat(e.target.value)})}
            label="lng=" />
            <Button onClick={e => {
              wgs84totwd97([singleRaw])
                .then(setResult)
                .catch(console.log)
            }}>執行</Button>
        </Box>
        {/* <Divider/>
        <Box>
            批次轉換：
            <Xlsx onData={d => setPatchRaw(d)}/>
            <Table>
              <TableBody>
                {
                  patchRaw.map((pd, i) => <TableRow key={`patch_row_${i}`}>
                    <TableCell>{JSON.stringify(pd)}</TableCell>
                  </TableRow>)
                }
              </TableBody>
            </Table>
        </Box> */}
        <Divider/>
        <h3>結果</h3>
        <Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>X</TableCell>
                <TableCell>Y</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                result.map((r, i) => <TableRow key={`result_wgs_to_twd_${i}`}>
                  <TableCell>
                    <CopyToClipboard text={`${r.x}`}
                        onCopy={() => {}}>
                        <Button> {r.x}</Button>
                    </CopyToClipboard>
                  </TableCell>
                  <TableCell>
                    <CopyToClipboard text={`${r.y}`}
                        onCopy={() => {}}>
                        <Button> {r.y}</Button>
                    </CopyToClipboard>
                    </TableCell>
                  <TableCell>
                    <CopyToClipboard text={`${r.x},${r.y}`}
                        onCopy={() => {}}>
                        <Button> 複製</Button>
                    </CopyToClipboard>
                  </TableCell>
                </TableRow>)
              }
            </TableBody>
          </Table>
        </Box>
    </>
}

// twd97 to wgs84

const TToW = ({onExec}) => {
    const [patchRaw, setPatchRaw] = useState([]);
    const [singleRaw, setSingleRaw] = useState({x: 0.0, y: 0.0})
    const [headers, setHeaders] = useState([])
    const [xcol, setXCol] = useState("");
    const [ycol, setYCol] = useState("");
    const [result, setResult] = useState([])
    const reset = () => {
      setXCol("");
      setYCol("");
      setHeaders([]);
      setPatchRaw([])
    }
    return <>
        <Box>
            座標轉換：
            <TextField 
            variant="standard" 
            fullWidth
            type='number'
            onChange={e => setSingleRaw({...singleRaw, x: parseFloat(e.target.value)})}
            label="X="/>
            <TextField 
            variant="standard" 
            type='number'
            fullWidth
            onChange={e => setSingleRaw({...singleRaw, y: parseFloat(e.target.value)})}
            label="Y=" />
            <Button onClick={e => {
              reset()
              twd97towgs84([singleRaw])
                .then(r => {
                  console.log(r)
                  setResult(r)
                  reset()
                })
                .catch(console.log)
            }}>執行</Button>
        </Box>
        {/* <Divider/>
        <Box>
            批次轉換：
            <Xlsx onData={d => {
              reset()
              setPatchRaw(d);
              if (d.length > 0) {
                setHeaders(Object.keys(d[0]))
              } else setHeaders([])
            }}/>
            {
              headers.length > 0 ? <>
                <ColSelect name={"X欄位"} cols={headers} onSelect={e => setXCol(e)}/>
                <ColSelect name={"Y欄位"} cols={headers} onSelect={e => setYCol(e)}/>
              </> : ""
            }
            {
              (xcol && ycol) ? <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>X</TableCell>
                    <TableCell>Y</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    patchRaw.map((pd, i) => <TableRow key={`patch_row_${i}`}>
                      <TableCell>{pd[xcol]}</TableCell>
                      <TableCell>{pd[ycol]}</TableCell>
                    </TableRow>)
                  }
                </TableBody>
              </Table> : ""
            }
            
        </Box> */}
        <Divider/>
        <h3>結果</h3>
        <Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Lat</TableCell>
                <TableCell>Long</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {
                result.map((r, i) => <TableRow key={`result_twd_to_wgs_${i}`}>
                  <TableCell>
                    <CopyToClipboard text={`${r.lat}`}
                        onCopy={() => {}}>
                        <Button> {r.lat}</Button>
                    </CopyToClipboard>
                  </TableCell>
                  <TableCell>
                    <CopyToClipboard text={`${r.lng}`}
                        onCopy={() => {}}>
                        <Button> {r.lng}</Button>
                    </CopyToClipboard>
                  </TableCell>
                  <TableCell>
                    <CopyToClipboard text={`${r.lat},${r.lng}`}
                        onCopy={() => {}}>
                        <Button> 複製</Button>
                    </CopyToClipboard>
                  </TableCell>
                </TableRow>)
              }
            </TableBody>
          </Table>
        </Box>
    </>
}

const KMGIS = ({}) => {
    const [method, setMethod] = useState("TWD97TOWGS84")
    return <>
        <Funcs onChange={e => setMethod(e === 0 ? "TWD97TOWGS84" : "WGS84TOTWD97")}/>
        {
            method === "TWD97TOWGS84" ? <TToW/> : <WToT/>
        }
    </>
}


const mapStateToProps = (state, ownProps) => {
    return {  }
}
export default connect(mapStateToProps, {})(KMGIS) 