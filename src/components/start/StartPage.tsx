import PlayersSelector from './PlayersSelector';
import RolesSelector from './RolesSelector';
import StartGameBtn from './StartGameBtn';

import styles from './StartPage.module.scss';

export default function StartPage() {
  return (
    <div>
      <h1 className={styles.title}>Avalon 2.0</h1>

      <PlayersSelector />

      <RolesSelector />

      <StartGameBtn />
    </div>
  );
}
