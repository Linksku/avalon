import constate from 'constate';
import { useCallback, useMemo, useState } from 'react';

import roles from '../consts/roles';

export const [
  StoreProvider,
  useStore,
] = constate(
  function Store() {
    const defaultState = useMemo(() => {
      try {
        const parsed = JSON.parse(window.localStorage.getItem('avalonState') ?? '');
        if (!parsed || !parsed.gameState || !parsed.players || !parsed.selectedRoles) {
          return null;
        }
        const temp = {
          gameState: parsed.gameState,
          players: new Map(parsed.players),
          selectedRoles: new Set(parsed.selectedRoles.map((data: any) => {
            const role = roles.get(data.id);
            if (!role || role.name !== data.name) {
              return null;
            }
            return role;
          })),
        };
        if ((temp.players.size !== temp.selectedRoles.size
            && temp.players.size !== temp.selectedRoles.size - 1)
          || [...temp.selectedRoles].some(role => !role)
          || temp.players.size < 5) {
          return null;
        }
        return temp as {
          gameState: GameState,
          players: Map<number, Player>,
          selectedRoles: Set<Role>,
        };
      } catch (err) {
        console.log(err);
        return null;
      }
    }, []);
    const [gameState, _setGameState] = useState<GameState>(defaultState?.gameState ?? 'start');
    const [numResets, setNumResets] = useState(0);
    const [players, setPlayers] = useState(defaultState?.players ?? new Map<number, Player>());
    const [selectedRoles, setSelectedRoles] = useState(defaultState?.selectedRoles ?? new Set<Role>());

    const setGameState = useCallback((newState: GameState) => {
      localStorage.setItem('avalonState', JSON.stringify({
        gameState: newState,
        players: [...players.entries()],
        selectedRoles: Array.from(selectedRoles).map(r => ({
          id: r.id,
          name: r.name,
        })),
      }));
      _setGameState(newState);
    }, [players, selectedRoles]);

    return {
      gameState,
      setGameState,
      numResets,
      setNumResets,
      players,
      setPlayers,
      selectedRoles,
      setSelectedRoles,
    };
  },
);
