import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/Login.css';
import { FaUser } from "react-icons/fa";
import { TbEyeClosed, TbEyeUp } from "react-icons/tb";
import { jwtDecode } from 'jwt-decode'; // Use named import
import logo from '../assets/loge_new 2.png'; // Make sure you adjust the path to your logo

    const Login = () => {
        const navigate = useNavigate();
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [showPassword, setShowPassword] = useState(false);
        const [errorMessage, setErrorMessage] = useState('');
      
        const handleLogin = async (e) => {
          e.preventDefault();
          setErrorMessage('');
      
          try {
            const { data, headers } = await axios.post('http://localhost:8080/user/login', { username, password });
      
            // Extract token from 'authorization' header
            const authHeader = headers['authorization'];
            const token = authHeader?.split(' ')[1]; // Get the token part from 'Bearer <token>'
      
            if (!token) throw new Error('Invalid token received.');
      
            const decodedToken = jwtDecode(token);
            const { authorities, exp } = decodedToken;
      
            // Save token and user details to localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('exp', exp);
            localStorage.setItem('tokenDecoded', JSON.stringify(decodedToken));
      
            // Role-based navigation
            const role = authorities.find((role) =>
              ['ROLE_ROLE_MISSTAFF', 'ROLE_ROLE_ADMIN'].includes(role)
            );
      
            if (role) {
              localStorage.setItem('role', role);
              if (role === 'ROLE_ROLE_MISSTAFF') {
                localStorage.setItem('userId', data.userId);
                navigate('/staff/tickets');
              } else if (role === 'ROLE_ROLE_ADMIN') {
                navigate('/admin/board');
              }
            } else {
              setErrorMessage('Unauthorized role.');
              navigate('/login');
            }
          } catch (error) {
            console.error('Error:', error.message);
            const errorMsg = error.response?.data?.message || 'An error occurred while processing your request.';
            setErrorMessage(errorMsg);
          }
    };
    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        
        <div className="body">  
            <div className="logo-container">
                <img src={logo} alt="Logo" style={{ width: '200px', height: 'auto' }} />
            </div>
            <div className="form-box-login">
                <form onSubmit={handleLogin} className="form-container-login">
                    <div className="header">
                        <h1>Login</h1>
                    </div>

                    <div className="field-box">
                        <label>Username</label>
                        <div className="insert">
                            <input 
                                type="text" 
                                required 
                                onChange={(e) => setUsername(e.target.value)} 
                            />
                            <FaUser className="icon" />
                        </div>
                    </div>

                    <div className="field-box field-box-password">
                        <label>Password</label>
                        <div className="insert">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                            {showPassword ? (
                                <TbEyeUp className="icon" onClick={togglePasswordVisibility} />
                            ) : (
                                <TbEyeClosed className="icon" onClick={togglePasswordVisibility} />
                            )}
                        </div>
                        
                        <div className="forgot-password-link">
                            <a href="account/forgot-password">Forgot password?</a>
                        </div>    
                    </div>

                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                    <button type="submit" className="login">Login</button>

                    <div className="register-link">
                        <p className="noAcc">Don't have an Account?<a className="click" href="account/create">Click here</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
