import React from "react";
import { HashRouter as Router, Route, Link } from "react-router-dom";
import Sample from  "./views/Sample";
import Particle from "./views/Particle";
import Kuramoto from "./views/Kuramoto";
import Life from "./views/Life";
import Reduce from "./views/ReduceSample";
import VectorField from "./views/VectorField";


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
      <li>
        <Link to="/kuramoto">Kuramoto</Link>
      </li>
      <li>
        <Link to="/life">Life</Link>
      </li>
      <li>
        <Link to="/reduce">Reduce</Link>
      </li>
      <li>
        <Link to="/vector_field">VectorField</Link>
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
      <Route path="/kuramoto" component={Kuramoto} />
      <Route path="/life" component={Life} />
      <Route path="/reduce" component={Reduce} />
      <Route path="/vector_field" component={VectorField} />
    </div>
  </Router>
);


export default AppRouter;
