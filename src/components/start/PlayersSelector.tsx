import React from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { useStore } from '../../stores/Store';

import styles from './PlayersSelector.module.scss';

export default React.memo(function PlayersSelector() {
  const {
    players,
    setPlayers,
    numResets,
    saveGameState,
  } = useStore();

  const playerIds = [...players.values()].map(p => p.id);
  const nextId = Math.max(0, ...playerIds) + 1;
  return (
    <div key={numResets} className={styles.container}>
      <h2>Players</h2>

      <p>Enter players in the seating order.</p>
      {(playerIds.length >= 10 ? playerIds : [...playerIds, nextId]).map((id, idx) => {
        const player = players.get(id);
        return (
          <TextField
            key={id}
            label={`P${idx + 1}`}
            defaultValue={player?.name ?? ''}
            onFocus={event => {
              if (!players.has(id)) {
                const name = event.target.value.trim();
                setPlayers(s => {
                  const newPlayers = new Map(s);
                  newPlayers.set(id, { ...player, id, name });
                  return newPlayers;
                });
              }
            }}
            onBlur={event => {
              const name = event.target.value.trim();
              if (!name && players.has(id)) {
                setPlayers(s => {
                  const newPlayers = new Map(s);
                  newPlayers.delete(id);
                  return newPlayers;
                });
              } else if (name) {
                setPlayers(s => {
                  const newPlayers = new Map(s);
                  newPlayers.set(id, { ...player, id, name });
                  return newPlayers;
                });
              }
            }}
            onKeyDown={event => {
              const elem = event.target as HTMLInputElement;
              if (event.code === 'Enter') {
                const inputs = document.querySelectorAll('input[type="text"]') as NodeListOf<HTMLInputElement>;
                const inputIdx = [...inputs].indexOf(elem);
                inputs[inputIdx + 1]?.focus();
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

      <div className={styles.saveBtnWrap}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            saveGameState();
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
});
