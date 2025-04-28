import './App.css';
import { Routes, Route } from "react-router-dom";
import Header from '../src/Components/Header';
import SignUp from './Components/SignUp';

function App() {
  return (
    <>
      <Header />
      <div className="App">
        <Routes>
          <Route path="/register" element={<SignUp />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
