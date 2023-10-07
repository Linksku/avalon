import { useStore } from '../../stores/Store';

import styles from './PlayersSelector.module.css';

export default function PlayersSelector() {
  const { players, setPlayers } = useStore();

  const nextId = Math.round(performance.now());
  const playerIds = [...[...players.values()].map(p => p.id), nextId];
  return (
    <div>
      <h2>Players</h2>

      {playerIds.map(id => {
        const player = players.get(id);
        return (
          <input
            key={id}
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
            className={styles.input}
          />
        );
      })}
    </div>
  );
}
