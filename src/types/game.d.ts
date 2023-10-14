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
  | 'Revealer'
  | 'Washerwoman'
  | 'Investigator'
  | 'Empath'
  | 'Ravenkeeper'
  | 'Dreamer'
  | 'Steward'
  | 'Seamstress'
  | 'Noble'
  | 'Chef'
  | 'Clockmaker'
  | 'Mutant'
  | 'Magician'
  | 'Lunatic'
  | 'Drunk'
  | 'Puzzlemaster'
  | 'Recluse'
  | 'Spy'
  | 'Psychopath'
  | 'No Dashii'
  | 'Mason'
  | 'Bodyguard'
  | 'Doppleganger'
  | 'Village Idiot'
  | 'Lone Wolf'
  | 'Tanner'
  | 'Dream Wolf'
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
  cantBePoisoned?: boolean,
  minPlayers?: number,
  requiredRoles?: RoleName[],
  getInfo?: (players: { player: Player, role: Role }[], curPlayer: Player) => string | null,
  // Depends on other players' info, highest = last
  runsLastPriority?: number,
};

type Player = {
  id: number,
  name: string,
  roleId?: number,
  isPoisoned?: boolean,
  drunkAs?: number,
  info?: string,
};
