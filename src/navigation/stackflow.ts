import { stackflow } from '@stackflow/react'
import { activityComponents } from './activityRegistry'
import { paykingRendererPlugin } from './paykingRendererPlugin'
import { stackflowConfig } from './stackflow.config'

export const { Stack, actions } = stackflow({
  config: stackflowConfig,
  components: activityComponents,
  plugins: [paykingRendererPlugin()],
})
