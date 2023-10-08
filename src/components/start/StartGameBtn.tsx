import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
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
    return 'Enter players';
  }
  if (players.size > 10) {
    return 'Too many players';
  }
  if (new Set([...players.values()].map(p => p.name)).size !== players.size) {
    return 'Duplicate names';
  }

  if (!selectedRoles.size) {
    return 'Select roles';
  }
  const numGoods = [...selectedRoles].filter(r => !r.isEvil).length;
  if (numGoods !== players.size - (NUM_EVILS.get(players.size) as number)) {
    return `Need ${players.size - (NUM_EVILS.get(players.size) as number)} good`;
  }
  const numEvils = [...selectedRoles].filter(r => r.isEvil).length;
  if (numEvils !== NUM_EVILS.get(players.size)) {
    return `Need ${NUM_EVILS.get(players.size)} evil`;
  }
  if (selectedRoles.size < players.size) {
    return `Missing ${players.size - selectedRoles.size} role${players.size - selectedRoles.size === 1 ? '' : 's'}`;
  }

  const roleNames = [...selectedRoles].map(r => r.name);
  for (const role of selectedRoles) {
    if (role.name === 'Merlin' && !roleNames.includes('Assassin') && !roleNames.includes('Minion')) {
      continue;
    }
    if (role.requiredRoles && !role.requiredRoles.every(r => roleNames.includes(r))) {
      return `${role.name} requires ${role.requiredRoles.join(', ')}`;
    }
  }

  return null;
}

function getStrengthStr(strengthDiff: number) {
  if (strengthDiff <= -2) {
    return 'Strongly favors Evil';
  }
  if (strengthDiff <= -1) {
    return 'Favors Evil';
  }
  if (strengthDiff < 1) {
    return 'Balanced game';
  }
  if (strengthDiff < 2) {
    return 'Favors Good';
  }
  return 'Strongly favors Good';
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
    setPlayers,
    selectedRoles,
    setSelectedRoles,
    setGameState,
  } = useStore();

  const selectedRolesArr = Array.from(selectedRoles);
  const strengthDiff = selectedRolesArr.reduce(
    (sum, role) => (role.isEvil
      ? sum - role.getStrength(selectedRolesArr)
      : sum + role.getStrength(selectedRolesArr)),
    0,
  );
  const errMsg = getErrMsg(players, selectedRoles);
  return (
    <>
      <div
        className={styles.padding}
      />
      <div className={styles.container}>
        <p>
          {errMsg ?? `${getStrengthStr(strengthDiff)} (${strengthDiff < 0 ? '' : '+'}${strengthDiff})`}
        </p>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={!!errMsg}
            onClick={() => {
              assignRoles(players, selectedRoles);
              setGameState('night');
            }}
          >
            Start Game
          </Button>

          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={() => {
              setPlayers(new Map());
              setSelectedRoles(new Set());
            }}
          >
            Reset
          </Button>
        </Stack>
      </div>
    </>
  );
}
