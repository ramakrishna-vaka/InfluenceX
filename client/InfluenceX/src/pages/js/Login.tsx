import { useState } from 'react';
import './../css/Login.css';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../AuthProvider';
import GoogleButton from '../../components/js/GoogleButton';

function Login() {

    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigate= useNavigate();
    const {login,setAuthUser} = useAuth();

    const handleLogin=async (e:any)=>{
        e.preventDefault();
        try{
            const response=await fetch('http://localhost:8080/login',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({email,password}),
                credentials: 'include', // as we are sending cookies authentication
            });
            if(response.ok){
              //login successful, now fetch user info from /whoAmI
                alert("Login Successful");
                const userResponse = await fetch('http://localhost:8080/whoAmI', {
                method: 'GET',
                credentials: 'include', 
                });
              const data=await userResponse.json();
                if(userResponse.ok){
                    setAuthUser({id:data.id,name:data.name,email:data.email});
                    login();
                    navigate("/"); 
                }else{
                  alert("Could not fetch user info after login");
                }
            }else{
                alert('error');
            }
        }catch(err){
            console.log(err);
        }
    }


  return ( <>
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h3 className="login-title">Login</h3>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-button">Login</button>

        <div style={{ marginTop: "13px", textAlign: "center" }}>OR</div>

        <GoogleButton />
      </form>
    </div>
    <div >  
      Not have an account? <Link to="/register">Register</Link>
    </div>
    </>
  );
}

export default Login;