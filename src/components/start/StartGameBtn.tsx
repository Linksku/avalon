import React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import shuffle from 'lodash/shuffle';

import { useStore } from '../../stores/Store';
import roles, { getPoisonedRandPlayers } from '../../consts/roles';
import getRolesErr from './getRolesErr';

import styles from './StartGameBtn.module.scss';

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
  const question = shuffle([
    `How many spaces are between ${otherPlayerNames[0]} and ${otherPlayerNames[1]}?`,
    `How far is ${otherPlayerNames[0]} from you?`,
    `What color clothes is ${otherPlayerNames[0]} wearing?`,
    `Do you trust ${otherPlayerNames[0]} or ${otherPlayerNames[1]} more?`,
  ])[0];
  return `Pretend you got information. ${question}`;
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
    drunk.role = roles.get(drunk.player.roleId)!;
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
      const randPlayers = getPoisonedRandPlayers(playersArr);
      p.player.info = role.getInfo?.(randPlayers, p.player) ?? undefined;
    } else {
      p.player.info = p.role.getInfo?.(playersArr, p.player) ?? undefined;
    }
  }

  const secondPass = playersArr.filter(p => p.role.secondPassInfo);
  if (secondPass.length) {
    for (const p of secondPass) {
      p.player.info = p.role.getInfo?.(playersArr, p.player) ?? p.player.info ?? undefined;
    }
  }

  for (const p of playersArr) {
    p.player.info ??= randInfo(playersArr, p.player);
  }
}

export default React.memo(function StartGameBtn() {
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
  const errMsg = getRolesErr(players, selectedRoles);
  return (
    <>
      <div
        className={styles.padding}
      />
      <div className={styles.container}>
        <div className={styles.inner}>
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
              onClick={() => {
                setPlayers(new Map());
                setSelectedRoles(new Set());
              }}
            >
              Reset
            </Button>
          </Stack>
        </div>
      </div>
    </>
  );
});
