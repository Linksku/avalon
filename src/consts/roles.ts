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

function appearsAsEvil(role: Role) {
  return role.name !== 'Mordred' && (role.isEvil || role.name === 'Recluse');
}

const roles = [
  {
    name: 'Townsfolk',
    maxCount: 4,
    isEvil: false,
    getStrength: () => 1,
    ability: '',
  },
  {
    name: 'Minion',
    maxCount: 3,
    isEvil: true,
    getStrength: () => 2,
    ability: 'Knows Evil',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        players
          .filter(p => p.player !== curPlayer && p.role.isEvil && p.role.name !== 'Oberon')
          .map(p => p.player.name),
      );
    },
  },
  {
    name: 'Merlin',
    isEvil: false,
    getStrength: roles => 1 + (roles.filter(r => r.isEvil).length / 2),
    ability: 'Knows Evil',
    requiredRoles: ['Assassin'],
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
    name: 'Assassin',
    isEvil: true,
    getStrength: () => 2,
    ability: 'Assassinates Merlin',
    requiredRoles: ['Merlin'],
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        players
          .filter(p => p.player !== curPlayer && p.role.isEvil && p.role.name !== 'Oberon')
          .map(p => p.player.name),
      );
    },
  },
  {
    name: 'Morgana',
    isEvil: true,
    getStrength: () => 2,
    ability: 'Appears as Merlin',
    requiredRoles: ['Merlin', 'Percival'],
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        players
          .filter(p => p.player !== curPlayer && p.role.isEvil && p.role.name !== 'Oberon')
          .map(p => p.player.name),
      );
    },
  },
  {
    name: 'Mordred',
    isEvil: true,
    getStrength: roles => (roles.find(role => role.name === 'Merlin')
      ? 2 + (roles.filter(r => !r.isEvil).length / 2)
      : 3),
    ability: 'Appears as Good',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        players
          .filter(p => p.player !== curPlayer && p.role.isEvil && p.role.name !== 'Oberon')
          .map(p => p.player.name),
      );
    },
  },
  {
    name: 'Oberon',
    isEvil: true,
    getStrength: () => 1,
    ability: 'Unknown to Evil, doesn\'t know Evil',
  },
  {
    name: 'Untrustworthy Servant',
    isEvil: false,
    getStrength: () => 1,
    ability: 'Appears Evil, knows Assassin, becomes Evil if assassinated',
    requiredRoles: ['Assassin'],
    getInfo(players) {
      return `Assassin is ${players.find(p => p.role.name === 'Assassin')?.player.name}`;
    },
  },
  {
    name: 'Lunatic',
    isEvil: true,
    getStrength: () => 2,
    ability: 'Must fail every quest',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        players
          .filter(p => p.player !== curPlayer && p.role.isEvil && p.role.name !== 'Oberon')
          .map(p => p.player.name),
      );
    },
  },
  {
    name: 'Revealer',
    isEvil: true,
    getStrength: () => 1.5,
    ability: 'Reveals loyalty after second failed quest',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        players
          .filter(p => p.player !== curPlayer && p.role.isEvil && p.role.name !== 'Oberon')
          .map(p => p.player.name),
      );
    },
  },
  {
    name: 'Mason',
    maxCount: 3,
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows other Masons',
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
    name: 'Lone Wolf',
    isEvil: true,
    getStrength: () => 1.5,
    ability: 'Wins alone if on 3rd failed quest',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        players
          .filter(p => p.player !== curPlayer && p.role.isEvil && p.role.name !== 'Oberon')
          .map(p => p.player.name),
      );
    },
  },
  {
    name: 'Village Idiot',
    isEvil: false,
    getStrength: () => 1,
    ability: 'Can reject once per round',
  },
  {
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
    name: 'Noble',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows 3 players, 1 Evil and 2 Good',
    getInfo(players, curPlayer) {
      const shuffled = shuffle(players.filter(p => p.player !== curPlayer));
      const evils = shuffled.filter(p => appearsAsEvil(p.role));
      const goods = shuffled.filter(p => !appearsAsEvil(p.role));
      return shuffle([evils[0], ...goods.slice(0, 2)]).map(p => p.player.name).join(', ');
    },
  },
  {
    name: 'Chef',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows number of pairs of adjacent Evils',
    getInfo(players, curPlayer) {
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
    name: 'Recluse',
    isEvil: false,
    getStrength: () => 0.5,
    ability: 'Appears as Evil to Good',
  },
  {
    name: 'Spy',
    isEvil: true,
    getStrength: () => 2.5,
    ability: 'Knows a non-Merlin Good\'s role',
    getInfo(players, curPlayer) {
      const shuffled = shuffle(players.filter(
        p => p.player !== curPlayer && !p.role.isEvil && !appearsAsEvil(p.role) && p.role.name !== 'Merlin',
      ));
      return `${shuffled[0].player.name} is ${shuffled[0].role.name}`;
    },
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
