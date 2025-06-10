// src/hooks/usePasswordToggle.ts

import { useState } from 'react';

export function usePasswordToggle() {
  const [show, setShow] = useState(false);
  return {
    type: show ? 'text' : 'password',
    show,
    setShow,
  };
}
