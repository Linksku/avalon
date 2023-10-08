import { ReactComponent as DoorOpenSvg } from 'fontawesome-svgs/svg/door-open-regular.svg';

import { useStore } from '../stores/Store';

import styles from './TopBar.module.scss';

export default function TopBar() {
  const { setGameState, players } = useStore();

  return (
    <div className={styles.container}>
      <h1>Avalon</h1>

      <div className={styles.right}>
        <button
          onClick={() => {
            if (window.confirm('Reset the game?')) {
              localStorage.removeItem('avalonState');
              for (const player of players.values()) {
                player.roleId = undefined;
              }
              setGameState('start');
            }
          }}
        >
          <DoorOpenSvg />
        </button>
      </div>
    </div>
  );
}
