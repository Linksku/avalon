import clsx from 'clsx';
import shuffle from 'lodash/shuffle';

import { useStore } from '../../stores/Store';

import styles from './StartGameBtn.module.scss';

const NUM_EVILS = new Map([
  [5, 2],
  [6, 2],
  [7, 3],
  [8, 3],
  [9, 3],
  [10, 4],
]);

function getErrMsg(players: Map<number, Player>, selectedRoles: Set<Role>) {
  if (players.size < 5) {
    return 'Need 5 players';
  }
  if (players.size > 10) {
    return 'Too many players';
  }
  if (selectedRoles.size < players.size) {
    return `Missing ${players.size - selectedRoles.size} role${players.size - selectedRoles.size === 1 ? '' : 's'}`;
  }

  const numEvils = [...selectedRoles].filter(r => r.isEvil).length;
  if (numEvils !== NUM_EVILS.get(players.size)) {
    return `Need ${NUM_EVILS.get(players.size)} evil`;
  }

  const selectedNames = [...selectedRoles].map(r => r.name);
  if (selectedNames.includes('Merlin') && !selectedNames.includes('Assassin') && selectedNames.includes('Minion')) {
    return 'Need Assassin';
  }
  if (selectedNames.includes('Assassin') && !selectedNames.includes('Merlin')) {
    return 'Assassin without Merlin';
  }
  if (selectedNames.includes('Percival')) {
    if (!selectedNames.includes('Merlin')) {
      return 'Percival without Merlin';
    }
    if (!selectedNames.includes('Morgana')) {
      return 'Percival without Morgana';
    }
  }
  if (selectedNames.includes('Morgana')) {
    if (!selectedNames.includes('Merlin')) {
      return 'Morgana without Merlin';
    }
    if (!selectedNames.includes('Percival')) {
      return 'Morgana without Percival';
    }
  }

  return null;
}

function assignRoles(players: Map<number, Player>, selectedRoles: Set<Role>) {
  const shuffledRoles = shuffle([...selectedRoles]);

  for (const player of players.values()) {
    player.roleId = shuffledRoles.pop()?.id;
  }
}

export default function StartGameBtn() {
  const {
    players,
    selectedRoles,
    setGameState,
  } = useStore();

  const errMsg = getErrMsg(players, selectedRoles);
  return (
    <>
      <div
        className={clsx(styles.padding, {
          [styles.withErr]: !!errMsg,
        })}
      />
      <div className={styles.container}>
        {errMsg && <p>{errMsg}</p>}
        <button
          disabled={!!errMsg}
          onClick={() => {
            assignRoles(players, selectedRoles);
            setGameState('night');
          }}
        >
          Start Game
        </button>
      </div>
    </>
  );
}
