import { useState } from 'react'
import { Button } from 'react-bootstrap';

function App() {
  const [count, setCount] = useState(0)

  return (
  <>
  <div className="p-4">
    <Button variant='primary'>Hello</Button>
  </div>
  </>
  )
}

export default App
