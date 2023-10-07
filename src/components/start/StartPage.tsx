import PlayersSelector from './PlayersSelector';
import RolesSelector from './RolesSelector';
import StartGameBtn from './StartGameBtn';

export default function StartPage() {
  return (
    <div>
      <h1>Avalon</h1>

      <PlayersSelector />

      <RolesSelector />

      <StartGameBtn />
    </div>
  );
}
