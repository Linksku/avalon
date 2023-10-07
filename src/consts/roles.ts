const roles = [
  {
    name: 'Merlin',
    isEvil: false,
    getStrength: roles => 1 + (roles.filter(r => r.isEvil).length / 2),
    ability: 'Knows Evil',
    requiredRoles: ['Assassin'],
    getInfo(players) {
      return 'todo';
    },
  },
  {
    name: 'Percival',
    isEvil: false,
    getStrength: () => 3,
    ability: 'Knows Merlin',
    requiredRoles: ['Merlin', 'Morgana'],
    getInfo(players) {
      return 'todo';
    },
  },
  {
    name: 'Townsfolk',
    maxCount: 4,
    isEvil: false,
    getStrength: () => 1,
    ability: '',
    getInfo(players) {
      return 'todo';
    },
  },
  {
    name: 'Minion',
    maxCount: 3,
    isEvil: true,
    getStrength: () => 2,
    ability: 'Knows Evil',
    getInfo(players) {
      return 'todo';
    },
  },
  {
    name: 'Mordred',
    isEvil: true,
    getStrength: roles => 2 + (roles.filter(r => !r.isEvil).length / 2),
    ability: 'Unknown to Merlin',
    requiredRoles: ['Merlin'],
    getInfo(players) {
      return 'todo';
    },
  },
  {
    name: 'Morgana',
    isEvil: true,
    getStrength: () => 2,
    ability: 'Appears as Merlin',
    requiredRoles: ['Merlin', 'Percival'],
    getInfo(players) {
      return 'todo';
    },
  },
  {
    name: 'Oberon',
    isEvil: true,
    getStrength: () => 1,
    ability: 'Unknown to Evil, doesn\'t know Evil',
    getInfo(players) {
      return 'todo';
    },
  },
] satisfies (Omit<Role, 'id'> & { maxCount?: number })[];

let nextId = 1;
export default roles.flatMap(
  ({ maxCount, ...role }) => Array.from({ length: maxCount ?? 1 }).map(() => ({
    id: nextId++,
    ...role,
  })),
);
