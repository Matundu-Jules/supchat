import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@store/store'
import {
  setTheme,
  setStatus,
  Theme,
  Status,
} from '@store/preferencesSlice'
import {
  getProfile,
  updateProfile,
  getPreferences,
  updatePreferences,
  updateEmail,
  uploadAvatar,
  deleteAvatar,
  exportUserData,
} from '@services/userApi'
import {
  listIntegrations,
  linkGoogleDrive,
  unlinkGoogleDrive,
  linkGithub,
  unlinkGithub,
  linkGoogleAccount,
  unlinkGoogleAccount,
  linkFacebookAccount,
  unlinkFacebookAccount,
} from '@services/integrationApi'
import { useNotificationPrefs } from '@hooks/useNotificationPrefs'
import NotificationPrefList from '@components/Notification/NotificationPrefList'
import { logoutAll, deleteAccount } from '@services/authApi'
import styles from './SettingsPage.module.scss'

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { theme, status } = useSelector((state: RootState) => state.preferences)
  const user = useSelector((state: RootState) => state.auth.user)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [integrations, setIntegrations] = useState({
    googleDrive: false,
    github: false,
  })
  const { prefs, updatePref } = useNotificationPrefs()

  useEffect(() => {
    getProfile().then((u) => {
      setName(u.name)
      setAvatar(u.avatar || '')
      setEmail(u.email)
    })
    getPreferences().then((p) => {
      dispatch(setTheme(p.theme as Theme))
      dispatch(setStatus(p.status as Status))
    })
    listIntegrations().then(setIntegrations)
  }, [dispatch])

  const handleSaveProfile = async () => {
    await updateProfile({ name, avatar })
    if (avatarFile) {
      const { avatar: newUrl } = await uploadAvatar(avatarFile)
      setAvatar(newUrl)
      setAvatarFile(null)
    }
    if (email && user?.email !== email) {
      await updateEmail(email)
    }
  }

  const handleThemeToggle = async () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light'
    dispatch(setTheme(newTheme))
    await updatePreferences({ theme: newTheme })
    document.body.setAttribute('data-theme', newTheme)
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Status
    dispatch(setStatus(newStatus))
    await updatePreferences({ status: newStatus })
  }

  const handleLinkDrive = async () => {
    const code = prompt('Code Google OAuth')
    if (code) {
      await linkGoogleDrive(code)
      setIntegrations({ ...integrations, googleDrive: true })
    }
  }

  const handleUnlinkDrive = async () => {
    await unlinkGoogleDrive()
    setIntegrations({ ...integrations, googleDrive: false })
  }

  const handleLinkGithub = async () => {
    const token = prompt('GitHub token')
    if (token) {
      await linkGithub(token)
      setIntegrations({ ...integrations, github: true })
    }
  }

  const handleUnlinkGithub = async () => {
    await unlinkGithub()
    setIntegrations({ ...integrations, github: false })
  }

  const handleLogoutAll = async () => {
    await logoutAll()
  }

  const handleExport = async () => {
    const data = await exportUserData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'supchat-data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteAccount = async () => {
    if (confirm('Supprimer votre compte ?')) {
      await deleteAccount()
    }
  }

  if (!user) return null

  return (
    <section className={styles.settingsPage}>
      <h1>Paramètres</h1>
      <div className={styles.profileSection}>
        <label>
          Nom affiché
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Avatar URL
          <input value={avatar} onChange={(e) => setAvatar(e.target.value)} />
        </label>
        <label>
          Fichier avatar
          <input type="file" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
        </label>
        <button onClick={() => deleteAvatar()}>Retirer avatar</button>
        <button onClick={handleSaveProfile}>Sauvegarder</button>
      </div>
      <div className={styles.prefSection}>
        <button onClick={handleThemeToggle}>
          Thème : {theme === 'light' ? 'Clair' : 'Sombre'}
        </button>
        <label>
          Statut
          <select value={status} onChange={handleStatusChange}>
            <option value="online">En ligne</option>
            <option value="away">Absent</option>
            <option value="busy">Occupé</option>
            <option value="offline">Hors ligne</option>
          </select>
        </label>
      </div>
      <div className={styles.notifSection}>
        <h2>Notifications</h2>
        <NotificationPrefList items={prefs} onChange={updatePref} />
      </div>
      <div className={styles.integrationSection}>
        <h2>Intégrations</h2>
        <div>
          <span>Google Drive: {integrations.googleDrive ? 'connecté' : 'déconnecté'}</span>
          {integrations.googleDrive ? (
            <button onClick={handleUnlinkDrive}>Déconnecter</button>
          ) : (
            <button onClick={handleLinkDrive}>Connecter</button>
          )}
        </div>
        <div>
          <span>GitHub: {integrations.github ? 'connecté' : 'déconnecté'}</span>
          {integrations.github ? (
            <button onClick={handleUnlinkGithub}>Déconnecter</button>
          ) : (
            <button onClick={handleLinkGithub}>Connecter</button>
          )}
        </div>
        <div>
          <button onClick={() => linkGoogleAccount(prompt('Google ID') || '')}>Lier Google</button>
          <button onClick={unlinkGoogleAccount}>Délier Google</button>
        </div>
        <div>
          <button onClick={() => linkFacebookAccount(prompt('Facebook ID') || '')}>Lier Facebook</button>
          <button onClick={unlinkFacebookAccount}>Délier Facebook</button>
        </div>
      </div>
      <div className={styles.securitySection}>
        <h2>Sécurité</h2>
        <button onClick={handleLogoutAll}>Déconnexion globale</button>
        <button onClick={handleExport}>Exporter mes données</button>
        <button onClick={handleDeleteAccount}>Supprimer mon compte</button>
      </div>
    </section>
  )
}

export default SettingsPage
