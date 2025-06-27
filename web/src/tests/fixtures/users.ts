export const users = [
  {
    _id: 'u1',
    email: 'user1@example.com',
    role: 'admin',
    username: 'JohnDoe',
    isVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'u2',
    email: 'user2@example.com',
    role: 'member',
    username: 'JaneSmith',
    isVerified: true,
    createdAt: '2024-01-02T00:00:00.000Z',
  },
  {
    _id: 'u3',
    email: 'user3@example.com',
    role: 'member',
    username: 'BobWilson',
    isVerified: false,
    createdAt: '2024-01-03T00:00:00.000Z',
  },
];

export const mockUser = users[0];
export const mockAdmin = users[0];
export const mockMember = users[1];
