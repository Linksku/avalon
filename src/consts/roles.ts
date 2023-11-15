import shuffle from 'lodash/shuffle';

const rolesMap = new Map<string, Role>();

function randElem<T>(arr: T[]): T | undefined {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatNamesList(prefix: string, names: string[]) {
  if (!names.length) {
    return null;
  }
  if (names.length === 1) {
    return `${prefix} is ${names[0]}`;
  }
  return `${prefix}s are ${names.join(', ')}`;
}

function getEvilTeammates(players: { player: Player, role: Role }[], curPlayer: Player) {
  let teammates = players
    .filter(p => p.player !== curPlayer
      && (p.role.isEvil || p.role.name === 'Magician')
      && p.role.name !== 'Oberon');
  if (curPlayer.isPoisoned) {
    teammates = players.filter(p => p.player !== curPlayer).slice(0, teammates.length);
  }
  return shuffle(teammates).map(p => p.player.name);
}

function appearsAsEvilToGood(role: Role) {
  if (role.name === 'Mordred') {
    return false;
  }
  return role.isEvil || role.name === 'Recluse' || role.name === 'Untrustworthy Servant';
}

function appearsAsRole(
  role: Role,
  players: { player: Player, role: Role }[],
  curPlayer: Player,
): RoleName {
  const curPlayerRole = rolesMap.get(curPlayer.roleId!)!;
  if (role.name === 'Recluse') {
    return randElem(players.filter(
      p => p.player !== curPlayer && p.role.name !== 'Recluse' && appearsAsEvilToGood(p.role),
    ))?.role.name ?? 'Recluse';
  }
  if (role.name === 'Untrustworthy Servant') {
    return randElem(players.filter(
      p => p.player !== curPlayer && p.role.name !== 'Untrustworthy Servant' && appearsAsEvilToGood(p.role),
    ))?.role.name ?? 'Untrustworthy Servant';
  }
  if (role.name === 'Mordred' && !curPlayerRole.isEvil) {
    return randElem(players.filter(
      p => p.player !== curPlayer && p.role.name !== 'Mordred' && !appearsAsEvilToGood(p.role),
    ))?.role.name ?? 'Mordred';
  }
  if (role.name === 'Magician' && curPlayerRole.isEvil) {
    return randElem(players.filter(
      p => p.player !== curPlayer && p.role.name !== 'Magician' && p.role.isEvil,
    ))?.role.name ?? 'Magician';
  }
  return role.name;
}

export function getPoisonedRandPlayers(
  players: { player: Player, role: Role }[],
  curPlayer: Player,
  // The role they think they are
  curPlayerRole: Role,
) {
  const shuffledRoles = shuffle(players.map(p => p.role).filter(r => r !== curPlayerRole));
  return players.map(p => ({
    player: p.player,
    role: p.player === curPlayer
      ? curPlayerRole
      : shuffledRoles.pop()!,
  }));
}

export function getPoisonedInfo(
  player: { player: Player, role: Role },
  players: { player: Player, role: Role }[],
) {
  const randPlayers = getPoisonedRandPlayers(players, player.player, player.role);
  if (!player.role.getInfo) {
    return null;
  }
  return player.role.getInfo(randPlayers, player.player);
}

const rolesArr = [
  {
    group: 'base',
    name: 'Villager',
    maxCount: 6,
    isEvil: false,
    getStrength: () => 1,
    ability: '',
  },
  {
    group: 'base',
    name: 'Minion',
    maxCount: 4,
    isEvil: true,
    getStrength: () => 2,
    ability: '',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
  },
  {
    group: 'avalon',
    name: 'Merlin',
    isEvil: false,
    getStrength: roles => {
      const numKnownEvils = roles.filter(r => r.isEvil && r.name !== 'Mordred').length;
      const numAppearEvils = roles.filter(
        r => r.name === 'Recluse' || r.name === 'Untrustworthy Servant',
      ).length;
      if (!numKnownEvils) {
        return -1;
      }
      return Math.round(numKnownEvils * (numKnownEvils / (numKnownEvils + numAppearEvils))) / 2;
    },
    ability: 'Knows Evil',
    getInfo(players) {
      return formatNamesList(
        'Evil',
        players
          .filter(p => appearsAsEvilToGood(p.role) && p.role.name !== 'Mordred')
          .map(p => p.player.name),
      );
    },
    isDeprioritized: true,
  },
  {
    group: 'avalon',
    name: 'Percival',
    isEvil: false,
    getStrength: () => 3,
    ability: 'Knows Merlin',
    requiredRoles: ['Merlin', 'Morgana'],
    getInfo(players) {
      return formatNamesList(
        'Merlin',
        players
          .filter(p => p.role.name === 'Merlin' || p.role.name === 'Morgana')
          .map(p => p.player.name),
      );
    },
    isDeprioritized: true,
  },
  {
    group: 'avalon',
    name: 'Assassin',
    isEvil: true,
    getStrength: () => 2,
    ability: 'Assassinates Merlin',
    requiredRoles: ['Merlin'],
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
    isDeprioritized: true,
  },
  {
    group: 'avalon',
    name: 'Morgana',
    isEvil: true,
    getStrength: () => 2,
    ability: 'Appears as Merlin to Percival',
    requiredRoles: ['Merlin', 'Percival'],
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
    isDeprioritized: true,
  },
  {
    group: 'avalon',
    name: 'Mordred',
    isEvil: true,
    getStrength: () => 3,
    ability: 'Appears as Good to Goods',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
  },
  {
    group: 'avalon',
    name: 'Oberon',
    isEvil: true,
    getStrength: roles => 2.5 - (roles.filter(r => r.isEvil).length / 2),
    ability: 'Unknown to Evil, doesn\'t know Evil',
  },
  {
    group: 'avalon',
    name: 'Untrustworthy Servant',
    isEvil: false,
    getStrength: () => 1,
    ability: 'Appears as Evil, knows Assassin, becomes Evil if assassinated',
    requiredRoles: ['Assassin', 'Merlin'],
    getInfo(players) {
      return `Assassin is ${players.find(p => p.role.name === 'Assassin')?.player.name}`;
    },
    isDeprioritized: true,
  },
  {
    group: 'avalon',
    name: 'Good Lancelot',
    isEvil: false,
    getStrength: () => 0,
    ability: 'Can switch teams with Evil Lancelot',
    requiredRoles: ['Evil Lancelot'],
    isDeprioritized: true,
  },
  {
    group: 'avalon',
    name: 'Evil Lancelot',
    isEvil: true,
    getStrength: () => 1.5,
    ability: 'Can switch teams with Good Lancelot',
    requiredRoles: ['Good Lancelot'],
    isDeprioritized: true,
  },
  {
    group: 'botc',
    name: 'Lunatic',
    isEvil: true,
    getStrength: () => 1.5,
    ability: 'Must fail every Quest',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
  },
  {
    group: 'avalon',
    name: 'Revealer',
    isEvil: true,
    getStrength: () => 1.5,
    ability: 'After 2 failed Quests, reveal role',
    mutuallyExclusiveRoles: ['Ravenkeeper'],
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
  },
  {
    group: 'botc',
    name: 'Washerwoman',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows 1 of 2 players is a Good role',
    getInfo(players, curPlayer) {
      const good = randElem(players.filter(
        p => p.player !== curPlayer && !appearsAsEvilToGood(p.role),
      ));
      if (!good) {
        return 'No players appear as Good';
      }
      const other = randElem(players.filter(p => p.player !== curPlayer && p !== good))!;
      const arr = shuffle([good, other]);
      return `${arr[0].player.name} or ${arr[1].player.name} is ${appearsAsRole(good.role, players, curPlayer)}`;
    },
  },
  {
    group: 'botc',
    name: 'Investigator',
    isEvil: false,
    getStrength: () => 2,
    ability: 'Knows 1 of 2 players is an Evil role',
    getInfo(players, curPlayer) {
      const evil = randElem(players.filter(
        p => p.player !== curPlayer && appearsAsEvilToGood(p.role),
      ));
      if (!evil) {
        return 'No players appear as Evil';
      }
      const other = randElem(players.filter(p => p.player !== curPlayer && p !== evil))!;
      const arr = shuffle([evil, other]);
      return `${arr[0].player.name} or ${arr[1].player.name} is ${appearsAsRole(evil.role, players, curPlayer)}`;
    },
  },
  {
    group: 'botc',
    name: 'Empath',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows if both neighbors are Good',
    getInfo(players, curPlayer) {
      const curIdx = players.findIndex(p => p.player === curPlayer);
      const left = players[(curIdx + players.length - 1) % players.length];
      const right = players[(curIdx + 1) % players.length];
      const bothGood = !appearsAsEvilToGood(left.role) && !appearsAsEvilToGood(right.role);
      return bothGood ? 'Both neighbors are Good' : 'At least 1 neighbor is Evil';
    },
  },
  {
    group: 'botc',
    name: 'Ravenkeeper',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'After 2 failed Quests, learn a player\'s role',
    mutuallyExclusiveRoles: ['Revealer', 'Drunk', 'No Dashii'],
  },
  {
    group: 'botc',
    name: 'Dreamer',
    isEvil: false,
    getStrength: () => 2,
    ability: 'Knows a player is a Good role or an Evil role',
    getInfo(players, curPlayer) {
      const player1 = randElem(players.filter(p => p.player !== curPlayer))!;
      const player2 = appearsAsEvilToGood(player1.role)
        ? randElem(players.filter(
          p => p !== player1 && p.player !== curPlayer && !appearsAsEvilToGood(p.role),
        ))
        : randElem(players.filter(
          p => p !== player1 && p.player !== curPlayer && appearsAsEvilToGood(p.role),
        ));
      if (!player2) {
        return 'All players appear as the same team';
      }
      const roles = shuffle([player1.role, player2.role]);
      return `${player1.player.name} is ${appearsAsRole(roles[0], players, curPlayer)} or ${appearsAsRole(roles[1], players, curPlayer)}`;
    },
  },
  {
    group: 'botc',
    name: 'Steward',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows a Good player',
    getInfo(players, curPlayer) {
      const good = randElem(players.filter(
        p => p.player !== curPlayer && !appearsAsEvilToGood(p.role),
      ));
      return good
        ? `${good.player.name} is Good`
        : 'No players appear as Good';
    },
  },
  {
    group: 'botc',
    name: 'Seamstress',
    isEvil: false,
    getStrength: () => 2,
    ability: 'Knows if 2 players are the same team',
    getInfo(players, curPlayer) {
      const shuffled = shuffle(players.filter(p => p.player !== curPlayer));
      return `${shuffled[0].player.name} and ${shuffled[1].player.name} are ${appearsAsEvilToGood(shuffled[0].role) === appearsAsEvilToGood(shuffled[1].role) ? 'the same team' : 'different teams'}`;
    },
  },
  {
    group: 'botc',
    name: 'Noble',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows 1 Evil is among 3 players',
    getInfo(players, curPlayer) {
      const shuffled = shuffle(players.filter(p => p.player !== curPlayer));
      const evil = shuffled.find(p => appearsAsEvilToGood(p.role));
      const goods = shuffled.filter(p => !appearsAsEvilToGood(p.role));
      if (!evil) {
        return 'No players appear as Evil';
      }
      if (goods.length < 2) {
        return 'Less than 2 players appear as Good';
      }
      return `Exactly 1 Evil is among ${shuffle([evil, ...goods.slice(0, 2)]).map(p => p.player.name).join(', ')}`;
    },
  },
  {
    group: 'botc',
    name: 'Chef',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows number of pairs of adjacent Evils',
    getInfo(players) {
      let count = 0;
      if (appearsAsEvilToGood(players[0].role)
        && appearsAsEvilToGood(players[players.length - 1].role)) {
        count++;
      }
      for (let i = 1; i < players.length; i++) {
        if (appearsAsEvilToGood(players[i].role)
          && appearsAsEvilToGood(players[i - 1].role)) {
          count++;
        }
      }
      return `${count} Evil pair${count === 1 ? '' : 's'}`;
    },
  },
  {
    group: 'botc',
    name: 'Clockmaker',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows longest sequence of Goods',
    getInfo(players) {
      let max = 0;
      let curGap = 0;
      for (let i = 0; i < players.length * 2; i++) {
        if (players[i % players.length].role.isEvil) {
          max = Math.max(max, curGap);
          curGap = 0;
        } else {
          curGap++;
        }
      }
      return `Longest sequence is ${max}`;
    },
  },
  {
    group: 'botc',
    name: 'Shugenja',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows if closest Evil is clockwise or counterclockwise',
    getInfo(players, curPlayer) {
      const curIdx = players.findIndex(p => p.player === curPlayer);
      const evilDists = players
        .map((p, i) => (p.role.isEvil
          ? {
            before: i > curIdx ? i - curIdx : players.length + i - curIdx,
            after: i < curIdx ? curIdx - i : curIdx + players.length - i,
          }
          : null))
        .filter(Boolean) as { before: number, after: number }[];
      const minDist = Math.min(...evilDists.map(d => Math.min(d.before, d.after)));
      const closest = shuffle(evilDists.filter(d => Math.min(d.before, d.after) === minDist));
      if (closest.length > 1) {
        return `Closest is ${Math.random() < 0.5 ? 'counterclockwise' : 'clockwise'}`;
      }
      return `Closest is ${closest[0].before < closest[0].after ? 'clockwise' : 'counterclockwise'}`;
    },
  },
  {
    group: 'botc',
    name: 'Bounty Hunter',
    isEvil: false,
    getStrength: () => 2.5,
    ability: 'Knows 1 player is a Evil',
    getInfo(players, curPlayer) {
      const evil = randElem(players.filter(
        p => p.player !== curPlayer && appearsAsEvilToGood(p.role),
      ));
      if (!evil) {
        return 'No players appear as Evil';
      }
      return `${evil.player.name} is Evil`;
    },
  },
  {
    group: 'botc',
    name: 'Mutant',
    isEvil: false,
    getStrength: () => 0.5,
    ability: 'Can\'t reveal role',
    isDeprioritized: true,
  },
  {
    group: 'botc',
    name: 'Magician',
    isEvil: false,
    getStrength: roles => {
      const visibleEvils = roles.filter(
        r => r.isEvil && r.name !== 'Oberon' && r.name !== 'Evil Lancelot' && r.name !== 'Dream Wolf',
      );
      return visibleEvils.length >= 2 ? 2 : 1;
    },
    ability: 'Appears as Evil to Evils',
  },
  {
    group: 'botc',
    name: 'Drunk',
    isEvil: false,
    getStrength: roles => (roles.some(r => r.name === 'Merlin')
      || roles.filter(r => !r.isEvil).length > 4
      ? -2
      : -1.5),
    ability: 'Sees Good role with random info',
  },
  {
    group: 'botc',
    name: 'Puzzlemaster',
    isEvil: false,
    getStrength: () => 3,
    ability: 'Knows Drunk\'s fake and real info',
    requiredRoles: ['Drunk'],
    getInfo(players, curPlayer) {
      const drunk = players.find(p => p.role.name === 'Drunk')
        ?? players.find(p => p.player === curPlayer)!;
      if (drunk.player === curPlayer || curPlayer.isPoisoned) {
        const goods = players.filter(p => p.player !== curPlayer && !p.role.isEvil);
        const fakeDrunk = randElem(goods.filter(p => p.role.getInfo)) ?? randElem(goods);
        if (!fakeDrunk) {
          return null;
        }
        return `${fakeDrunk.role.name} is Drunk.\nFake info: "${getPoisonedInfo(fakeDrunk, players) ?? 'none'}"\nReal info: "${getPoisonedInfo(fakeDrunk, players) ?? 'none'}"`;
      }
      const drunkAs = rolesMap.get(drunk.player.drunkAs!)!;
      return `${drunkAs.name} is Drunk.\nFake info: "${drunk.player.info ?? 'none'}"\nReal info: "${drunkAs.getInfo?.(players, drunk.player) ?? 'none'}"`;
    },
    runsLastPriority: 1,
  },
  {
    group: 'botc',
    name: 'Recluse',
    isEvil: false,
    getStrength: roles => (roles.filter(r => r.isEvil).length > 2 ? 0 : 0.5),
    ability: 'Appears as Evil to Goods',
  },
  {
    disabled: true,
    group: 'botc',
    name: 'Spy',
    isEvil: true,
    getStrength: () => 3,
    ability: 'Knows a Good player\'s role',
    mutuallyExclusiveRoles: ['Merlin'],
    getInfo(players, curPlayer) {
      const player = randElem(players.filter(
        p => p.player !== curPlayer && !p.role.isEvil && p.role.name !== 'Merlin',
      ))!;
      return `${player.player.name} is ${player.role.name}.\n${formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      )}`;
    },
  },
  {
    group: 'botc',
    name: 'No Dashii',
    isEvil: true,
    getStrength: roles => (roles.filter(r => !r.isEvil).length > 4 ? 4 : 3.5),
    ability: 'An adjacent Good knows random info',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
  },
  {
    group: 'werewolf',
    name: 'Mason',
    maxCount: 2,
    isEvil: false,
    getStrength: () => 1,
    ability: 'Knows other Mason',
    requiredRoles: ['Mason'],
    getInfo(players, curPlayer) {
      const masons = players
        .filter(p => p.player !== curPlayer && p.role.name === 'Mason')
        .map(p => p.player.name);
      if (!masons.length) {
        return 'No other Masons';
      }
      return formatNamesList(
        'Other Mason',
        masons,
      );
    },
  },
  {
    group: 'werewolf',
    name: 'Bodyguard',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Assassinations against 1 player doesn\'t count',
    mutuallyExclusiveRoles: ['Drunk', 'No Dashii'],
    getInfo(players, curPlayer) {
      const player = randElem(players.filter(
        p => p.player !== curPlayer && !p.role.isEvil && p.role.name !== 'Merlin',
      ))!;
      return `Protecting ${player.player.name}`;
    },
    isDeprioritized: true,
  },
  {
    group: 'werewolf',
    name: 'Doppleganger',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows a Good player\'s info',
    getInfo(players, curPlayer) {
      const player = randElem(players.filter(
        p => p.player !== curPlayer && !appearsAsEvilToGood(p.role) && p.player.info,
      ));
      let roleName: Nullish<RoleName>;
      let info: Nullish<string>;
      if (curPlayer.isPoisoned || player?.role.isEvil) {
        const good = randElem(players.filter(
          p => p.player !== curPlayer && !p.role.isEvil && p.player.info,
        ));
        if (good) {
          roleName = good.role.name;
          info = getPoisonedInfo(good, players);
        }
      } else if (player) {
        roleName = player.role.name;
        info = player.player.info;
      }

      return roleName
        ? `${roleName}'s info is "${info ?? 'none'}"`
        : 'No one has info';
    },
    runsLastPriority: 2,
  },
  {
    disabled: true,
    group: 'werewolf',
    name: 'Village Idiot',
    isEvil: false,
    getStrength: () => 1,
    ability: 'Can reject once per round',
    isDeprioritized: true,
  },
  {
    group: 'werewolf',
    name: 'Lone Wolf',
    isEvil: true,
    getStrength: () => 1.5,
    ability: 'Wins alone if on 3rd failed Quest',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
    isDeprioritized: true,
  },
  {
    disabled: true,
    group: 'werewolf',
    name: 'Tanner',
    isEvil: true,
    getStrength: () => 1.5,
    ability: 'Wins alone if 3 Quests fail without playing Fail',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
    isDeprioritized: true,
  },
  {
    group: 'werewolf',
    name: 'Dream Wolf',
    isEvil: true,
    getStrength: () => 1.5,
    ability: 'Doesn\'t know Evils',
  },
  {
    group: 'werewolf',
    name: 'Mystic Wolf',
    isEvil: true,
    getStrength: () => 2.5,
    ability: 'Knows a Good player\'s info',
    mutuallyExclusiveRoles: [
      'Merlin',
      'Percival',
      'Untrustworthy Servant',
      'Washerwoman',
      'Dreamer',
      'Puzzlemaster',
      'Mason',
      'Doppleganger',
    ],
    getInfo(players, curPlayer) {
      const player = randElem(players.filter(
        p => p.player !== curPlayer && !p.role.isEvil && p.player.info,
      ));
      const info = curPlayer.isPoisoned && player
        ? getPoisonedInfo(player, players)
        : player?.player.info;
      const fullInfo = player
        ? `${player.role.name}'s info is "${info ?? 'none'}"`
        : 'No Good players have info';
      return `${fullInfo}\n${formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      )}`;
    },
    runsLastPriority: 3,
  },
  {
    group: 'misc',
    name: 'Hitler',
    isEvil: true,
    getStrength: roles => (roles.length >= 7 ? 3 : 2),
    ability: 'When on Quest, can reveal role to fail without votes',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
  },
] satisfies (Omit<Role, 'id'> & { maxCount?: number })[];

const tempRoles = rolesArr
  .filter(role => !role.disabled)
  .flatMap(
    ({ maxCount, ...role }) => Array.from({ length: maxCount ?? 1 }).map((_, idx) => ({
      id: `${role.name}${idx}`,
      ...role,
    })),
  );
for (const r of tempRoles) {
  rolesMap.set(r.id, r);
}

export default rolesMap;
