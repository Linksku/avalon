import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import { ReactComponent as CheckSvg } from 'fontawesome-svgs/svg/check-circle-light.svg';
import shuffle from 'lodash/shuffle';
import clsx from 'clsx';

import { useStore } from '../../stores/Store';
import roles from '../../consts/roles';
import TopBar from '../TopBar';

import styles from './NightPage.module.scss';

const WinConsSection = React.memo(function WinConsSection({ selectedRoles }: {
  selectedRoles: Set<Role>,
}) {
  const rolesArr = useMemo(() => [...selectedRoles], [selectedRoles]);
  const hasMerlin = rolesArr.some(role => role.name === 'Merlin');
  const assassin = useMemo(
    () => (rolesArr.find(role => role.name === 'Assassin')
      ?? shuffle(rolesArr.filter(role => role.isEvil))[0]),
    [rolesArr],
  );
  const numPowerGoods = rolesArr
    .filter(role => role.name !== 'Villager'
      && role.name !== 'Merlin'
      && role.name !== 'Percival')
    .length;
  const numGoods = rolesArr.filter(role => !role.isEvil).length;
  const hasDrunk = rolesArr.some(role => role.name === 'Drunk');

  const evilWinCons = ['3 Quests fail'];
  if (hasMerlin) {
    evilWinCons.push(`${assassin.name} guesses Merlin`);
  }
  if (numPowerGoods >= numGoods / 2) {
    evilWinCons.push('Evil guesses half of Goods');
  }
  return (
    <>
      <h2 className={styles.title}>Win Conditions</h2>
      <div className={styles.winCons}>
        <p>
          <span className={styles.goodWinCon}>Good</span>
          {' wins if 3 Quests fail'}
        </p>
        {rolesArr.some(role => role.name === 'Lone Wolf') && (
          <p>
            <span className={styles.evilWinCon}>Lone Wolf</span>
            {' wins if Lone Wolf is on the 3rd failing quest'}
          </p>
        )}
        {rolesArr.some(role => role.name === 'Tanner') && (
          <p>
            <span className={styles.evilWinCon}>Tanner</span>
            {' wins if 3 Quests fail and Tanner never played a Fail'}
          </p>
        )}
        <p>
          <span className={styles.evilWinCon}>Evil</span>
          {' '}
          wins if
          {' '}
          {evilWinCons.join(' OR ')}
        </p>
        {hasDrunk && (
          <p>* Can guess Drunk as their fake role</p>
        )}
      </div>
    </>
  );
});

const PlayerSlideUp = React.memo(function PlayerSlideUp({ player, role, onClose }: {
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

  const drunkAsRole = player?.drunkAs ? roles.get(player.drunkAs) : null;
  return (
    <>
      <div
        className={clsx(styles.playerSlideUpOverlay, {
          [styles.playerSlideUpOverlayShown]: !!(player && role),
        })}
        onClick={onClose}
        role="dialog"
      />
      <div
        className={clsx(styles.playerSlideUp, {
          [styles.playerSlideUpShown]: !!(player && role),
        })}
      >
        <div className={styles.playerSlideUpInner}>
          {player && role && (
            <>
              <h3>{player.name}</h3>
              <h4>
                {'You are '}
                <span
                  className={clsx(styles.roleName, styles.playerRoleName, {
                    [styles.roleNameEvil]: (drunkAsRole?.isEvil ?? role.isEvil),
                  })}
                >
                  {drunkAsRole?.name ?? role.name}
                </span>
              </h4>
              <p>{drunkAsRole?.ability ?? role.ability}</p>
              <p className={styles.playerInfo}>{player.info}</p>
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
      </div>
    </>
  );
});

export default function NightPage() {
  const { players, selectedRoles } = useStore();
  const [shownPlayer, setShownPlayer] = useState<Player | null>(null);
  const shownRole = useMemo(
    () => (shownPlayer?.roleId ? roles.get(shownPlayer.roleId) : null),
    [shownPlayer],
  );
  const [seenPlayers, setSeenPlayers] = useState(new Set<number>());
  const longPressTimer = useRef<number | null>(null);
  const shuffledRoles = useRef(shuffle([...selectedRoles]));

  const printedPlayers = useRef<Map<number, Player> | null>(null);
  useEffect(() => {
    if (printedPlayers.current === players) {
      return;
    }

    for (const player of players.values()) {
      const role = roles.get(player.roleId!);
      // eslint-disable-next-line no-console
      console.log(`${player.name} (${role?.name}):`, player.info, player, role);
    }
    printedPlayers.current = players;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <TopBar />

      <div className={styles.main}>
        <h2 className={styles.title}>Roles in Game</h2>
        <div className={styles.roles}>
          {shuffledRoles.current.map(role => (
            <Card
              key={role.id}
              elevation={2}
              className={styles.role}
            >
              <CardContent className={styles.cardContent}>
                <h3
                  className={clsx(styles.roleName, {
                    [styles.roleNameEvil]: role.isEvil,
                  })}
                >
                  {role.name}
                </h3>
                {role.ability && <div className={styles.ability}>{role.ability}</div>}
              </CardContent>
            </Card>
          ))}
          {Array.from({ length: 5 }).map(
            // eslint-disable-next-line react/no-array-index-key
            (_, i) => <div key={i} />,
          )}
        </div>

        <WinConsSection selectedRoles={selectedRoles} />

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
              onPointerUp={() => {
                if (longPressTimer.current) {
                  clearTimeout(longPressTimer.current);
                }
              }}
              onPointerOut={() => {
                if (longPressTimer.current) {
                  clearTimeout(longPressTimer.current);
                }
              }}
              className={clsx(styles.player, {
                [styles.playerFaded]: shownPlayer && shownPlayer.id !== player.id,
              })}
            >
              <CardContent className={styles.cardContent}>
                <h3>{player.name}</h3>
                {seenPlayers.has(player.id)
                  ? <CheckSvg className={styles.checkSvg} />
                  : <div className={styles.holdToReveal}>Hold to reveal</div>}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <PlayerSlideUp
        player={shownPlayer}
        role={shownRole}
        onClose={useCallback(() => {
          setShownPlayer(null);
        }, [])}
      />
    </>
  );
}
