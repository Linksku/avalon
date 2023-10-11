type GameState = 'start' | 'night' | 'quests' | 'assassination';

type RoleGroup =
  | 'base'
  | 'avalon'
  | 'botc'
  | 'werewolf'
  | 'misc';

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
  | 'Good Lancelot'
  | 'Evil Lancelot'
  | 'Lunatic'
  | 'Revealer'
  | 'Washerwoman'
  | 'Investigator'
  | 'Empath'
  | 'Ravenkeeper'
  | 'Dreamer'
  | 'Grandmother'
  | 'Seamstress'
  | 'Noble'
  | 'Chef'
  | 'Drunk'
  | 'Puzzlemaster'
  | 'Recluse'
  | 'Magician'
  | 'Spy'
  | 'No Dashii'
  | 'Mason'
  | 'Doppleganger'
  | 'Village Idiot'
  | 'Lone Wolf'
  | 'Mystic Wolf'
  | 'Liberal'
  | 'Hitler';

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
