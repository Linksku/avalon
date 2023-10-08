import IconButton from '@mui/material/IconButton';
import { ReactComponent as DoorOpenSvg } from 'fontawesome-svgs/svg/door-open-regular.svg';

import { useStore } from '../stores/Store';

import styles from './TopBar.module.scss';

export default function TopBar() {
  const { setGameState, players } = useStore();

  return (
    <div className={styles.container}>
      <h1>Avalon</h1>

      <div className={styles.right}>
        <IconButton
          size="large"
          onClick={() => {
            if (window.confirm('Quit game?')) {
              localStorage.removeItem('avalonState');
              for (const player of players.values()) {
                delete player.roleId;
                delete player.isPoisoned;
                delete player.drunkAs;
              }
              setGameState('start');
            }
          }}
        >
          <DoorOpenSvg className={styles.doorSvg} />
        </IconButton>
      </div>
    </div>
  );
}
