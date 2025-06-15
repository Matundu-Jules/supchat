import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useForm } from '../useForm';

describe('useForm', () => {
  it('should initialize with provided initial values', () => {
    const initialValues = {
      email: 'test@example.com',
      password: 'TestPassword123!',
    };
    const { result } = renderHook(() => useForm(initialValues));

    expect(result.current.values).toEqual(initialValues);
    expect(typeof result.current.setValues).toBe('function');
    expect(typeof result.current.handleChange).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('should initialize with empty values', () => {
    const initialValues = { email: '', password: '' };
    const { result } = renderHook(() => useForm(initialValues));

    expect(result.current.values).toEqual({ email: '', password: '' });
  });

  it('should update values when handleChange is called', () => {
    const initialValues = { email: '', password: '' };
    const { result } = renderHook(() => useForm(initialValues));

    const mockEvent = {
      target: { name: 'email', value: 'test@example.com' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange(mockEvent);
    });

    expect(result.current.values.email).toBe('test@example.com');
    expect(result.current.values.password).toBe('');
  });

  it('should update multiple fields independently', () => {
    const initialValues = { email: '', password: '', username: '' };
    const { result } = renderHook(() => useForm(initialValues));

    const emailEvent = {
      target: { name: 'email', value: 'test@example.com' },
    } as React.ChangeEvent<HTMLInputElement>;

    const passwordEvent = {
      target: { name: 'password', value: 'securepassword' },
    } as React.ChangeEvent<HTMLInputElement>;

    const usernameEvent = {
      target: { name: 'username', value: 'testuser' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange(emailEvent);
    });

    act(() => {
      result.current.handleChange(passwordEvent);
    });

    act(() => {
      result.current.handleChange(usernameEvent);
    });

    expect(result.current.values).toEqual({
      email: 'test@example.com',
      password: 'securepassword',
      username: 'testuser',
    });
  });

  it('should reset form to initial values', () => {
    const initialValues = {
      email: 'initial@example.com',
      password: 'initial123',
    };
    const { result } = renderHook(() => useForm(initialValues));

    // Change values
    const changeEvent = {
      target: { name: 'email', value: 'changed@example.com' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange(changeEvent);
    });

    expect(result.current.values.email).toBe('changed@example.com');

    // Reset form
    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
  });

  it('should allow direct value setting with setValues', () => {
    const initialValues = { email: '', password: '' };
    const { result } = renderHook(() => useForm(initialValues));

    const newValues = { email: 'new@example.com', password: 'TestPassword123!' };

    act(() => {
      result.current.setValues(newValues);
    });

    expect(result.current.values).toEqual(newValues);
  });

  it('should handle partial updates with setValues', () => {
    const initialValues = {
      email: 'initial@example.com',
      password: 'initial123',
    };
    const { result } = renderHook(() => useForm(initialValues));

    act(() => {
      result.current.setValues((prev) => ({
        ...prev,
        email: 'updated@example.com',
      }));
    });

    expect(result.current.values).toEqual({
      email: 'updated@example.com',
      password: 'initial123',
    });
  });
});
