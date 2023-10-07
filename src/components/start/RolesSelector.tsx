import clsx from 'clsx';

import roles from '../../consts/roles';
import { useStore } from '../../stores/Store';

import styles from './RolesSelector.module.scss';

export default function RolesSelector() {
  const { selectedRoles, setSelectedRoles } = useStore();
  const selectedRolesArr = Array.from(selectedRoles);

  return (
    <div>
      <h2>Roles</h2>
      {[...roles.values()].map(role => {
        const selected = selectedRoles.has(role);
        return (
          <div
            key={role.id}
            className={clsx(styles.role, {
              [styles.selected]: selected,
            })}
            onClick={() => {
              const newSelected = new Set(selectedRoles);
              if (selected) {
                newSelected.delete(role);
              } else {
                newSelected.add(role);
              }
              setSelectedRoles(newSelected);
            }}
          >
            <h3 className={styles.name}>{role.name}</h3>
            <p>{role.isEvil ? 'Evil' : 'Good'} &middot; {role.getStrength(selectedRolesArr)}</p>
            {role.ability && <p>{role.ability}</p>}
          </div>
        );
      })}
    </div>
  );
}
