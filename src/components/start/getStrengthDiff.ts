const PLAYERS_TO_BASE_DIFF = new Map([
  [5, 1],
  [6, 0],
  [7, 0.5],
  [8, -1],
  [9, 1],
  [10, -1],
]);

export default function getStrengthDiff(roles: Set<Role>) {
  const rolesArr = Array.from(roles).filter(r => r.name !== 'Drunk');
  const baseDiff = PLAYERS_TO_BASE_DIFF.get(rolesArr.length) ?? 0
    // Assumes players are uncoordinated and side convos will occur
    - ((rolesArr.length / 5) - 1);
  const strengthDiff = Array.from(roles).reduce(
    (sum, role) => (role.isEvil
      ? sum - role.getStrength(rolesArr)
      : sum + role.getStrength(rolesArr)),
    0,
  );
  return baseDiff + strengthDiff;
}
