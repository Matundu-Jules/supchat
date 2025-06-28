# ✅ Checklist Correctifs – Tests ChannelsPage (joinRequests)

## Contexte & Providers

- [x] Passer un utilisateur **ADMIN** dans `SessionProvider` (role: "ADMIN").
- [x] Partager le **même QueryClient** entre les tests pour éviter le cache fantôme.

## Mocks réseau (MSW)

- [x] Mock **PATCH** `/channels/:channelId/join-requests/:userId/accept` → `200 { message: "Succès" }`.
- [x] Mock **POST** `/channels/:channelId/join-requests` → `201 { message: "Demande envoyée" }`.
- [x] Déclarer ou override ces mocks dans chaque test avec `server.use(...)`.

## Assertions RTL

- [x] **Acceptation** : `await screen.findByText(/succès/i)`.
- [x] **Envoi** : `await screen.findByLabelText(/demande en attente/i)` (ou adapter selon texte réel).

## Bonnes pratiques

- [x] Utiliser **userEvent** plutôt que `fireEvent` pour les interactions.
- [x] Pour les toasts temporisés : `jest.useFakeTimers()` puis `jest.advanceTimersByTime(...)`.
- [x] Utiliser `logRoles()` et `screen.logTestingPlaygroundURL()` pour déboguer rapidement.
- [ ] Les warnings **Sass legacy-js-api** n’impactent pas les tests → les ignorer ou les filtrer.
