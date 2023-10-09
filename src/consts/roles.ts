import shuffle from 'lodash/shuffle';

let rolesMap: Map<number, Role>;

function formatNamesList(prefix: string, names: string[]) {
  if (!names.length) {
    return null;
  }
  if (names.length === 1) {
    return `${prefix} is ${names[0]}`;
  }
  return `${prefix}s are ${names.join(', ')}`;
}

function getMinionInfo(players: { player: Player, role: Role }[], curPlayer: Player) {
  return shuffle(players
    .filter(p => p.player !== curPlayer && p.role.isEvil && p.role.name !== 'Oberon')
    .map(p => p.player.name));
}

function appearsAsEvil(role: Role) {
  return role.name !== 'Mordred' && (role.isEvil || role.name === 'Recluse');
}

function appearsAsRole(
  role: Role,
  players: { player: Player, role: Role }[],
  curPlayer: Player,
) {
  const shuffled = shuffle(players.filter(p => p.player !== curPlayer)).map(p => p.role);
  if (role.name === 'Recluse') {
    return shuffled.filter(r => r.name !== 'Recluse' && appearsAsEvil(r))[0].name;
  }
  if (role.name === 'Mordred') {
    return shuffled.filter(r => r.name !== 'Mordred' && !appearsAsEvil(r))[0].name;
  }
  return role.name;
}

export function getPoisonedRandPlayers(players: { player: Player, role: Role }[]) {
  const shuffledRoles = shuffle(players.map(p => p.role));
  return players.map(p => ({
    player: p.player,
    role: shuffledRoles.pop()!,
  }));
}

const roles = [
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
    ability: 'Knows Evil',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getMinionInfo(players, curPlayer),
      );
    },
  },
  {
    group: 'avalon',
    name: 'Merlin',
    isEvil: false,
    getStrength: roles => 1 + (roles.filter(r => r.isEvil).length / 2),
    ability: 'Knows Evil',
    getInfo(players) {
      return formatNamesList(
        'Evil',
        players
          .filter(p => appearsAsEvil(p.role) && p.role.name !== 'Mordred')
          .map(p => p.player.name),
      );
    },
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
        getMinionInfo(players, curPlayer),
      );
    },
  },
  {
    group: 'avalon',
    name: 'Morgana',
    isEvil: true,
    getStrength: () => 2,
    ability: 'Appears as Merlin',
    requiredRoles: ['Merlin', 'Percival'],
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getMinionInfo(players, curPlayer),
      );
    },
  },
  {
    group: 'avalon',
    name: 'Mordred',
    isEvil: true,
    getStrength: roles => (roles.find(role => role.name === 'Merlin')
      ? 2 + (roles.filter(r => !r.isEvil).length / 2)
      : 3),
    ability: 'Appears as Good',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getMinionInfo(players, curPlayer),
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
    ability: 'Appears Evil, knows Assassin, becomes Evil if assassinated',
    requiredRoles: ['Assassin', 'Merlin'],
    getInfo(players) {
      return `Assassin is ${players.find(p => p.role.name === 'Assassin')?.player.name}`;
    },
  },
  {
    group: 'avalon',
    name: 'Lunatic',
    isEvil: true,
    getStrength: () => 2,
    ability: 'Must fail every quest',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getMinionInfo(players, curPlayer),
      );
    },
  },
  {
    group: 'avalon',
    name: 'Revealer',
    isEvil: true,
    getStrength: () => 1.5,
    ability: 'Reveals loyalty after second failed quest',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getMinionInfo(players, curPlayer),
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
      const shuffled = shuffle(players.filter(p => p.player !== curPlayer));
      const good = shuffled.find(p => !appearsAsEvil(p.role))!;
      const arr = shuffle([good, shuffled[shuffled.length - 1]]);
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
      const shuffled = shuffle(players.filter(p => p.player !== curPlayer));
      const evil = shuffled.find(p => appearsAsEvil(p.role))!;
      const arr = shuffle([evil, shuffled[shuffled.length - 1]]);
      return `${arr[0].player.name} or ${arr[1].player.name} is ${appearsAsRole(evil.role, players, curPlayer)}`;
    },
  },
  {
    group: 'botc',
    name: 'Empath',
    isEvil: false,
    getStrength: () => 2,
    ability: 'Knows number of Evil neighbors',
    getInfo(players, curPlayer) {
      const curIdx = players.findIndex(p => p.player === curPlayer);
      const left = players[(curIdx + players.length - 1) % players.length];
      const right = players[(curIdx + 1) % players.length];
      const count = [left, right].filter(p => appearsAsEvil(p.role)).length;
      return `${count} Evil neighbor${count === 1 ? '' : 's'}`;
    },
  },
  {
    group: 'botc',
    name: 'Dreamer',
    isEvil: false,
    getStrength: () => 2,
    ability: 'Knows a player is a Good role or an Evil role',
    getInfo(players, curPlayer) {
      const shuffled = shuffle(players.filter(p => p.player !== curPlayer));
      const player = shuffled[0];
      const player2 = appearsAsEvil(player.role)
        ? shuffled.find(p => !appearsAsEvil(p.role))!
        : shuffled.find(p => appearsAsEvil(p.role))!;
      const roles = [player.role, player2.role];
      return `${player.player.name} is ${appearsAsRole(roles[0], players, curPlayer)} or ${appearsAsRole(roles[1], players, curPlayer)}`;
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
      return `${shuffled[0].player.name} and ${shuffled[1].player.name} are ${appearsAsEvil(shuffled[0].role) === appearsAsEvil(shuffled[1].role) ? 'the same team' : 'different teams'}`;
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
      const evils = shuffled.filter(p => appearsAsEvil(p.role));
      const goods = shuffled.filter(p => !appearsAsEvil(p.role));
      return `1 Evil among ${shuffle([evils[0], ...goods.slice(0, 2)]).map(p => p.player.name).join(', ')}`;
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
      if (appearsAsEvil(players[0].role) && appearsAsEvil(players[players.length - 1].role)) {
        count++;
      }
      for (let i = 1; i < players.length; i++) {
        if (appearsAsEvil(players[i].role) && appearsAsEvil(players[i - 1].role)) {
          count++;
        }
      }
      return `${count} Evil pairs`;
    },
  },
  {
    group: 'botc',
    name: 'Drunk',
    isEvil: false,
    getStrength: roles => (roles.find(r => r.name === 'Merlin')
      ? -2
      : roles.filter(r => !r.isEvil).length > 4 ? -1.5 : -1),
    ability: 'Gets Good role with random info',
  },
  {
    group: 'botc',
    name: 'Puzzlemaster',
    isEvil: false,
    getStrength: () => 3,
    ability: 'Knows Drunk\'s fake and real info',
    requiredRoles: ['Drunk'],
    getInfo(players, curPlayer) {
      const drunk = players.find(p => p.role.name === 'Drunk');
      if (!drunk) {
        return null;
      }
      if (drunk.player === curPlayer) {
        const shuffled = shuffle(players.filter(
          p => p.player !== curPlayer && !p.role.isEvil && p.role.getInfo,
        ));
        const fakeDrunk = shuffled[0];
        if (!fakeDrunk) {
          return null;
        }
        const randPlayers1 = getPoisonedRandPlayers(players);
        const randPlayers2 = getPoisonedRandPlayers(players);
        return `Fake info: "${fakeDrunk.role.getInfo!(randPlayers1, fakeDrunk.player)}"\nReal info: "${fakeDrunk.role.getInfo!(randPlayers2, fakeDrunk.player)}"`;
      }
      const drunkAs = rolesMap.get(drunk.player.drunkAs!)!;
      return `Fake info: "${drunk.player.info}"\nReal info: "${drunkAs.getInfo?.(players, drunk.player) ?? 'None'}"`;
    },
    secondPassInfo: true,
  },
  {
    group: 'botc',
    name: 'Recluse',
    isEvil: false,
    getStrength: roles => (roles.filter(r => r.isEvil).length > 2 ? 0 : 0.5),
    ability: 'Appears as Evil to Good',
  },
  {
    group: 'botc',
    name: 'Spy',
    isEvil: true,
    getStrength: () => 2.5,
    ability: 'Knows a non-Merlin Good\'s role',
    getInfo(players, curPlayer) {
      const shuffled = shuffle(players.filter(
        p => p.player !== curPlayer && !p.role.isEvil && !appearsAsEvil(p.role) && p.role.name !== 'Merlin',
      ));
      return `${shuffled[0].player.name} is ${shuffled[0].role.name}. ${formatNamesList(
        'Your teammate',
        getMinionInfo(players, curPlayer),
      )}`;
    },
  },
  {
    group: 'botc',
    name: 'No Dashii',
    isEvil: true,
    getStrength: roles => (roles.filter(r => !r.isEvil).length > 4 ? 3.5 : 3),
    ability: 'A Good neighbor knows random info',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getMinionInfo(players, curPlayer),
      );
    },
  },
  {
    group: 'hitler',
    name: 'Hitler',
    isEvil: true,
    getStrength: roles => (roles.length >= 7 ? 2.5 : 2),
    ability: 'When on Quest, can reveal role to fail without votes',
  },
  {
    group: 'werewolf',
    name: 'Mason',
    maxCount: 2,
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows other Mason',
    requiredRoles: ['Mason'],
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Other Mason',
        players
          .filter(p => p.player !== curPlayer && p.role.name === 'Mason')
          .map(p => p.player.name),
      );
    },
  },
  {
    group: 'werewolf',
    name: 'Doppleganger',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows a random Good\'s info',
    getInfo(players, curPlayer) {
      const shuffled = shuffle(players.filter(
        p => p.player !== curPlayer && !p.role.isEvil && p.player.info,
      ));
      return shuffled[0]?.player.info ?? null;
    },
    secondPassInfo: true,
  },
  {
    group: 'werewolf',
    name: 'Village Idiot',
    isEvil: false,
    getStrength: () => 1,
    ability: 'Can reject once per round',
  },
  {
    group: 'werewolf',
    name: 'Lone Wolf',
    isEvil: true,
    getStrength: () => 1.5,
    ability: 'Wins alone if on 3rd failed quest',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getMinionInfo(players, curPlayer),
      );
    },
  },
  {
    group: 'werewolf',
    name: 'Mystic Wolf',
    isEvil: true,
    getStrength: () => 2.5,
    ability: 'Knows a random Good\'s info',
    getInfo(players, curPlayer) {
      const shuffled = shuffle(players.filter(
        p => p.player !== curPlayer && !p.role.isEvil && p.player.info,
      ));
      return shuffled[0]?.player.info ?? null;
    },
    secondPassInfo: true,
  },
] satisfies (Omit<Role, 'id'> & { maxCount?: number })[];

let nextId = 1;
rolesMap = new Map(roles.flatMap(
  ({ maxCount, ...role }) => Array.from({ length: maxCount ?? 1 }).map(() => [
    nextId,
    {
      id: nextId++,
      ...role,
    },
  ] as [number, Role]),
));

export default rolesMap;
