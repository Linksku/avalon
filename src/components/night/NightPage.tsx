import { useRef, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { ReactComponent as CheckSvg } from 'fontawesome-svgs/svg/check-circle-light.svg';

import { useStore } from '../../stores/Store';
import roles from '../../consts/roles';
import TopBar from '../TopBar';

import styles from './NightPage.module.scss';

function randInfo() {
  return 'todo';
}

export default function NightPage() {
  const { players } = useStore();
  const [shownPlayer, setShownPlayer] = useState<Player | null>(null);
  const shownRole = shownPlayer?.roleId ? roles.get(shownPlayer.roleId) : null;
  const [seenPlayers, setSeenPlayers] = useState(new Set<number>());
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

      <div className={styles.players}>
        {[...players.values()].map(player => (
          <Card
            key={player.id}
            elevation={2}
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
                && performance.now() - longPressRef.current.startTime > 500) {
                setShownPlayer(player);
              }
            }}
            className={styles.player}
          >
            <CardContent>
              <h3>{player.name}</h3>
              {seenPlayers.has(player.id)
                ? <CheckSvg className={styles.checkSvg} />
                : <div className={styles.holdToReveal}>Hold to reveal</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      {shownPlayer && shownRole && (
        <div className={styles.shownPlayer}>
          <h3>{shownPlayer.name}</h3>
          <h4>{shownRole.name}  &middot; {shownRole.isEvil ? 'Evil' : 'Good'}</h4>
          <p>{shownRole.ability}</p>
          <p>{shownRole.getInfo?.(playersArr) ?? randInfo()}</p>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              setShownPlayer(null);
              setSeenPlayers(new Set([...seenPlayers, shownPlayer.id]));
            }}
          >
            Hide
          </Button>
        </div>
      )}
    </>
  );
}
