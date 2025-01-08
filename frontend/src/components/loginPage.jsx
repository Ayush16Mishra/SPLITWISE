// loginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/LoginPage.css";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Login successful!');
        // Save the token in localStorage
        localStorage.setItem('token', data.token);
        // Redirect to the next page or dashboard
        navigate('/dashboard');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div className='loginPageContainer'>
      <div className='loginForm'>
        <h1>Welcome</h1>
        <div className='loginText'>
          <h3>Today is a new day. It's your day. You shape it.</h3>
          <h3>Log in to start managing your projects.</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='loginEmail'>
            <label>Email</label>
            <input
              type='email'
              name='email'
              placeholder='Email'
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className='loginPassword'>
            <label>Password</label>
            <input
              type='password'
              name='password'
              placeholder='Password'
              value={formData.password}
              onChange={handleChange}
              required
            />
            
          </div>
          <div className='loginButtons'>
            <button type='submit'>Login</button>
          </div>
        </form>
        <p>Don't have an account? <a href="/signup">Sign Up</a></p>
      </div>
      <div className='loginImage'></div>
    </div>
  );
}

export default LoginPage;
