import type ReactDomNamespace from 'react-dom';
import type ReactNamespace from 'react/index';

const React = window.React as typeof ReactNamespace;
const ReactDOM = window.ReactDOM as typeof ReactDomNamespace;

export default React;
export { ReactDOM };
