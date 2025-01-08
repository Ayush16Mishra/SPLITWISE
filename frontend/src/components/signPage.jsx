import React, { useState } from 'react';
import "../styles/signPage.css";

function SignPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Signup successful!');
        // Redirect to login page or clear form
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div className='parent'>
      <div className='leftChild'>
        <h1>Welcome</h1>
        <div className='text'>
          <h3>Sign in to start managing your projects.</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='name'>
            <label>Name</label>
            <input
              type='text'
              name='name'
              placeholder='Full Name'
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className='email'>
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
          <div className='username'>
            <label>Username</label>
            <input
              type='text'
              name='username'
              placeholder='Username'
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className='password'>
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
          <div className='confirmpassword'>
            <label>Confirm Password</label>
            <input
              type='password'
              name='confirmPassword'
              placeholder='Confirm Password'
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className='buttons'>
            <button type='submit'>Sign Up</button>
          </div>
        </form>
        <p>Already have an account? <a href="/">Log in</a></p>
      </div>
    </div>
  );
}

export default SignPage;
