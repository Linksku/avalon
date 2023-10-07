import constate from 'constate';
import { useState } from 'react';

export const [
  StoreProvider,
  useStore,
] = constate(
  function Store() {
    const [gameState, setGameState] = useState<GameState>('start');
    const [players, setPlayers] = useState(new Map<number, Player>());
    const [selectedRoles, setSelectedRoles] = useState(new Set<Role>());

    return {
      gameState,
      setGameState,
      players,
      setPlayers,
      selectedRoles,
      setSelectedRoles,
    };
  },
);
