import './App.css';
import { Routes, Route } from "react-router-dom";
import Header from '../src/Components/Header';
import SignUp from './Components/SignUp';
import Login from './Components/Login';

function App() {
  return (
    <>
      <Header />
      <div className="App">
        <Routes>
          <Route path="/register" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
