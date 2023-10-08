type GameState = 'start' | 'night' | 'quests' | 'assassination';

type RoleName =
  | 'Townsfolk'
  | 'Minion'
  | 'Merlin'
  | 'Percival'
  | 'Assassin'
  | 'Morgana'
  | 'Mordred'
  | 'Oberon'
  | 'Untrustworthy Servant'
  | 'Lunatic'
  | 'Revealer'
  | 'Mason'
  | 'Lone Wolf'
  | 'Village Idiot'
  | 'Empath'
  | 'Noble'
  | 'Chef'
  | 'Recluse'
  | 'Spy';

type Role = {
  id: number,
  name: RoleName,
  isEvil: boolean,
  getStrength(roles: Role[]): number,
  ability: string,
  minPlayers?: number,
  requiredRoles?: RoleName[],
  getInfo?: (players: { player: Player, role: Role }[], curPlayer: Player) => string | null,
};

type Player = {
  id: number,
  name: string,
  roleId?: number,
  info?: string,
};
