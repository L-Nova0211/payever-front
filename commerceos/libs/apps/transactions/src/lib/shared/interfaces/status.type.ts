export type StatusType = 'STATUS_NEW' |
                         'STATUS_IN_PROCESS' |
                         'STATUS_ACCEPTED' |
                         'STATUS_PAID' |
                         'STATUS_DECLINED' |
                         'STATUS_REFUNDED' |
                         'STATUS_FAILED' |
                         'STATUS_CANCELLED';

export type StatusIconType = 'pending' | 'ok' | 'minus' | 'return' | '';

export type SantanderAppSpecificStateType =
  'STATUS_SANTANDER_IN_PROGRESS' | // Santander application state 0
  'STATUS_SANTANDER_IN_PROCESS' | // Santander application state 1
  'STATUS_SANTANDER_DECLINED' | // Santander application state 2
  'STATUS_SANTANDER_APPROVED' | // Santander application state 3
  'STATUS_SANTANDER_APPROVED_WITH_REQUIREMENTS' | // Santander application state 4
  'STATUS_SANTANDER_DEFERRED' | // Santander application state 5
  'STATUS_SANTANDER_CANCELLED' | // Santander application state 6
  'STATUS_SANTANDER_AUTOMATIC_DECLINE' | // Santander application state 7
  'STATUS_SANTANDER_IN_DECISION' | // Santander application state 8
  'STATUS_SANTANDER_DECISION_NEXT_WORKING_DAY' | // Santander application state 9
  'STATUS_SANTANDER_IN_CANCELLATION' | // Santander application state 10
  'STATUS_SANTANDER_ACCOUNT_OPENED' | // Santander application state 11
  'STATUS_SANTANDER_CANCELLED_ANOTHER' | // Santander application state 12
  'STATUS_SANTANDER_SHOP_TEMPORARY_APPROVED' | // Santander application state 13
  'STATUS_SANTANDER_COMFORT_CARD_ISSUED' | // Santander application state 14
  'IN_ENTSCHEIDUNG' |
  'GENEHMIGT'
