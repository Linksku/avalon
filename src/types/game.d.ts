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
  | 'Steward'
  | 'Seamstress'
  | 'Noble'
  | 'Chef'
  | 'Clockmaker'
  | 'Shugenja'
  | 'Mutant'
  | 'Magician'
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
  disabled?: boolean,
  id: string,
  group: RoleGroup,
  name: RoleName,
  isEvil: boolean,
  getStrength(roles: Role[]): number,
  ability: string,
  cantBePoisoned?: boolean,
  requiredRoles?: RoleName[],
  mutuallyExclusiveRoles?: RoleName[],
  getInfo?: (players: { player: Player, role: Role }[], curPlayer: Player) => string | null,
  // Depends on other players' info, highest = last
  runsLastPriority?: number,
  isDeprioritized?: boolean,
};

type Player = {
  id: number,
  name: string,
  roleId?: string,
  isPoisoned?: boolean,
  drunkAs?: string,
  info?: string,
};
