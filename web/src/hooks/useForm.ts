// src/hooks/useForm.ts

import { useState } from 'react';

export function useForm<T>(initialValues: T) {
  const [values, setValues] = useState(initialValues);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function reset() {
    setValues(initialValues);
  }

  return { values, setValues, handleChange, reset };
}
