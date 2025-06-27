import { http, HttpResponse } from 'msw';

// Handlers pour ChannelsPage.invitations
export const handlers = [
  // GET /api/csrf-token
  http.get('*/csrf-token', () => {
    return HttpResponse.json({ csrfToken: 'mock-csrf-token' });
  }),

  // GET /api/channel-invitations
  http.get('*/channel-invitations', () => {
    return HttpResponse.json({ invitations: [] });
  }),

  // POST /api/channel-invitations/respond/:id
  http.post('*/channel-invitations/respond/:id', ({ params, request }) => {
    const { id } = params;
    return HttpResponse.json({
      invitation: {
        _id: id,
        status: 'accepted',
      },
    });
  }),
];
