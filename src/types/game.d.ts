type GameState = 'start' | 'night' | 'quests' | 'assassination';

type RoleName =
  | 'Townsfolk'
  | 'Minion'
  | 'Merlin'
  | 'Percival'
  | 'Assassin'
  | 'Morgana'
  | 'Mordred'
  | 'Oberon';

type Role = {
  id: number,
  name: RoleName,
  isEvil: boolean,
  getStrength(roles: Role[]): number,
  ability: string,
  minPlayers?: number,
  requiredRoles?: string[],
  getInfo?: (players: { player: Player, role: Role }[]) => string | null,
};

type Player = {
  id: number,
  name: string,
  roleId?: number,
  info?: string,
};
