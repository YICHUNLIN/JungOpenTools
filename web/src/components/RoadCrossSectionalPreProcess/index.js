import React, { useState } from 'react';
import { connect } from 'react-redux';
import Xlsx from './xlsx';
const parser = (raw) => {
    const range = raw['!ref'];
    console.log(range.match(/[A-Z]+:\d+/));
}

const RoadCrossSectionalPreProcess = ({}) => {
    return <>
        <h3>道路斷面分析-前置作業</h3>
        (尚未完成)
        <Xlsx onData={d => parser(d)}/>
    </>
}


const mapStateToProps = (state, ownProps) => {
    return {  }
}
export default connect(mapStateToProps, {})(RoadCrossSectionalPreProcess) 