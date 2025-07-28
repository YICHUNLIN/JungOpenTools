
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
import RoadCrossSectionalPreProcessV2 from './components/RoadCrossSectionalPreProcessV2';
import Concrete from './components/concrete';
import AsphaltConcrete from './components/asphaltConcrete';
import DesignMap from './components/designMap';
import ConcreteInverse from './components/concreteInverse';
import QCTest from './components/qctest';
import RoadCrossSectionalPreProcessV3 from './components/RoadCrossSectionalPreProcessV3';

const pages = [
  {name: '座標轉換', to: '/km/gis', route: <Kmgis/>},
  {name: '斷面分析(前置作業,小金路網專用)', to: '/road/crossSectionalPreProcess', route: <RoadCrossSectionalPreProcess/>},
  {name: '斷面分析(前置作業,小金路網專用)V2', to: '/road/crossSectionalPreProcessV2', route: <RoadCrossSectionalPreProcessV2/>},
  {name: '斷面分析', to: '/road/crossSectional', route: <RoadCrossSectional/>},
  {name: '水泥混凝土配比設計', to: '/concrete/design', route: <Concrete/>},
  {name: '瀝青混凝土配比設計', to: '/ac/design', route: <AsphaltConcrete/>},
  {name: '咖啡廳位置配置', to: '/map/design', route: <DesignMap/>},
  {name: '混凝土反向設計', to: '/concrete/inverse', route: <ConcreteInverse/>},
  {name: '品管考試', to: '/qc', route: <QCTest/>},
  {name: "斷面分析(前置作業,環西專用)", route: <RoadCrossSectionalPreProcessV3/>, to: "/road/crossSectionalPreProcessV3"},
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
