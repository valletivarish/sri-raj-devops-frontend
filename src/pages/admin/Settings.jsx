import React from 'react'
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi'
import { useTheme } from '../../context/ThemeContext'
import Card from '../../components/Card'

export default function Settings() {
  const { darkMode, toggleDarkMode } = useTheme()

  return (
    <div className="grid" style={{gap: 16}}>
      <Card>
        <h3 style={{marginTop: 0}}>UI Settings</h3>
        <div className="grid" style={{gap: 12}}>
          <div className="space-between" style={{alignItems: 'center'}}>
            <div>
              <strong>Dark Mode</strong>
              <p style={{margin: '4px 0 0 0', fontSize: '14px', color: 'var(--muted)'}}>
                Switch between light and dark theme
              </p>
            </div>
            <button
              className="btn ghost"
              onClick={toggleDarkMode}
              style={{minWidth: '100px', padding: '10px 16px'}}
            >
              {darkMode ? (
                <>
                  <HiOutlineSun style={{marginRight: '8px', fontSize: '18px'}} />
                  Light
                </>
              ) : (
                <>
                  <HiOutlineMoon style={{marginRight: '8px', fontSize: '18px'}} />
                  Dark
                </>
              )}
            </button>
          </div>
        </div>
      </Card>
      
      <Card>
        <h3 style={{marginTop: 0}}>Preferences</h3>
        <p style={{color: 'var(--muted)'}}>More settings coming soon...</p>
      </Card>
    </div>
  )
}


