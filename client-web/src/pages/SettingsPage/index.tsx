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
} from '@services/userApi'
import styles from './SettingsPage.module.scss'

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { theme, status } = useSelector((state: RootState) => state.preferences)
  const user = useSelector((state: RootState) => state.auth.user)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')

  useEffect(() => {
    getProfile().then((u) => {
      setName(u.name)
      setAvatar(u.avatar || '')
    })
    getPreferences().then((p) => {
      dispatch(setTheme(p.theme as Theme))
      dispatch(setStatus(p.status as Status))
    })
  }, [dispatch])

  const handleSaveProfile = async () => {
    await updateProfile({ name, avatar })
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
          Avatar URL
          <input value={avatar} onChange={(e) => setAvatar(e.target.value)} />
        </label>
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
    </section>
  )
}

export default SettingsPage
