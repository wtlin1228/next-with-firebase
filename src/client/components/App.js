// src/app/components/App.js
import Header from "./Header"

const App = ({ children }) =>
  <main>
    <Header />
    {children}
  </main>

export default App