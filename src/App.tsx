import './App.css';
import Canvas from './components/Canvas';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import { SelectedPageProvider } from './context/SelectedPageContext';
import { SelectedMarcherProvider } from './context/SelectedMarcherContext';
import { IsPlayingProvider } from './context/IsPlayingContext';
import StateInitializer from './utilities/StateInitializer';
import LaunchPage from './components/LaunchPage';
import { useEffect, useState } from 'react';

function App() {
  const [databaseIsReady, setDatabaseIsReady] = useState(false);

  useEffect(() => {
    window.electron.databaseIsReady().then((result) => {
      setDatabaseIsReady(result);
    });
  }, []);
  return (
    // Context for the selected page. Will change when more specialized
    <>
      {!databaseIsReady ? <LaunchPage setDatabaseIsReady={setDatabaseIsReady} /> :
        <SelectedPageProvider>
          <SelectedMarcherProvider>
            <IsPlayingProvider>
              <StateInitializer />
              <div className="app-container">
                {/* <div className="toolbar-container"> */}
                <Topbar />
                <div className="secondary-container">
                  <Sidebar />
                  <Canvas />
                  {/* <PageList /> */}
                </div>
              </div>
              {/* </div> */}
            </IsPlayingProvider>
          </SelectedMarcherProvider>
        </SelectedPageProvider >
      }
    </>
  );
}

export default App;

// {/* <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header> */}
// {/* <Toolbar /> */ }
