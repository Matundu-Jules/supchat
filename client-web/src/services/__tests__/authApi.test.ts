import { describe, it, expect, vi, beforeEach } from 'vitest';
import { register, loginApi, resetPassword, getCurrentUser } from '../authApi';

// Mock axios instance
vi.mock('@utils/axiosInstance', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
  fetchCsrfToken: vi.fn(),
}));

import api from '@utils/axiosInstance';

const mockResponse = {
  data: { token: 'mock-token', user: { id: '1', email: 'test@example.com' } },
};

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const registerData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'TestPassword123!',
      };

      const result = await register(registerData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle registration errors', async () => {
      const errorResponse = {
        response: {
          data: { message: 'Email already exists' },
        },
      };
      vi.mocked(api.post).mockRejectedValue(errorResponse);

      const registerData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'TestPassword123!',
      };

      await expect(register(registerData)).rejects.toThrow(
        'Email already exists'
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Network error'));

      const registerData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'TestPassword123!',
      };

      await expect(register(registerData)).rejects.toThrow('Network error');
    });
  });

  describe('loginApi', () => {
    it('should login user successfully', async () => {
      vi.mocked(api.post).mockResolvedValue(mockResponse);

      const loginData = {
        email: 'john@example.com',
        password: 'TestPassword123!',
      };

      const result = await loginApi(loginData);

      expect(api.post).toHaveBeenCalledWith('/auth/login', loginData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle login errors', async () => {
      const errorResponse = {
        response: {
          data: { message: 'Invalid credentials' },
        },
      };
      vi.mocked(api.post).mockRejectedValue(errorResponse);

      const loginData = {
        email: 'john@example.com',
        password: 'TestPassword123!',
      };

      await expect(loginApi(loginData)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      vi.mocked(api.post).mockResolvedValue({
        data: { message: 'Password reset successfully' },
      });

      const result = await resetPassword('reset-token', 'newTestPassword123!');

      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'reset-token',
        newPassword: 'newTestPassword123!',
      });
      expect(result.data).toEqual({ message: 'Password reset successfully' });
    });

    it('should handle invalid reset token', async () => {
      const errorResponse = {
        response: {
          data: { message: 'Invalid or expired reset token' },
        },
      };
      vi.mocked(api.post).mockRejectedValue(errorResponse);

      await expect(
        resetPassword('invalid-token', 'newTestPassword123!')
      ).rejects.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const userData = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };
      vi.mocked(api.get).mockResolvedValue({ data: userData });

      const result = await getCurrentUser();

      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(userData);
    });

    it('should handle unauthorized error', async () => {
      const errorResponse = {
        response: { status: 401, data: { message: 'Unauthorized' } },
      };
      vi.mocked(api.get).mockRejectedValue(errorResponse);

      await expect(getCurrentUser()).rejects.toThrow();
    });
  });
});
