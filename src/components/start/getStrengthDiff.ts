const PLAYERS_TO_BASE_DIFF = new Map([
  [5, 0.5],
  [6, 1],
  [7, 0],
  [8, 0],
  [9, 0.5],
  [10, -1],
]);

export default function getStrengthDiff(roles: Set<Role>) {
  const rolesArr = Array.from(roles).filter(r => r.name !== 'Drunk');
  const strengthDiff = Array.from(roles).reduce(
    (sum, role) => (role.isEvil
      ? sum - role.getStrength(rolesArr)
      : sum + role.getStrength(rolesArr)),
    0,
  );
  return (PLAYERS_TO_BASE_DIFF.get(rolesArr.length) ?? 0) + strengthDiff;
}
