import React, { } from 'react';
import { connect } from 'react-redux'
import Forapp from './forapp';
import {Grid} from '@mui/material';
import Typography from '@mui/material/Typography';
const apps = [
    {name: "金門限定-座標轉換", desc: "TWD97 與 WGS84", to: "/km/gis"},
    {name: "操作許可證", desc: "空污許可證", to: "https://epalic.kmn.tw/"},
    {name: "斷面分析前置作業", desc: "excel->Json", to: "/road/crossSectionalPreProcess"},
    {name: "斷面分析", desc: "道路斷面分析", to: "/road/crossSectional"},
]

const Home = ({}) => {
    return <>
    <Typography variant="h4" gutterBottom>
      About
    </Typography>
    <Typography variant="h5" gutterBottom>
        xx
    </Typography>
    <Typography variant="h4" gutterBottom>
      功能
    </Typography>
    <Grid container columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        {
            apps.map((v, i) => <Grid item key={`app_${i}`}>
                <Forapp name={v.name} desc={v.desc} to={v.to}/>
            </Grid>)
        }
    </Grid>
    </>
}


const mapStateToProps = (state, ownProps) => {
    return {  }
}
export default connect(mapStateToProps, {})(Home) 