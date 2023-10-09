export const NUM_EVILS = new Map([
  [5, 2],
  [6, 2],
  [7, 3],
  [8, 3],
  [9, 3],
  [10, 4],
]);

export default function getRolesErr(players: Map<number, Player>, selectedRoles: Set<Role>) {
  if (!players.size) {
    return 'Enter players';
  }
  if (players.size < 5) {
    return 'Need 5 players';
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
  const expectedGoods = players.size - (NUM_EVILS.get(players.size) as number);
  if (numGoods < expectedGoods) {
    return `Need ${expectedGoods - numGoods} more Good${expectedGoods - numGoods === 1 ? '' : 's'}`;
  }
  if (numGoods > expectedGoods) {
    return `Remove ${numGoods - expectedGoods} Good${numGoods - expectedGoods === 1 ? '' : 's'}`;
  }

  const numEvils = [...selectedRoles].filter(r => r.isEvil).length;
  const expectedEvils = NUM_EVILS.get(players.size) as number;
  if (numEvils < expectedEvils) {
    return `Need ${expectedEvils - numEvils} more Evil${expectedEvils - numEvils === 1 ? '' : 's'}`;
  }
  if (numEvils > expectedEvils) {
    return `Remove ${numEvils - expectedEvils} Evil${numEvils - expectedEvils === 1 ? '' : 's'}`;
  }
  if (numGoods + numEvils < players.size) {
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
