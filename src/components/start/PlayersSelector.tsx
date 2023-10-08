import TextField from '@mui/material/TextField';

import { useStore } from '../../stores/Store';

import styles from './PlayersSelector.module.scss';

export default function PlayersSelector() {
  const { players, setPlayers } = useStore();

  const nextId = Math.round(performance.now());
  const playerIds = [...[...players.values()].map(p => p.id), nextId];
  return (
    <div className={styles.container}>
      <h2>Players</h2>

      <p>Enter players in the seating order</p>
      {playerIds.map((id, idx) => {
        const player = players.get(id);
        return (
          <TextField
            key={id}
            label={`P${idx + 1}`}
            value={player?.name}
            onChange={event => {
              const newPlayers = new Map(players);
              const name = event.target.value.trim();
              if (name) {
                newPlayers.set(id, { id, name });
              } else {
                newPlayers.delete(id);
              }
              setPlayers(newPlayers);
            }}
            onKeyDown={event => {
              if (event.code === 'Enter') {
                const elem = event.target as HTMLInputElement;
                if (elem.nextSibling?.nodeName === 'INPUT') {
                  (elem.nextSibling as HTMLInputElement).focus();
                }
              }
            }}
            fullWidth
            margin="normal"
          />
        );
      })}
    </div>
  );
}
