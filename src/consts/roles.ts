import shuffle from 'lodash/shuffle';

let rolesMap: Map<number, Role>;

function randElem<T>(arr: T[]): T | undefined {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatNamesList(prefix: string, names: string[]) {
  if (!names.length) {
    return null;
  }
  if (names.length === 1) {
    return `${prefix} is ${names[0]}`;
  }
  return `${prefix}s are ${names.join(', ')}`;
}

function getEvilTeammates(players: { player: Player, role: Role }[], curPlayer: Player) {
  return shuffle(players
    .filter(p => p.player !== curPlayer
      && (p.role.isEvil || (p.role.name === 'Magician' && !p.player.isPoisoned))
      && (p.role.name !== 'Oberon' || p.player.isPoisoned))
    .map(p => p.player.name));
}

function appearsAsEvilToGood({ player, role }: { role: Role, player: Player }) {
  if (player.isPoisoned) {
    return role.isEvil;
  }
  if (role.name === 'Mordred') {
    return false;
  }
  return role.isEvil || role.name === 'Recluse' || role.name === 'Untrustworthy Servant';
}

function appearsAsRole(
  role: Role,
  players: { player: Player, role: Role }[],
  curPlayer: Player,
): RoleName {
  const curPlayerRole = rolesMap.get(curPlayer.roleId!)!;
  if (role.name === 'Recluse') {
    return randElem(players.filter(
      p => p.player !== curPlayer && p.role.name !== 'Recluse' && appearsAsEvilToGood(p),
    ))?.role.name ?? 'Recluse';
  }
  if (role.name === 'Untrustworthy Servant') {
    return randElem(players.filter(
      p => p.player !== curPlayer && p.role.name !== 'Untrustworthy Servant' && appearsAsEvilToGood(p),
    ))?.role.name ?? 'Untrustworthy Servant';
  }
  if (role.name === 'Mordred' && !curPlayerRole.isEvil) {
    return randElem(players.filter(
      p => p.player !== curPlayer && p.role.name !== 'Mordred' && !appearsAsEvilToGood(p),
    ))?.role.name ?? 'Mordred';
  }
  if (role.name === 'Magician' && curPlayerRole.isEvil) {
    return randElem(players.filter(
      p => p.player !== curPlayer && p.role.name !== 'Magician' && p.role.isEvil,
    ))?.role.name ?? 'Magician';
  }
  return role.name;
}

export function getPoisonedRandPlayers(players: { player: Player, role: Role }[]) {
  const shuffledRoles = shuffle(players.map(p => p.role));
  return players.map(p => ({
    player: p.player,
    role: shuffledRoles.pop()!,
  }));
}

const roles = [
  {
    group: 'base',
    name: 'Villager',
    maxCount: 6,
    isEvil: false,
    getStrength: () => 1,
    ability: '',
  },
  {
    group: 'base',
    name: 'Minion',
    maxCount: 4,
    isEvil: true,
    getStrength: () => 2,
    ability: '',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
  },
  {
    group: 'avalon',
    name: 'Merlin',
    isEvil: false,
    getStrength: roles => 1 + (roles.filter(r => r.isEvil).length / 2),
    ability: 'Knows Evil',
    getInfo(players) {
      return formatNamesList(
        'Evil',
        players
          .filter(p => appearsAsEvilToGood(p) && p.role.name !== 'Mordred')
          .map(p => p.player.name),
      );
    },
  },
  {
    group: 'avalon',
    name: 'Percival',
    isEvil: false,
    getStrength: () => 3,
    ability: 'Knows Merlin',
    requiredRoles: ['Merlin', 'Morgana'],
    getInfo(players) {
      return formatNamesList(
        'Merlin',
        players
          .filter(p => p.role.name === 'Merlin' || p.role.name === 'Morgana')
          .map(p => p.player.name),
      );
    },
  },
  {
    group: 'avalon',
    name: 'Assassin',
    isEvil: true,
    getStrength: () => 2,
    ability: 'Assassinates Merlin',
    requiredRoles: ['Merlin'],
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
  },
  {
    group: 'avalon',
    name: 'Morgana',
    isEvil: true,
    getStrength: () => 2,
    ability: 'Appears as Merlin to Percival',
    requiredRoles: ['Merlin', 'Percival'],
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
  },
  {
    group: 'avalon',
    name: 'Mordred',
    isEvil: true,
    getStrength: roles => (roles.find(role => role.name === 'Merlin')
      ? 2 + (roles.filter(r => !r.isEvil).length / 2)
      : 3),
    ability: 'Appears as Good to Goods',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
  },
  {
    group: 'avalon',
    name: 'Oberon',
    isEvil: true,
    getStrength: roles => 2.5 - (roles.filter(r => r.isEvil).length / 2),
    ability: 'Unknown to Evil, doesn\'t know Evil',
  },
  {
    group: 'avalon',
    name: 'Untrustworthy Servant',
    isEvil: false,
    getStrength: () => 1,
    ability: 'Appears as Evil, knows Assassin, becomes Evil if assassinated',
    requiredRoles: ['Assassin', 'Merlin'],
    getInfo(players) {
      return `Assassin is ${players.find(p => p.role.name === 'Assassin')?.player.name}`;
    },
  },
  {
    group: 'avalon',
    name: 'Good Lancelot',
    isEvil: false,
    getStrength: () => 0,
    ability: 'Can switch teams with Evil Lancelot',
    requiredRoles: ['Evil Lancelot'],
  },
  {
    group: 'avalon',
    name: 'Evil Lancelot',
    isEvil: true,
    getStrength: () => 1.5,
    ability: 'Can switch teams with Good Lancelot',
    requiredRoles: ['Good Lancelot'],
  },
  {
    group: 'avalon',
    name: 'Revealer',
    isEvil: true,
    getStrength: () => 1.5,
    ability: 'Reveals loyalty after second failed Quest',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
  },
  {
    group: 'botc',
    name: 'Washerwoman',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows 1 of 2 players is a Good role',
    getInfo(players, curPlayer) {
      const shuffled = shuffle(players.filter(p => p.player !== curPlayer));
      const good = shuffled.find(p => !appearsAsEvilToGood(p))!;
      const arr = shuffle([good, shuffled[shuffled.length - 1]]);
      return `${arr[0].player.name} or ${arr[1].player.name} is ${appearsAsRole(good.role, players, curPlayer)}`;
    },
  },
  {
    group: 'botc',
    name: 'Investigator',
    isEvil: false,
    getStrength: () => 2,
    ability: 'Knows 1 of 2 players is an Evil role',
    getInfo(players, curPlayer) {
      const shuffled = shuffle(players.filter(p => p.player !== curPlayer));
      const evil = shuffled.find(p => appearsAsEvilToGood(p))!;
      const arr = shuffle([evil, shuffled[shuffled.length - 1]]);
      return `${arr[0].player.name} or ${arr[1].player.name} is ${appearsAsRole(evil.role, players, curPlayer)}`;
    },
  },
  {
    group: 'botc',
    name: 'Empath',
    isEvil: false,
    getStrength: () => 2,
    ability: 'Knows if both neighbors are Good',
    getInfo(players, curPlayer) {
      const curIdx = players.findIndex(p => p.player === curPlayer);
      const left = players[(curIdx + players.length - 1) % players.length];
      const right = players[(curIdx + 1) % players.length];
      const bothGood = !appearsAsEvilToGood(left) && !appearsAsEvilToGood(right);
      return bothGood ? 'Both neighbors are Good' : 'At least 1 neighbor is Evil';
    },
  },
  {
    group: 'botc',
    name: 'Ravenkeeper',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'After 2 failed Quests, view a player\'s role',
    cantBePoisoned: true,
  },
  {
    group: 'botc',
    name: 'Dreamer',
    isEvil: false,
    getStrength: () => 2,
    ability: 'Knows a player is a Good role or an Evil role',
    getInfo(players, curPlayer) {
      const player = randElem(players.filter(p => p.player !== curPlayer))!;
      const player2 = appearsAsEvilToGood(player)
        ? randElem(players.filter(p => p !== player && p.player !== curPlayer && !appearsAsEvilToGood(p)))!
        : randElem(players.filter(p => p !== player && p.player !== curPlayer && appearsAsEvilToGood(p)))!;
      return `${player.player.name} is ${appearsAsRole(player.role, players, curPlayer)} or ${appearsAsRole(player2.role, players, curPlayer)}`;
    },
  },
  {
    group: 'botc',
    name: 'Steward',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows a Good player\'s role',
    getInfo(players, curPlayer) {
      const p = randElem(players.filter(p => p.player !== curPlayer && !appearsAsEvilToGood(p)))!;
      return `${p.player.name} is ${appearsAsRole(p.role, players, curPlayer)}`;
    },
  },
  {
    group: 'botc',
    name: 'Seamstress',
    isEvil: false,
    getStrength: () => 2,
    ability: 'Knows if 2 players are the same team',
    getInfo(players, curPlayer) {
      const shuffled = shuffle(players.filter(p => p.player !== curPlayer));
      return `${shuffled[0].player.name} and ${shuffled[1].player.name} are ${appearsAsEvilToGood(shuffled[0]) === appearsAsEvilToGood(shuffled[1]) ? 'the same team' : 'different teams'}`;
    },
  },
  {
    group: 'botc',
    name: 'Noble',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows 1 Evil is among 3 players',
    getInfo(players, curPlayer) {
      const shuffled = shuffle(players.filter(p => p.player !== curPlayer));
      const evils = shuffled.filter(p => appearsAsEvilToGood(p));
      const goods = shuffled.filter(p => !appearsAsEvilToGood(p));
      return `1 Evil among ${shuffle([evils[0], ...goods.slice(0, 2)]).map(p => p.player.name).join(', ')}`;
    },
  },
  {
    group: 'botc',
    name: 'Chef',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows number of pairs of adjacent Evils',
    getInfo(players) {
      let count = 0;
      if (appearsAsEvilToGood(players[0]) && appearsAsEvilToGood(players[players.length - 1])) {
        count++;
      }
      for (let i = 1; i < players.length; i++) {
        if (appearsAsEvilToGood(players[i]) && appearsAsEvilToGood(players[i - 1])) {
          count++;
        }
      }
      return `${count} Evil pair${count === 1 ? '' : 's'}`;
    },
  },
  {
    group: 'botc',
    name: 'Clockmaker',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows longest sequence of Goods',
    getInfo(players) {
      let max = 0;
      let curGap = 0;
      for (let i = 0; i < players.length * 2; i++) {
        if (players[i % players.length].role.isEvil) {
          max = Math.max(max, curGap);
          curGap = 0;
        } else {
          curGap++;
        }
      }
      return `Longest sequence is ${max}`;
    },
  },
  {
    group: 'botc',
    name: 'Mutant',
    isEvil: false,
    getStrength: () => 0.5,
    ability: 'Can\'t reveal role',
  },
  {
    group: 'botc',
    name: 'Magician',
    isEvil: false,
    getStrength: roles => {
      const visibleEvils = roles.filter(
        r => r.isEvil && r.name !== 'Oberon' && r.name !== 'Evil Lancelot' && r.name !== 'Dream Wolf',
      );
      return visibleEvils.length >= 2 ? 2 : 1;
    },
    ability: 'Appears as Evil to Evils',
  },
  {
    group: 'botc',
    name: 'Lunatic',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Sees Evil role with random info',
  },
  {
    group: 'botc',
    name: 'Drunk',
    isEvil: false,
    getStrength: roles => (roles.find(r => r.name === 'Merlin')
      ? -2
      : roles.filter(r => !r.isEvil).length > 4 ? -1.5 : -1),
    ability: 'Sees Good role with random info',
  },
  {
    group: 'botc',
    name: 'Puzzlemaster',
    isEvil: false,
    getStrength: () => 3,
    ability: 'Knows Drunk\'s fake and real info',
    requiredRoles: ['Drunk'],
    getInfo(players, curPlayer) {
      const drunk = players.find(p => p.role.name === 'Drunk');
      if (!drunk) {
        return null;
      }
      if (drunk.player === curPlayer) {
        const fakeDrunk = randElem(players.filter(
          p => p.player !== curPlayer && !p.role.isEvil && p.role.getInfo,
        ));
        if (!fakeDrunk) {
          return null;
        }
        const randPlayers1 = getPoisonedRandPlayers(players);
        const randPlayers2 = getPoisonedRandPlayers(players);
        return `Fake info: "${fakeDrunk.role.getInfo!(randPlayers1, fakeDrunk.player)}"\nReal info: "${fakeDrunk.role.getInfo!(randPlayers2, fakeDrunk.player)}"`;
      }
      const drunkAs = rolesMap.get(drunk.player.drunkAs!)!;
      return `Fake info: "${drunk.player.info}"\nReal info: "${drunkAs.getInfo?.(players, drunk.player) ?? 'None'}"`;
    },
    secondPassInfo: true,
  },
  {
    group: 'botc',
    name: 'Recluse',
    isEvil: false,
    getStrength: roles => (roles.filter(r => r.isEvil).length > 2 ? 0 : 0.5),
    ability: 'Appears as Evil to Goods',
  },
  {
    group: 'botc',
    name: 'Spy',
    isEvil: true,
    getStrength: () => 3,
    ability: 'Knows a Good player\'s role',
    getInfo(players, curPlayer) {
      const player = randElem(players.filter(
        p => p.player !== curPlayer && !p.role.isEvil && p.role.name !== 'Merlin',
      ))!;
      return `${player.player.name} is ${player.role.name}. ${formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      )}`;
    },
  },
  {
    group: 'botc',
    name: 'Psychopath',
    isEvil: true,
    getStrength: () => 1.5,
    ability: 'Must fail every Quest',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
  },
  {
    group: 'botc',
    name: 'No Dashii',
    isEvil: true,
    getStrength: roles => (roles.filter(r => !r.isEvil).length > 4 ? 3.5 : 3),
    ability: 'A Good neighbor knows random info',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
  },
  {
    group: 'werewolf',
    name: 'Mason',
    maxCount: 2,
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows other Mason',
    requiredRoles: ['Mason'],
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Other Mason',
        players
          .filter(p => p.player !== curPlayer && p.role.name === 'Mason')
          .map(p => p.player.name),
      );
    },
  },
  {
    group: 'werewolf',
    name: 'Bodyguard',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Assassinations against 1 player doesn\'t count',
    getInfo(players, curPlayer) {
      const player = randElem(players.filter(
        p => p.player !== curPlayer && !p.role.isEvil && p.role.name !== 'Merlin',
      ))!;
      return `Protecting ${player.player.name}`;
    },
  },
  {
    group: 'werewolf',
    name: 'Doppleganger',
    isEvil: false,
    getStrength: () => 1.5,
    ability: 'Knows a Good player\'s info',
    getInfo(players, curPlayer) {
      const player = randElem(players.filter(
        p => p.player !== curPlayer && !p.role.isEvil && p.player.info,
      ));
      return `Info is "${player?.player.info ?? 'none'}"`;
    },
    secondPassInfo: true,
  },
  {
    group: 'werewolf',
    name: 'Village Idiot',
    isEvil: false,
    getStrength: () => 1,
    ability: 'Can reject once per round',
  },
  {
    group: 'werewolf',
    name: 'Lone Wolf',
    isEvil: true,
    getStrength: () => 1.5,
    ability: 'Wins alone if on 3rd failed Quest',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
  },
  {
    group: 'werewolf',
    name: 'Tanner',
    isEvil: true,
    getStrength: () => 1.5,
    ability: 'Wins alone if 3 Quests fail without playing Fail',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
  },
  {
    group: 'werewolf',
    name: 'Dream Wolf',
    isEvil: true,
    getStrength: () => 1.5,
    ability: 'Doesn\'t know Evils',
  },
  {
    group: 'werewolf',
    name: 'Mystic Wolf',
    isEvil: true,
    getStrength: () => 2.5,
    ability: 'Knows a Good player\'s info',
    getInfo(players, curPlayer) {
      const player = randElem(players.filter(
        p => p.player !== curPlayer && !p.role.isEvil && p.player.info,
      ));
      const info = player?.player.info ?? 'none';
      return `Info is "${info}". ${formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      )}`;
    },
    secondPassInfo: true,
  },
  {
    group: 'misc',
    name: 'Hitler',
    isEvil: true,
    getStrength: roles => (roles.length >= 7 ? 2.5 : 2),
    ability: 'When on Quest, can reveal role to fail without votes',
    getInfo(players, curPlayer) {
      return formatNamesList(
        'Your teammate',
        getEvilTeammates(players, curPlayer),
      );
    },
  },
] satisfies (Omit<Role, 'id'> & { maxCount?: number })[];

let nextId = 1;
rolesMap = new Map(roles.flatMap(
  ({ maxCount, ...role }) => Array.from({ length: maxCount ?? 1 }).map(() => [
    nextId,
    {
      id: nextId++,
      ...role,
    },
  ] as [number, Role]),
));

export default rolesMap;
