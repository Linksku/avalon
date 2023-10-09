import React from 'react';
import clsx from 'clsx';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import shuffle from 'lodash/shuffle';

import roles from '../../consts/roles';
import { useStore } from '../../stores/Store';

import styles from './RolesSelector.module.scss';
import getRolesErr, { NUM_EVILS } from './getRolesErr';

const ROLE_GROUPS = {
  base: 'Base',
  avalon: 'Avalon',
  botc: 'BotC',
  hitler: 'Secret Hitler',
  werewolf: 'Werewolf',
  custom: 'Custom',
};

export default React.memo(function RolesSelector() {
  const { players, selectedRoles, setSelectedRoles } = useStore();
  const selectedRolesArr = Array.from(selectedRoles);

  function handleClickRandomize() {
    const drunk = [...roles.values()].find(role => role.name === 'Drunk')!;
    let bestSelected: Set<Role> | undefined;
    let bestStrengthDiff = Number.POSITIVE_INFINITY;
    for (let i = 0; i < players.size; i++) {
      const selected = new Set<Role>();
      let remainingRoles = shuffle([...roles.values()]);
      while (selected.size - (selected.has(drunk) ? 1 : 0) < players.size) {
        const newSelected = remainingRoles.pop()!;
        let cantAdd = false;
        if (newSelected.requiredRoles) {
          for (const r of newSelected.requiredRoles) {
            if ([...selected].some(r2 => r2.name === r)) {
              continue;
            }

            const idx = remainingRoles.findIndex(
              r2 => r2.name === r && r2 !== newSelected,
            );
            if (idx >= 0) {
              selected.add(remainingRoles[idx]);
              remainingRoles.splice(idx, 1);
            } else {
              cantAdd = true;
              break;
            }
          }
        }
        if (!cantAdd) {
          selected.add(newSelected);
        }

        if ([...selected].filter(r => !r.isEvil).length - (selected.has(drunk) ? 1 : 0)
          >= players.size - NUM_EVILS.get(players.size)!) {
          remainingRoles = remainingRoles.filter(r => r.isEvil);
        }
        if ([...selected].filter(r => r.isEvil).length >= NUM_EVILS.get(players.size)!) {
          remainingRoles = remainingRoles.filter(r => !r.isEvil);
        }
        if (!remainingRoles.length) {
          break;
        }
      }

      const selectedArr = Array.from(selected).filter(r => r !== drunk);
      const strengthDiff = Array.from(selected).reduce(
        (sum, role) => (role.isEvil
          ? sum - role.getStrength(selectedArr)
          : sum + role.getStrength(selectedArr)),
        0,
      );
      if (!bestSelected
        || (!getRolesErr(players, selected) && Math.abs(strengthDiff) < bestStrengthDiff)) {
        bestSelected = selected;
        bestStrengthDiff = Math.abs(strengthDiff);
      }
    }
    setSelectedRoles(bestSelected!);
  }

  function handleClickRole(role: Role, selected: boolean) {
    return () => {
      const newSelected = new Set(selectedRoles);
      if (selected) {
        newSelected.delete(role);

        for (const r of selectedRoles) {
          if (r.requiredRoles && r.requiredRoles.includes(role.name)) {
            newSelected.delete(r);
          }
        }
      } else {
        newSelected.add(role);

        if (role.requiredRoles) {
          const roleNames = [...selectedRoles].map(r => r.name);
          for (const r of role.requiredRoles) {
            if (!roleNames.includes(r)) {
              newSelected.add(
                [...roles.values()].find(r2 => r2.name === r) as Role,
              );
            }
          }
        }
      }
      setSelectedRoles(newSelected);
    }
  }

  return (
    <div className={styles.container}>
      <h2>Roles</h2>

      <div className={styles.randomizeBtn}>
        <Button
          onClick={handleClickRandomize}
          disabled={players.size < 5}
          variant="contained"
          color="primary"
        >
          Randomize
        </Button>
      </div>

      {Object.entries(ROLE_GROUPS).map(([key, name]) => {
        const groupRoles = [...roles.values()].filter(r => r.group === key);
        if (!groupRoles.length) {
          return null;
        }
        return (
          <React.Fragment key={key}>
            <h3>{name}</h3>
            <div className={styles.roles}>
              {groupRoles.map(role => {
                const selected = selectedRoles.has(role);
                return (
                  <Card
                    key={role.id}
                    elevation={selected ? 1 : 2}
                    onClick={handleClickRole(role, selected)}
                    className={clsx(styles.role, {
                      [styles.evil]: role.isEvil,
                      [styles.selected]: selected,
                    })}
                  >
                    <CardContent className={styles.cardContent}>
                      <div className={styles.nameWrap}>
                        <h3 className={styles.name}>
                          {role.name}
                        </h3>
                        <div className={styles.strength}>
                          {role.getStrength(selectedRolesArr)}
                        </div>
                      </div>
                      {role.ability && <div className={styles.ability}>{role.ability}</div>}
                    </CardContent>
                  </Card>
                );
              })}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} />
              ))}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
});
