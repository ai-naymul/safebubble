import { AppRegistry } from 'react-native';
import App from './App';
import './app.web.css';

AppRegistry.registerComponent('main', () => App);
AppRegistry.runApplication('main', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
