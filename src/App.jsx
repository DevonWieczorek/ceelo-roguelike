import { useEffect } from 'react';
import Game from './components/Game';
import { globalStyles } from './styles/globalStyles';

function App() {
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = globalStyles;
    document.head.appendChild(styleSheet);
    return () => {
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  return (
    <div className="container">
      <Game />
    </div>
  );
}

export default App;
