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
  | 'Brute'
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
  | 'Cannibal'
  | 'Shugenja'
  | 'Bounty Hunter'
  | 'Mutant'
  | 'Magician'
  | 'Drunk'
  | 'Puzzlemaster'
  | 'Recluse'
  | 'Good Twin'
  | 'Evil Twin'
  | 'Spy'
  | 'Psychopath'
  | 'No Dashii'
  | 'Mason'
  | 'Count'
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
  // Poisoned: sees random info, other powers still work
  isPoisoned?: boolean,
  // Drunk: sees random role with random info
  drunkAs?: string,
  info?: string,
};
