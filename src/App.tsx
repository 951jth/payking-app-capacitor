import { AppProviders } from './app/AppProviders'
import { Stack } from './navigation/stackflow'
import './App.css'

function App() {
  return (
    <AppProviders>
      <Stack />
    </AppProviders>
  )
}

export default App
