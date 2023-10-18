import React from 'react';
import IconButton from '@mui/material/IconButton';
import { ReactComponent as DoorOpenSvg } from 'fontawesome-svgs/svg/door-open-regular.svg';

import { useStore } from '../stores/Store';

import styles from './TopBar.module.scss';

export default React.memo(function TopBar() {
  const { setGameState, players } = useStore();

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <h1>Avalon 2.0</h1>

        <div className={styles.right}>
          <IconButton
            size="large"
            onClick={() => {
              // eslint-disable-next-line no-alert
              if (window.confirm('Quit game?')) {
                localStorage.removeItem('avalonState');
                for (const player of players.values()) {
                  delete player.roleId;
                  delete player.isPoisoned;
                  delete player.drunkAs;
                  delete player.info;
                }
                setGameState('start');
              }
            }}
          >
            <DoorOpenSvg className={styles.doorSvg} />
          </IconButton>
        </div>
      </div>
    </div>
  );
});
