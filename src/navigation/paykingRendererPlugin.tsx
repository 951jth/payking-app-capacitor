import type { StackflowReactPlugin } from '@stackflow/react'
import { AuthRouteGuard } from './AuthRouteGuard'

export function paykingRendererPlugin(): StackflowReactPlugin {
  return () => ({
    key: 'payking-renderer',
    render({ stack }) {
      const activities = stack
        .render()
        .activities.filter((activity) => activity.transitionState !== 'exit-done')

      return (
        <div className="pk-stack">
          <AuthRouteGuard
            topActivityName={activities.find((activity) => activity.isTop)?.name}
          />
          {activities.map((activity, index) => (
            <div
              className="pk-activity"
              data-active={activity.isActive}
              data-root={activity.isRoot}
              data-top={activity.isTop}
              data-transition={activity.transitionState}
              key={activity.key}
              style={{ zIndex: index + 1 }}
            >
              {activity.render()}
            </div>
          ))}
        </div>
      )
    },
  })
}
