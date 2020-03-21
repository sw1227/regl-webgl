import React from "react";
import { HashRouter as Router, Route, Link } from "react-router-dom";
import Sample from  "./views/Sample";
import Particle from "./views/Particle";


const App = () => (
  <div>
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/sample">Sample</Link>
      </li>
      <li>
        <Link to="/particle">Particle</Link>
      </li>
    </ul>
  </div>
);


const AppRouter = () => (
  <Router>
    <div>
      <Route path="/" exact component={App} />
      <Route path="/sample" component={Sample} />
      <Route path="/particle" component={Particle} />
    </div>
  </Router>
);


export default AppRouter;
