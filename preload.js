const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  getDesktopFiles: async () => {
    try {
      const apps = await ipcRenderer.invoke('getDesktopFiles')
      return apps
    } catch (error) {
      console.error('Error getting desktop files:', error)
      return []
    }
  },
  launchDesktopFile: async (file) => {
    try {
      const result = await ipcRenderer.invoke('launchDesktopFile', file)
      return result
    } catch (error) {
      console.error('Error launching desktop file:', error)
      return null
    }
  },
  getBluetoothDevices: async () => {
    try {
      const devices = await ipcRenderer.invoke('getBluetoothDevices')
      return devices
    } catch (error) {
      console.error('Error getting bluetooth devices:', error)
      return []
    }
  },
  connectBluetoothDevice: async (address) => {
    try {
      const result = await ipcRenderer.invoke('connectBluetoothDevice', address)
      return result
    } catch (error) {
      console.error('Error connecting bluetooth device:', error)
      return null
    }
  },
  getWifiNetworks: async () => {
    try {
      const networks = await ipcRenderer.invoke('getWifiNetworks')
      return networks
    } catch (error) {
      console.error('Error getting wifi networks:', error)
      return []
    }
  },
  showLimelight: () => { ipcRenderer.send('showLimelight') },
  closeWindow: () => {
    ipcRenderer.send('close-window')
  },
  getSystemInfo: async () => {
    try {
      const info = await ipcRenderer.invoke('getSystemInfo')
      return info
    } catch (error) {
      console.error('Error getting system info:', error)
      return null
    }
  },
  hideWindow: () => {
    ipcRenderer.send('hide-window')
  }
})