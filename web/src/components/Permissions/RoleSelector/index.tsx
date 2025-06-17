import React from "react";

interface RoleSelectorProps {
  value: string;
  onChange: (role: string) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange }) => {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="admin">admin</option>
      <option value="membre">membre</option>
      <option value="invité">invité</option>
    </select>
  );
};

export default RoleSelector;

