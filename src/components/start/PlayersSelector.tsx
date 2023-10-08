import React, { useMemo } from 'react';
import TextField from '@mui/material/TextField';

import { useStore } from '../../stores/Store';

import styles from './PlayersSelector.module.scss';

export default React.memo(function PlayersSelector() {
  const { players, setPlayers } = useStore();

  const nextId = useMemo(() => Math.max(...[...players.values()].map(p => p.id)) + 1, [players]);
  const playerIds = [...[...players.values()].map(p => p.id), nextId];
  return (
    <div className={styles.container}>
      <h2>Players</h2>

      <p>Enter players in the seating order.</p>
      {playerIds.map((id, idx) => {
        const player = players.get(id);
        return (
          <TextField
            key={id}
            label={`P${idx + 1}`}
            defaultValue={player?.name}
            onChange={event => {
              const name = event.target.value.trim();
              if (name && !players.has(id)) {
                const newPlayers = new Map(players);
                newPlayers.set(id, { id, name });
                setPlayers(newPlayers);
              }
            }}
            onBlur={event => {
              const name = event.target.value.trim();
              if (!name && players.has(id)) {
                const newPlayers = new Map(players);
                newPlayers.delete(id);
                setPlayers(newPlayers);
              } else if (name) {
                const newPlayers = new Map(players);
                newPlayers.set(id, { id, name });
                setPlayers(newPlayers);
              }
            }}
            onKeyDown={event => {
              const elem = event.target as HTMLInputElement;
              if (event.code === 'Enter') {
                const inputs = document.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>;
                const idx = [...inputs].indexOf(elem);
                inputs[idx + 1]?.focus();
              }
            }}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
        );
      })}
    </div>
  );
});
