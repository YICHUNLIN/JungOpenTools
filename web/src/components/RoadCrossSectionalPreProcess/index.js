import React, {useState } from 'react';
import { connect } from 'react-redux'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

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
const RoadCrossSectionalPreProcess = ({}) => {
    return <>
        <h3>道路斷面分析-前置作業</h3>
        (尚未完成)
    </>
}


const mapStateToProps = (state, ownProps) => {
    return {  }
}
export default connect(mapStateToProps, {})(RoadCrossSectionalPreProcess) 