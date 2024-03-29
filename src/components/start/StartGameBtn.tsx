import React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import shuffle from 'lodash/shuffle';

import { useStore } from '../../stores/Store';
import roles, { getPoisonedRandPlayers } from '../../consts/roles';
import getRolesErr from './getRolesErr';
import getStrengthDiff from './getStrengthDiff';

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
  const otherPlayerNames = shuffle(
    players.map(p => p.player.name)
      .filter(n => n !== curPlayer.name),
  );
  const question = shuffle([
    `How far apart are ${otherPlayerNames[0]} and ${otherPlayerNames[1]}?`,
    `What color shirt is ${otherPlayerNames[0]} wearing?`,
    `Quickly glance at ${otherPlayerNames[0]} and look confused.`,
    'Look at the ceiling and say "hmm".',
  ])[0];
  return `Pretend you got information. ${question}`;
}

function assignRoles(players: Map<number, Player>, selectedRoles: Set<Role>) {
  const shuffledRoles = shuffle([...selectedRoles])
    .filter(r => r.name !== 'Drunk');
  if (shuffledRoles.length !== players.size) {
    throw new Error('Mismatched number of roles and players');
  }

  const playersArr: { player: Player, role: Role }[] = [];
  for (const player of players.values()) {
    delete player.info;
    delete player.isPoisoned;
    delete player.drunkAs;

    const curRole = shuffledRoles.pop()!;
    player.roleId = curRole.id;

    playersArr.push({
      player,
      role: curRole,
    });
  }

  const roleNames = [...selectedRoles].map(r => r.name);

  if (roleNames.includes('Drunk')) {
    const goods = playersArr.filter(p => !p.role.isEvil);
    const shuffled = shuffle(goods);
    const drunk = roleNames.includes('Puzzlemaster')
      ? (shuffled.find(p => p.role.getInfo) ?? shuffled[0])
      : shuffled[0];
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

  /*
  // BotC Lunatic, doesn't work because they'll fail
  if (roleNames.includes('Lunatic')) {
    const lunatic = playersArr.find(p => p.role.name === 'Lunatic')!;
    const evils = playersArr.filter(p => p.role.isEvil);
    const drunkAs = shuffle(evils)[0];
    lunatic.player.isPoisoned = true;
    lunatic.player.drunkAs = drunkAs.role.id;
  }
  */

  const infoOrder = playersArr.slice()
    .sort((a, b) => (a.role.runsLastPriority ?? 0) - (b.role.runsLastPriority ?? 0));
  for (const p of infoOrder) {
    if (p.player.isPoisoned) {
      const role = p.player.drunkAs
        ? roles.get(p.player.drunkAs)!
        : p.role;
      const randPlayers = getPoisonedRandPlayers(playersArr, p.player, role);
      p.player.info = role.getInfo?.(randPlayers, p.player) ?? undefined;
    } else {
      p.player.info = p.role.getInfo?.(playersArr, p.player) ?? undefined;
    }

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
    setNumResets,
  } = useStore();

  const strengthDiff = getStrengthDiff(selectedRoles);
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
                setNumResets(n => n + 1);
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
