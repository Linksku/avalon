import React from 'react';
import clsx from 'clsx';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import shuffle from 'lodash/shuffle';

import roles from '../../consts/roles';
import { useStore } from '../../stores/Store';

import styles from './RolesSelector.module.scss';
import getRolesErr from './getRolesErr';

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
          onClick={() => {
            const drunk = [...roles.values()].find(role => role.name === 'Drunk')!;
            while (true) {
              const selected = new Set<Role>();
              const remainingRoles = shuffle([...roles.values()]);
              while (selected.size - (selected.has(drunk) ? 1 : 0) < players.size) {
                const newSelected = remainingRoles.pop()!;
                selected.add(newSelected);
                if (newSelected.requiredRoles) {
                  for (const r of newSelected.requiredRoles) {
                    selected.add([...roles.values()].find(r2 => r2.name === r)!);
                  }
                }
              }

              const selectedArr = Array.from(selected);
              const strengthDiff = selectedArr.reduce(
                (sum, role) => (role.isEvil
                  ? sum - role.getStrength(selectedArr)
                  : sum + role.getStrength(selectedArr)),
                0,
              );
              if (Math.abs(strengthDiff) < 1 && !getRolesErr(players, selected)) {
                setSelectedRoles(selected);
                break;
              }
            }
          }}
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
                      <h3 className={styles.name}>
                        {role.name}
                        <span> &middot; {role.getStrength(selectedRolesArr)}</span>
                      </h3>
                      {role.ability && <div>{role.ability}</div>}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
});
