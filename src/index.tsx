import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as Resources from "./resources"
import { SimpleMesh_Load_Model_OBJ } from './utils';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

for (const key in Resources.models) {
  if (Object.hasOwnProperty.call(Resources.models, key)) {
    const url: string = Resources.models[key];
    Resources.models[key] = SimpleMesh_Load_Model_OBJ(url);
  }
}


root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
