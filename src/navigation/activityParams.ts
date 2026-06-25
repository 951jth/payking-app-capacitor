import type { InferActivityParams, RegisteredActivityName } from '@stackflow/config'

export type ActivityName = RegisteredActivityName

export type ActivityParams = {
  [Name in ActivityName]: InferActivityParams<Name>
}
