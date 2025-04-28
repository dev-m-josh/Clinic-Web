import './App.css';
import { Routes, Route } from "react-router-dom";
import Header from '../src/Components/Header';
import SignUp from './Components/SignUp';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import Account from './Components/Account';

function App() {
  return (
    <>
      <Header />
      <div className="App">
        <Routes>
          <Route path="/register" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path='/' element={<Dashboard />} />
          <Route path='/account' element={<Account />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
