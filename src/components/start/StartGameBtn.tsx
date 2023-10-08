import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import shuffle from 'lodash/shuffle';

import { useStore } from '../../stores/Store';
import roles from '../../consts/roles';

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
  const roleNames = [...selectedRoles].map(r => r.name);

  const numGoods = [...selectedRoles].filter(r => !r.isEvil).length
    - (roleNames.includes('Drunk') ? 1 : 0);
  if (numGoods !== players.size - (NUM_EVILS.get(players.size) as number)) {
    return `Need ${players.size - (NUM_EVILS.get(players.size) as number)} good`;
  }
  const numEvils = [...selectedRoles].filter(r => r.isEvil).length;
  if (numEvils !== NUM_EVILS.get(players.size)) {
    return `Need ${NUM_EVILS.get(players.size)} evil`;
  }
  if (selectedRoles.size - (roleNames.includes('Drunk') ? 1 : 0) < players.size) {
    return `Missing ${players.size - selectedRoles.size} role${players.size - selectedRoles.size === 1 ? '' : 's'}`;
  }

  for (const role of selectedRoles) {
    if (role.requiredRoles && !role.requiredRoles.every(r => roleNames.includes(r))) {
      return `${role.name} requires ${role.requiredRoles.join(', ')}`;
    }
    if (role.name === 'Merlin' && !roleNames.includes('Assassin') && roleNames.includes('Minion')) {
      return 'Merlin requires Assassin';
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

function randInfo(players: { player: Player, role: Role }[], curPlayer: Player) {
  const otherPlayerNames = shuffle(players.map(p => p.player.name).filter(n => n !== curPlayer.name));
  return `Subtly glance at ${otherPlayerNames[0]} and ${otherPlayerNames[1]}`;
}

function assignRoles(players: Map<number, Player>, selectedRoles: Set<Role>) {
  const shuffledRoles = shuffle([...selectedRoles])
    .filter(r => r.name !== 'Drunk');
  for (const player of players.values()) {
    player.roleId = shuffledRoles.pop()?.id;
  }

  const playersArr = [...players.values()].map(p => ({
    player: p,
    role: roles.get(p.roleId as number) as Role,
  }));
  const roleNames = [...selectedRoles].map(r => r.name);
  if (roleNames.includes('Drunk')) {
    const goods = playersArr.filter(p => !p.role.isEvil);
    const drunk = shuffle(goods)[0];
    drunk.player.drunkAs = drunk.role.id;
    drunk.player.roleId = [...selectedRoles].find(r => r.name === 'Drunk')!.id;
    drunk.player.isPoisoned = true;
  }
  if (roleNames.includes('No Dashii')) {
    const idx = playersArr.findIndex(p => p.role.name === 'No Dashii');
    const left = playersArr[idx === 0 ? playersArr.length - 1 : idx - 1];
    const right = playersArr[idx === playersArr.length - 1 ? 0 : idx + 1];
    if (!left.role.isEvil && !right.role.isEvil) {
      if (Math.random() < 0.5) {
        left.player.isPoisoned = true;
      } else {
        right.player.isPoisoned = true;
      }
    } else if (!left.role.isEvil) {
      left.player.isPoisoned = true;
    } else if (!right.role.isEvil) {
      right.player.isPoisoned = true;
    }
  }

  for (const p of playersArr) {
    if (p.player.isPoisoned) {
      const role = p.player.drunkAs
        ? roles.get(p.player.drunkAs)!
        : p.role;
      const shuffledRoles = shuffle(playersArr.map(p => p.role));
      const randPlayers = playersArr.map(p => ({
        player: p.player,
        role: shuffledRoles.pop()!,
      }));
      p.player.info = role.getInfo?.(randPlayers, p.player) ?? undefined;
    } else {
      p.player.info = p.role.getInfo?.(playersArr, p.player) ?? undefined;
    }
  }
  const doppleganger = playersArr.find(p => p.role.name === 'Doppleganger');
  if (doppleganger) {
    doppleganger.player.info = doppleganger.role.getInfo?.(playersArr, doppleganger.player) ?? undefined;
  }
  for (const p of playersArr) {
    p.player.info ??= randInfo(playersArr, p.player);
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
