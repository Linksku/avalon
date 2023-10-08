import clsx from 'clsx';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import roles from '../../consts/roles';
import { useStore } from '../../stores/Store';

import styles from './RolesSelector.module.scss';

export default function RolesSelector() {
  const { selectedRoles, setSelectedRoles } = useStore();
  const selectedRolesArr = Array.from(selectedRoles);

  return (
    <div className={styles.container}>
      <h2>Roles</h2>
      <div className={styles.roles}>
        {[...roles.values()].map(role => {
          const selected = selectedRoles.has(role);
          return (
            <Card
              key={role.id}
              elevation={2}
              onClick={() => {
                const newSelected = new Set(selectedRoles);
                if (selected) {
                  newSelected.delete(role);
                } else {
                  newSelected.add(role);
                }
                setSelectedRoles(newSelected);
              }}
              className={clsx(styles.role, {
                [styles.evil]: role.isEvil,
                [styles.selected]: selected,
              })}
            >
              <CardContent className={styles.cardContent}>
                <h3 className={styles.name}>
                  {role.name} &middot; {role.getStrength(selectedRolesArr)}
                </h3>
                {role.ability && <div>{role.ability}</div>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
