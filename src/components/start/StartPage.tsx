import PlayersSelector from './PlayersSelector';
import RolesSelector from './RolesSelector';
import StartGameBtn from './StartGameBtn';

import styles from './StartPage.module.scss';

export default function StartPage() {
  return (
    <div className={styles.container}>
      <div className={styles.titleWrap}>
        <h1 className={styles.title}>Avalon 2.0</h1>
      </div>

      <PlayersSelector />

      <RolesSelector />

      <StartGameBtn />
    </div>
  );
}
