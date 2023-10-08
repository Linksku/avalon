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
          .filter(p => p.role.isEvil && p.role.name !== 'Mordred')
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
    getStrength: roles => 2 + (roles.filter(r => !r.isEvil).length / 2),
    ability: 'Unknown to Merlin',
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
    name: 'Oberon',
    isEvil: true,
    getStrength: () => 1,
    ability: 'Unknown to Evil, doesn\'t know Evil',
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
