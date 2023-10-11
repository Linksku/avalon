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
  const rolesArr = [...selectedRoles];
  const roleNames = rolesArr.map(r => r.name);

  const numGoods = rolesArr.filter(r => !r.isEvil && r.name !== 'Drunk').length;
  const numEvils = rolesArr.filter(r => r.isEvil).length;
  const expectedEvils = NUM_EVILS.get(players.size) as number;
  const expectedGoods = players.size - expectedEvils;
  if (numGoods !== expectedGoods || numEvils !== expectedEvils) {
    return `Selected ${numGoods}/${expectedGoods} Good${numGoods === 1 ? '' : 's'} and ${numEvils}/${expectedEvils} Evil${numEvils === 1 ? '' : 's'}`;
  }

  for (const role of selectedRoles) {
    if (role.requiredRoles && !role.requiredRoles.every(r => roleNames.includes(r))) {
      return `${role.name} requires ${role.requiredRoles.join(', ')}`;
    }
    if (role.name === 'Merlin' && !roleNames.includes('Assassin') && roleNames.includes('Minion')) {
      return 'Merlin requires Assassin';
    }
  }

  if ((roleNames.includes('Drunk') || roleNames.includes('No Dashii'))
    && rolesArr.some(r => r.cantBePoisoned)) {
    return `${rolesArr.filter(r => r.cantBePoisoned).map(r => r.name).join(', ')} can't be drunk/poisoned`;
  }

  return null;
}
