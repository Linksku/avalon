import { useRef, useState } from 'react';
import { useStore } from '../../stores/Store';
import roles from '../../consts/roles';
import TopBar from '../TopBar';

import styles from './NightPage.module.scss';

function randInfo() {
  return 'rand';
}

export default function NightPage() {
  const { players } = useStore();
  const [shownPlayer, setShownPlayer] = useState<Player | null>(null);
  const shownRole = shownPlayer?.roleId ? roles.get(shownPlayer.roleId) : null;
  const longPressRef = useRef({
    startTime: 0,
    playerId: 0,
  });

  const playersArr = [...players.values()].map(p => ({
    player: p,
    role: roles.get(p.roleId as number) as Role,
  }));
  return (
    <>
      <TopBar />

      <div>
        {[...players.values()].map(player => (
          <div
            key={player.id}
            onPointerDown={() => {
              longPressRef.current = {
                startTime: performance.now(),
                playerId: player.id,
              };
            }}
            onPointerCancel={() => {
              longPressRef.current = {
                startTime: 0,
                playerId: 0,
              };
            }}
            onPointerUp={() => {
              if (!shownPlayer
                && longPressRef.current.playerId === player.id
                && performance.now() - longPressRef.current.startTime > 1000) {
                setShownPlayer(player);
              }
            }}
          >
            <h3>{player.name}</h3>
          </div>
        ))}
      </div>

      {shownPlayer && shownRole && (
        <div className={styles.shownPlayer}>
          <h3>{shownPlayer.name}</h3>
          <h4>{shownRole.name}  &middot; {shownRole.isEvil ? 'Evil' : 'Good'}</h4>
          <p>{shownRole.ability}</p>
          <p>{shownRole.getInfo?.(playersArr) ?? randInfo()}</p>
          <button
            onClick={() => {
              setShownPlayer(null);
            }}
          >
            Hide
          </button>
        </div>
      )}
    </>
  );
}
