import React from 'react';
import TextField from '@mui/material/TextField';

import { useStore } from '../../stores/Store';

import styles from './PlayersSelector.module.scss';

export default React.memo(function PlayersSelector() {
  const { players, setPlayers, numResets } = useStore();

  const playerIds = [...players.values()].map(p => p.id);
  const nextId = Math.max(0, ...playerIds) + 1;
  return (
    <div key={numResets} className={styles.container}>
      <h2>Players</h2>

      <p>Enter players in the seating order.</p>
      {[...playerIds, nextId].map((id, idx) => {
        const player = players.get(id);
        return (
          <TextField
            key={id}
            label={`P${idx + 1}`}
            defaultValue={player?.name ?? ''}
            onFocus={event => {
              if (!players.has(id)) {
                const newPlayers = new Map(players);
                newPlayers.set(id, { id, name: event.target.value.trim() });
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
