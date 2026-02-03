
import React, {  } from 'react';
import { withRouter } from "react-router";
import { connect } from 'react-redux'
import Lottery from './components/lottery'


const App = ({}) => {
  return (
    <>      

      <Lottery/>
    </>
  );
}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}
export default connect(mapStateToProps, {})(withRouter(App)) 
