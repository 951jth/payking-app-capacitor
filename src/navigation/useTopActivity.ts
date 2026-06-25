import { useStack } from '@stackflow/react'

export function useTopActivity() {
  const { activities } = useStack()

  return activities.find((activity) => activity.isTop)
}
