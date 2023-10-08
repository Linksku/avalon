type GameState = 'start' | 'night' | 'quests' | 'assassination';

type RoleGroup =
  | 'base'
  | 'avalon'
  | 'botc'
  | 'werewolf'
  | 'hitler'
  | 'custom';

type RoleName =
  | 'Villager'
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
  | 'Washerwoman'
  | 'Investigator'
  | 'Empath'
  | 'Dreamer'
  | 'Seamstress'
  | 'Noble'
  | 'Chef'
  | 'Drunk'
  | 'Puzzlemaster'
  | 'Recluse'
  | 'Spy'
  | 'No Dashii'
  | 'Liberal'
  | 'Hitler'
  | 'Mason'
  | 'Doppleganger'
  | 'Village Idiot'
  | 'Lone Wolf'
  | 'Mystic Wolf';

type Role = {
  id: number,
  group: RoleGroup,
  name: RoleName,
  isEvil: boolean,
  getStrength(roles: Role[]): number,
  ability: string,
  minPlayers?: number,
  requiredRoles?: RoleName[],
  getInfo?: (players: { player: Player, role: Role }[], curPlayer: Player) => string | null,
  secondPassInfo?: boolean,
};

type Player = {
  id: number,
  name: string,
  roleId?: number,
  isPoisoned?: boolean,
  drunkAs?: number,
  info?: string,
};
