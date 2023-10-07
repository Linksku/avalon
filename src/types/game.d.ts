type GameState = 'start' | 'night' | 'quests' | 'assassination';

type Role = {
  id: number,
  name: string,
  isEvil: boolean,
  getStrength(roles: Role[]): number,
  ability: string,
  minPlayers?: number,
  requiredRoles?: string[],
  getInfo(players: Player[]): string,
};

type Player = {
  id: number,
  name: string,
  role?: Role,
  info?: string,
};
