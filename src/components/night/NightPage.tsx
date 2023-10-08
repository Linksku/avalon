import { useEffect, useRef, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { ReactComponent as CheckSvg } from 'fontawesome-svgs/svg/check-circle-light.svg';
import shuffle from 'lodash/shuffle';

import { useStore } from '../../stores/Store';
import roles from '../../consts/roles';
import TopBar from '../TopBar';

import styles from './NightPage.module.scss';
import clsx from 'clsx';

function PlayerSlideUp({ player, role, onClose }: {
  player?: Player | null,
  role?: Role | null,
  onClose: () => void,
}) {
  const [hideablePlayer, setHideablePlayer] = useState<number | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setHideablePlayer(player?.id ?? null);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [player?.id]);

  return (
    <div
      className={clsx(styles.playerSlideUp, {
        [styles.playerSlideUpShown]: !!(player && role),
      })}
    >
      {player && role && (
        <>
          <h3>{player.name}</h3>
          <h4>{role.name}  &middot; {role.isEvil ? 'Evil' : 'Good'}</h4>
          <p>{role.ability}</p>
          <p>{player.info}</p>
        </>
      )}
      <Button
        variant="contained"
        size="large"
        disabled={hideablePlayer !== player?.id}
        onClick={onClose}
      >
        Hide
      </Button>
    </div>
  );
}

export default function NightPage() {
  const { players } = useStore();
  const [shownPlayer, setShownPlayer] = useState<Player | null>(null);
  const shownRole = shownPlayer?.roleId ? roles.get(shownPlayer.roleId) : null;
  const [seenPlayers, setSeenPlayers] = useState(new Set<number>());
  const longPressTimer = useRef<number | null>(null);
  const shuffledPlayers = useRef(shuffle([...players.values()]));

  return (
    <>
      <TopBar />

      <h2 className={styles.title}>Roles in Game</h2>
      <div className={styles.roles}>
        {shuffledPlayers.current.map(player => {
          const role = roles.get(player.roleId as number) as Role;
          return (
            <Card
              key={role.id}
              elevation={2}
              className={styles.role}
            >
              <CardContent>
                <h3
                  className={clsx(styles.roleName, {
                    [styles.roleNameEvil]: role.isEvil,
                  })}
                >
                  {role.name}
                </h3>
                {role.ability && <div>{role.ability}</div>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <h2 className={styles.title}>Player Roles</h2>
      <div className={styles.players}>
        {[...players.values()].map(player => (
          <Card
            key={player.id}
            elevation={2}
            onPointerDown={() => {
              if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
              }
              if (!shownPlayer) {
                longPressTimer.current = setTimeout(() => {
                  setSeenPlayers(new Set([...seenPlayers, player.id]));
                  setShownPlayer(player);
                }, 500) as unknown as number;
              }
            }}
            onPointerCancel={() => {
              if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
              }
            }}
            onPointerUp={() => {
              if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
              }
            }}
            className={clsx(styles.player, {
              [styles.playerFaded]: shownPlayer && shownPlayer.id !== player.id,
            })}
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

      <PlayerSlideUp
        player={shownPlayer}
        role={shownRole}
        onClose={() => {
          setShownPlayer(null);
        }}
      />
    </>
  );
}
