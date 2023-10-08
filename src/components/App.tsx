import { useStore } from '../stores/Store';
import StartPage from './start/StartPage';
import NightPage from './night/NightPage';
import QuestsPage from './QuestsPage';
import AssassinationPage from './AssassinationPage';

import styles from './App.module.scss';

const GAME_STATE_TO_COMPONENT = {
  start: <StartPage />,
  night: <NightPage />,
  quests: <QuestsPage />,
  assassination: <AssassinationPage />,
} satisfies Record<GameState, ReactElement>;

function App() {
  const { gameState } = useStore();

  return (
    <div className={styles.container}>
      {GAME_STATE_TO_COMPONENT[gameState]}
    </div>
  );
}

export default App;
