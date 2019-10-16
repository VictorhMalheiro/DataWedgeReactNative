import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import ConfigScreen from './screens/ConfigScreen';
import AllScansScreen from './screens/AllScansScreen';
import FilteredScansScreen from './screens/FilteredScansScreen';

const MainNavigator = createStackNavigator({
  Home: {screen: FilteredScansScreen}, // TODO: change home back to Config and use react-navgation@next to make tab based routing for hooks components 
  Config: {screen: ConfigScreen},
  AllScans: {screen: AllScansScreen},
  FilteredScans: {screen: FilteredScansScreen},
});

const App = createAppContainer(MainNavigator);

export default App;