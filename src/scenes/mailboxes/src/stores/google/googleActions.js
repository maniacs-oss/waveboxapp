import alt from '../alt'

class GoogleActions {
  /* **************************************************************************/
  // Pollers
  /* **************************************************************************/

  /**
  * Starts polling the server for updates on a periodic basis
  */
  startPollingUpdates () { return {} }

  /**
  * Stops polling the server for updates
  */
  stopPollingUpdates () { return {} }

  /* **************************************************************************/
  // Profiles
  /* **************************************************************************/

  /**
  * Syncs all mailbox profiles
  */
  syncAllMailboxProfiles () { return {} }

  /**
  * Syncs a mailbox profile
  * @param mailboxId: the id of the mailbox
  */
  syncMailboxProfile (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /* **************************************************************************/
  // Connection
  /* **************************************************************************/

  /**
  * Starts listening for push updates
  * @param mailboxId: the id of the mailbox
  */
  connectMailbox (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /**
  * Stops listening for push updates
  * @param mailboxId: the id of the mailbox
  */
  disconnectMailbox (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /**
  * Starts all mailbox watch calls
  */
  registerAllMailboxWatches () { return {} }

  /**
  * Registers a watch call with google
  * @param mailboxId: the id of the mailbox
  */
  registerMailboxWatch (mailboxId) {
    return { mailboxId: mailboxId }
  }

  /* **************************************************************************/
  // Notifications
  /* **************************************************************************/

  /**
  * Indicates that the mail history id has changed for a mailbox causing a resync
  * @param mailboxId: the id of the mailbox
  * @param historyId=undefined: the new history id
  */
  mailHistoryIdChanged (mailboxId, historyId = undefined) {
    return { mailboxId: mailboxId, historyId: historyId }
  }

  /**
  * Indicates that the mail count has changed for the mailbox so a resyn should be done
  * @param mailboxId: the id of the mailbox
  * @param count=undefined: the new count
  */
  mailCountChanged (mailboxId, count = undefined) {
    return { mailboxId: mailboxId, count: count }
  }

  /**
  * Syncs the mailbox messages
  * @param mailboxId: the id of the mailbox
  * @param forceSync=false: set to true to force the sync event even if the server reports no changes
  */
  syncMailboxMessages (mailboxId, forceSync = false) {
    return { mailboxId: mailboxId, forceSync: forceSync }
  }

  /**
  * Indicates that the mail history id changed from the watch vent
  * @param data: the data that came down the vent
  */
  mailHistoryIdChangedFromWatch (data) {
    // P.S. Sometimes the server doesn't send historyId - for example on re-connect
    return { email: data.emailAddress, historyId: data.historyId }
  }
}

export default alt.createActions(GoogleActions)
