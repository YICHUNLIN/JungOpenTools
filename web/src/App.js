
import React, {  } from 'react';
import { withRouter } from "react-router";
import { connect } from 'react-redux'
import { Switch, Route } from 'react-router-dom';
import Home from './components/home'
import Kmgis from './components/kmgis';
import Container from '@mui/material/Container';
import MenuAppBar from './header';
import RoadCrossSectional from './components/RoadCrossSectional';
import Footer from './footer'
import Typography from '@mui/material/Typography';
import RoadCrossSectionalPreProcess from './components/RoadCrossSectionalPreProcess';

const pages = [
  {name: '座標轉換', to: '/km/gis', route: <Kmgis/>},
  {name: '斷面分析(前置作業)', to: '/road/crossSectionalPreProcess', route: <RoadCrossSectionalPreProcess/>},
  {name: '斷面分析', to: '/road/crossSectional', route: <RoadCrossSectional/>},
];
const App = ({}) => {
  return (
    <>      

      <MenuAppBar pages={[]}/>
      <Container maxWidth="false">
        <Switch>
        {
            pages.map((p, i) => <Route 
                key={`route_${i}`} 
                path={p.to}
                allow={true}>
                  {p.route}
            </Route>)
          }
          <Route path="/">
            <Home/>
          </Route>
        </Switch>
      </Container>
    </>
  );
}

const mapStateToProps = (state, ownProps) => {
  return {
  }
}
export default connect(mapStateToProps, {})(withRouter(App)) 
