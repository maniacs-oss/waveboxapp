import { Menu, globalShortcut, app, BrowserWindow } from 'electron'
import { mailboxStore } from 'stores/mailbox'
import { settingsStore } from 'stores/settings'
import MenuTool from 'shared/Electron/MenuTool'
import { evtMain } from 'AppEvents'
import { toKeyEvent } from 'keyboardevent-from-electron-accelerator'
import WaveboxAppPrimaryMenuActions from './WaveboxAppPrimaryMenuActions'

class WaveboxAppPrimaryMenu {
  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  constructor () {
    this._lastAccelerators = null
    this._lastMailboxes = null
    this._lastActiveMailbox = null
    this._lastActiveServiceType = null
    this._lastMenu = null
    this._hiddenShortcuts = new Map()

    mailboxStore.listen(this.handleMailboxesChanged)
    settingsStore.listen(this.handleAcceleratorsChanged)
    evtMain.on(evtMain.INPUT_EVENT_PREVENTED, this.handleInputEventPrevented)
    app.on('browser-window-focus', this.bindHiddenShortcuts)
    app.on('browser-window-blur', this.unbindHiddenShortcuts)
  }

  /* ****************************************************************************/
  // Creating
  /* ****************************************************************************/

  /**
  * Builds the menu
  * @param accelerators: the accelerators to use
  * @param mailboxes: the list of mailboxes
  * @param activeMailbox: the active mailbox
  * @param activeServiceType: the type of the active service
  * @return the new menu
  */
  build (accelerators, mailboxes, activeMailbox, activeServiceType) {
    // Fixes https://github.com/wavebox/waveboxapp/issues/562
    const tlpfx = process.platform === 'linux' ? '&' : ''

    return Menu.buildFromTemplate([
      {
        label: process.platform === 'darwin' ? `${tlpfx}Application` : `${tlpfx}File`,
        submenu: [
          {
            label: 'About',
            click: WaveboxAppPrimaryMenuActions.aboutDialog
          },
          {
            label: 'Check for Update',
            click: WaveboxAppPrimaryMenuActions.checkForUpdate
          },
          { type: 'separator' },
          {
            label: 'Add Account',
            click: WaveboxAppPrimaryMenuActions.addAccount
          },
          {
            label: 'Preferences',
            click: WaveboxAppPrimaryMenuActions.preferences,
            accelerator: accelerators.preferences
          },
          { type: 'separator' },
          {
            label: 'Compose Mail',
            click: WaveboxAppPrimaryMenuActions.composeMail,
            accelerator: accelerators.composeMail
          },
          { type: 'separator' },
          process.platform === 'darwin' ? { label: 'Services', role: 'services', submenu: [] } : undefined,
          process.platform === 'darwin' ? { type: 'separator' } : undefined,
          {
            label: 'Close Window',
            click: WaveboxAppPrimaryMenuActions.closeWindow,
            accelerator: accelerators.closeWindow
          },
          process.platform === 'darwin' ? {
            label: 'Hide Wavebox',
            role: 'hide',
            accelerator: accelerators.hide
          } : {
            label: 'Hide Window',
            click: WaveboxAppPrimaryMenuActions.hideAll,
            accelerator: accelerators.hide
          },
          process.platform === 'darwin' ? {
            label: 'Hide Others',
            role: 'hideothers',
            accelerator: accelerators.hideOthers
          } : undefined,
          process.platform === 'darwin' ? {
            label: 'Show All',
            role: 'unhide'
          } : {
            label: 'Show All',
            click: WaveboxAppPrimaryMenuActions.showAll
          },
          { type: 'separator' },
          {
            label: 'Quit',
            click: WaveboxAppPrimaryMenuActions.fullQuit,
            accelerator: accelerators.quit
          }
        ].filter((item) => item !== undefined)
      },
      {
        label: `${tlpfx}Edit`,
        submenu: [
          {
            label: 'Undo',
            role: 'undo',
            accelerator: accelerators.undo
          },
          {
            label: 'Redo',
            role: 'redo',
            accelerator: accelerators.redo
          },
          { type: 'separator' },
          {
            label: 'Cut',
            role: 'cut',
            accelerator: accelerators.cut
          },
          {
            label: 'Copy',
            role: 'copy',
            accelerator: accelerators.copy
          },
          {
            label: 'Paste',
            role: 'paste',
            accelerator: accelerators.paste
          },
          {
            label: 'Paste and match style',
            role: 'pasteandmatchstyle',
            accelerator: accelerators.pasteAndMatchStyle
          },
          {
            label: 'Select All',
            role: 'selectall',
            accelerator: accelerators.selectAll
          },
          { type: 'separator' },
          {
            label: 'Copy Current Tab URL',
            click: WaveboxAppPrimaryMenuActions.copyCurrentTabUrl,
            accelerator: accelerators.copyCurrentTabUrl
          },
          { type: 'separator' },
          {
            label: 'Find',
            click: WaveboxAppPrimaryMenuActions.find,
            accelerator: accelerators.find
          },
          {
            label: 'Find Next',
            click: WaveboxAppPrimaryMenuActions.findNext,
            accelerator: accelerators.findNext
          }
        ]
      },
      {
        label: `${tlpfx}View`,
        submenu: [
          {
            label: 'Toggle Full Screen',
            click: WaveboxAppPrimaryMenuActions.fullscreenToggle,
            accelerator: accelerators.toggleFullscreen
          },
          {
            label: 'Toggle Sidebar',
            click: WaveboxAppPrimaryMenuActions.sidebarToggle,
            accelerator: accelerators.toggleSidebar
          },
          process.platform === 'darwin' ? undefined : {
            label: 'Toggle Menu',
            click: WaveboxAppPrimaryMenuActions.menuToggle,
            accelerator: accelerators.toggleMenu
          },
          { type: 'separator' },
          {
            label: 'Navigate Back',
            click: WaveboxAppPrimaryMenuActions.mailboxNavBack,
            accelerator: accelerators.navigateBack
          },
          {
            label: 'Navigate Forward',
            click: WaveboxAppPrimaryMenuActions.mailboxNavForward,
            accelerator: accelerators.navigateForward
          },
          { type: 'separator' },
          {
            label: 'Zoom In',
            click: WaveboxAppPrimaryMenuActions.zoomIn,
            accelerator: accelerators.zoomIn
          },
          {
            label: 'Zoom Out',
            click: WaveboxAppPrimaryMenuActions.zoomOut,
            accelerator: accelerators.zoomOut
          },
          {
            label: 'Reset Zoom',
            click: WaveboxAppPrimaryMenuActions.zoomReset,
            accelerator: accelerators.zoomReset
          },
          { type: 'separator' },
          {
            label: 'Reload',
            click: WaveboxAppPrimaryMenuActions.reload,
            accelerator: accelerators.reload
          },
          {
            label: 'Developer',
            submenu: [
              {
                label: 'Developer Tools',
                click: WaveboxAppPrimaryMenuActions.devTools,
                accelerator: accelerators.developerTools
              },
              { type: 'separator' },
              {
                label: 'Reload Wavebox Window',
                click: WaveboxAppPrimaryMenuActions.reloadWavebox,
                accelerator: accelerators.reloadWavebox
              },
              {
                label: 'Wavebox Developer Tools',
                click: WaveboxAppPrimaryMenuActions.devToolsWavebox,
                accelerator: accelerators.developerToolsWavebox
              }
            ]
          }
        ].filter((item) => item !== undefined)
      },
      {
        label: `${tlpfx}Accounts`,
        submenu: [

        ].concat(mailboxes.length <= 1 ? [] : [
          { type: 'separator' },
          {
            label: 'Previous Account',
            click: WaveboxAppPrimaryMenuActions.prevMailbox,
            accelerator: accelerators.previousMailbox
          },
          {
            label: 'Next Account',
            click: WaveboxAppPrimaryMenuActions.nextMailbox,
            accelerator: accelerators.nextMailbox
          }
        ]).concat(mailboxes.length <= 1 ? [] : [
          { type: 'separator' }
        ]).concat(mailboxes.length <= 1 ? [] : mailboxes.map((mailbox, index) => {
          return {
            label: mailbox.displayName || 'Untitled',
            type: 'radio',
            checked: mailbox.id === (activeMailbox || {}).id,
            click: () => { WaveboxAppPrimaryMenuActions.changeMailbox(mailbox.id) },
            accelerator: this.buildAcceleratorStringForIndex(accelerators.mailboxIndex, index)
          }
        })).concat(activeMailbox && activeMailbox.hasAdditionalServices ? [
          { type: 'separator' },
          {
            label: 'Previous Service',
            click: WaveboxAppPrimaryMenuActions.prevService,
            accelerator: accelerators.servicePrevious
          },
          {
            label: 'Next Service',
            click: WaveboxAppPrimaryMenuActions.nextService,
            accelerator: accelerators.serviceNext
          }
        ] : []).concat(activeMailbox && activeMailbox.hasAdditionalServices ? [
          { type: 'separator' }
        ] : []).concat(activeMailbox && activeMailbox.hasAdditionalServices ? activeMailbox.enabledServices.map((service, index) => {
          return {
            label: service.humanizedType,
            type: 'radio',
            checked: service.type === activeServiceType,
            click: () => { WaveboxAppPrimaryMenuActions.changeMailbox(activeMailbox.id, service.type) },
            accelerator: this.buildAcceleratorStringForIndex(accelerators.serviceIndex, index)
          }
        }) : [])
      },
      {
        label: `${tlpfx}Window`,
        role: 'window',
        submenu: [
          {
            label: 'Minimize',
            role: 'minimize',
            accelerator: accelerators.minimize
          },
          {
            label: 'Cycle Windows',
            click: WaveboxAppPrimaryMenuActions.cycleWindows,
            accelerator: accelerators.cycleWindows
          },
          {
            label: 'Toggle Wavebox Mini',
            click: WaveboxAppPrimaryMenuActions.toggleWaveboxMini,
            accelerator: accelerators.toggleWaveboxMini
          }
        ].concat(mailboxes.length > 1 || (activeMailbox && activeMailbox.hasAdditionalServices) ? [
          { type: 'separator' },
          {
            label: 'Previous Tab',
            click: WaveboxAppPrimaryMenuActions.prevMailboxTab,
            accelerator: accelerators.prevTab
          },
          {
            label: 'Next Tab',
            click: WaveboxAppPrimaryMenuActions.nextMailboxTab,
            accelerator: accelerators.nextTab
          }
        ] : [])
      },
      {
        label: `${tlpfx}Help`,
        role: 'help',
        submenu: [
          { label: 'Wavebox Website', click: WaveboxAppPrimaryMenuActions.waveboxWebsite },
          { label: 'Wavebox Blog', click: WaveboxAppPrimaryMenuActions.waveboxBlog },
          { label: 'Wavebox on GitHub', click: WaveboxAppPrimaryMenuActions.waveboxGithub },
          { type: 'separator' },
          { label: 'Support Center', click: WaveboxAppPrimaryMenuActions.supportCenter },
          { label: 'What\'s new', click: WaveboxAppPrimaryMenuActions.whatsNew },
          { type: 'separator' },
          { label: 'Privacy', click: WaveboxAppPrimaryMenuActions.privacy },
          { label: 'EULA', click: WaveboxAppPrimaryMenuActions.eula }
        ]
      }
    ])
  }

  /**
  * Builds an accelerator string from a descriptor but with a rolling index value
  * @param accelerator: the accelerator descriptor to use
  * @param index: the index of the item to use in an array. This will be +1'ed and top & tailed
  * @return a string that can be used with electron
  */
  buildAcceleratorStringForIndex (accelerator, index) {
    if (index < 0 || index >= 9) {
      return undefined
    } else {
      return (accelerator || '').replace('Number', index + 1)
    }
  }

  /**
  * Builds and applies the mailboxes menu
  * @param accelerators: the accelerators to use
  * @param mailboxes: the current list of mailboxes
  * @param activeMailbox: the active mailbox
  * @param activeServiceType: the type of active service
  */
  updateApplicationMenu (accelerators, mailboxes, activeMailbox, activeServiceType) {
    this._lastAccelerators = accelerators
    this._lastActiveMailbox = activeMailbox
    this._lastActiveServiceType = activeServiceType
    this._lastMailboxes = mailboxes

    const lastMenu = this._lastMenu
    this._lastMenu = this.build(accelerators, mailboxes, activeMailbox, activeServiceType)
    Menu.setApplicationMenu(this._lastMenu)
    this.updateHiddenShortcuts(accelerators)

    // Prevent Memory leak
    if (lastMenu) {
      MenuTool.fullDestroyMenu(lastMenu)
    }
  }

  /* ****************************************************************************/
  // Hidden shortcuts
  /* ****************************************************************************/

  /**
  * Binds the current set of hidden shortcuts
  */
  bindHiddenShortcuts = () => {
    Array.from(this._hiddenShortcuts.keys()).forEach((shortcut) => {
      try {
        globalShortcut.register(shortcut, this._hiddenShortcuts.get(shortcut))
      } catch (ex) { }
    })
  }

  /**
  * Unbinds the current set of hidden shortcuts
  */
  unbindHiddenShortcuts = () => {
    Array.from(this._hiddenShortcuts.keys()).forEach((shortcut) => {
      try {
        globalShortcut.unregister(shortcut)
      } catch (ex) { }
    })
  }

  /**
  * Updates the hidden shortcuts
  * @param accelerators: the accelerators to use
  */
  updateHiddenShortcuts (accelerators) {
    const hiddenZoomInShortcut = process.platform === 'darwin' ? 'Cmd+=' : 'Ctrl+='
    if (accelerators.zoomIn === accelerators.zoomInDefault) {
      if (!this._hiddenShortcuts.has(hiddenZoomInShortcut)) {
        this._hiddenShortcuts.set(hiddenZoomInShortcut, () => WaveboxAppPrimaryMenuActions.zoomIn())
        if (BrowserWindow.getFocusedWindow()) {
          try {
            globalShortcut.register(hiddenZoomInShortcut, this._hiddenShortcuts.get(hiddenZoomInShortcut))
          } catch (ex) { }
        }
      }
    } else {
      if (this._hiddenShortcuts.has(hiddenZoomInShortcut)) {
        this._hiddenShortcuts.delete(hiddenZoomInShortcut)
        if (BrowserWindow.getFocusedWindow()) {
          try {
            globalShortcut.unregister(hiddenZoomInShortcut)
          } catch (ex) { }
        }
      }
    }
  }

  /* ****************************************************************************/
  // Change events
  /* ****************************************************************************/

  /**
  * Handles the mailboxes changing
  * @param mailboxState: the latest mailbox state
  */
  handleMailboxesChanged = (mailboxState) => {
    const activeMailbox = mailboxState.activeMailbox()
    const activeServiceType = mailboxState.activeMailboxService()
    const mailboxes = mailboxState.allMailboxes()

    // Munge our states for easier comparison
    const props = [
      [(this._lastActiveMailbox || {}).id, (activeMailbox || {}).id],
      [this._lastActiveServiceType, activeServiceType],
      [
        (this._lastMailboxes || []).map((m) => m.displayName + ';' + m.enabledServiceTypes.join(';')).join('|'),
        mailboxes.map((m) => m.displayName + ';' + m.enabledServiceTypes.join(';')).join('|')
      ]
    ]

    // Check for change
    const changed = props.findIndex(([prev, next]) => prev !== next) !== -1
    if (changed) {
      this.updateApplicationMenu(this._lastAccelerators, mailboxes, activeMailbox, activeServiceType)
    }
  }

  /**
  * Handles the accelerators changing. If these change it will definately have a reflection in the
  * menu, so just update immediately
  * @param settingsState: the latest settings state
  */
  handleAcceleratorsChanged = (settingsState) => {
    if (settingsState.accelerators !== this._lastAccelerators) {
      this.updateApplicationMenu(
        settingsState.accelerators,
        this._lastMailboxes,
        this._lastActiveMailbox,
        this._lastActiveServiceType
      )
    }
  }

  /* ****************************************************************************/
  // Input events
  /* ****************************************************************************/

  /**
  * Converts an accelerator to an input key event, removing any quirks
  * @param accelerator: the accelertor
  * @return the input event that can be matched
  */
  _acceleratorToInputKeyEvent (accelerator) {
    const keyEvent = toKeyEvent(accelerator)

    if (!isNaN(parseInt(keyEvent.key))) {
      keyEvent.code = 'Digit' + keyEvent.key
      delete keyEvent.key
    }

    if (keyEvent.metaKey !== undefined) {
      keyEvent.meta = keyEvent.metaKey
      delete keyEvent.metaKey
    }
    if (keyEvent.ctrlKey !== undefined) {
      keyEvent.control = keyEvent.ctrlKey
      delete keyEvent.ctrlKey
    }
    if (keyEvent.shiftKey !== undefined) {
      keyEvent.shift = keyEvent.shiftKey
      delete keyEvent.shiftKey
    }

    return keyEvent
  }

  /**
  * Looks to see if an input event matches an accelerator
  * @param input: the input event
  * @param accelerator: the accelerator
  * @return true if they match
  */
  _matchInputEventToAccelerator (input, accelerator) {
    if (!accelerator) { return false }

    let expanded
    if (accelerator.toLowerCase().indexOf('number') !== -1) {
      expanded = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => {
        accelerator.replace(/number/i, n)
      })
    } else {
      expanded = [accelerator]
    }

    const match = expanded.find((accel) => {
      try {
        const targetKeyEvent = this._acceleratorToInputKeyEvent(accel)
        if (!isNaN(parseInt(targetKeyEvent.key))) {
          targetKeyEvent.code = 'Digit' + targetKeyEvent.key
          delete targetKeyEvent.key
        }
        for (var k in targetKeyEvent) {
          if (input[k] !== targetKeyEvent[k]) {
            return false
          }
        }
        return true
      } catch (ex) {
        return false
      }
    })
    return !!match
  }

  /**
  * Handles an input event being prevented
  * @param evt: the event that fired
  * @param webContentsId: the id of the webcontents that the event was prevented on
  * @param input: the input params that were prevented
  */
  handleInputEventPrevented = (evt, webContentsId, input) => {
    if (input.type !== 'keyDown') { return }
    if (!this._lastMenu) { return }

    const matchedMenu = MenuTool.allAcceleratorMenuItems(this._lastMenu)
      .find((menuItem) => this._matchInputEventToAccelerator(input, menuItem.accelerator))

    if (matchedMenu && matchedMenu.click) {
      matchedMenu.click()
    }
  }
}

export default WaveboxAppPrimaryMenu
