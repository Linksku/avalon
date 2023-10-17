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
        const selectedRoles = Array.isArray(parsed.selectedRoles)
          ? (parsed.selectedRoles as any[]).map(data => {
            const role = roles.get(data.id);
            if (!role || role.name !== data.name) {
              return null;
            }
            return role;
          })
          : [];
        return {
          gameState: (typeof parsed.gameState === 'string'
            ? parsed.gameState
            : 'start') as GameState,
          players: (Array.isArray(parsed.players)
            ? new Map(parsed.players)
            : new Map()) as Map<number, Player>,
          selectedRoles: selectedRoles.every(r => r)
            ? new Set(selectedRoles as Role[])
            : new Set<Role>(),
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

    const saveGameState = useCallback(() => {
      localStorage.setItem('avalonState', JSON.stringify({
        gameState,
        players: [...players.entries()],
        selectedRoles: Array.from(selectedRoles).map(r => ({
          id: r.id,
          name: r.name,
        })),
      }));
    }, [gameState, players, selectedRoles]);

    const setGameState = useCallback((newState: GameState) => {
      saveGameState();
      _setGameState(newState);
      window.scrollTo(0, 0);
    }, [saveGameState]);

    return {
      gameState,
      setGameState,
      saveGameState,
      numResets,
      setNumResets,
      players,
      setPlayers,
      selectedRoles,
      setSelectedRoles,
    };
  },
);
