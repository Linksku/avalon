import { useStore } from '../stores/Store';
import StartPage from './start/StartPage';
import NightPage from './NightPage';
import QuestsPage from './QuestsPage';
import AssassinationPage from './AssassinationPage';

const GAME_STATE_TO_COMPONENT = {
  start: <StartPage />,
  night: <NightPage />,
  quests: <QuestsPage />,
  assassination: <AssassinationPage />,
} satisfies Record<GameState, ReactElement>;

function App() {
  const { gameState } = useStore();

  return GAME_STATE_TO_COMPONENT[gameState];
}

export default App;
