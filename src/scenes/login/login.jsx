import React, { useEffect } from 'react';
import useStore from '../../store';
import './login.css'; // CSS 파일 임포트
import { useNavigate } from "react-router-dom";

const Login = () => {
    const { id, passwd, isLogined, setId, setPasswd, login , error} = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (isLogined) {
            navigate('/'); // 로그인 성공 시 홈 화면으로 이동
        }
    }, [isLogined, navigate]);



    const handleSubmit = (e) => {
        e.preventDefault();
        login(); // 로그인만 처리
    };

    return (
        <div id="login-wrapper">
            <div id="login-container">
                <img src="src/assets/images/logo.png" alt="Group Bee Logo" id="logo-image"/>
                <form id="login-form" onSubmit={handleSubmit}>
                <div>
                        <label>ID : </label>
                        <input
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Password : </label>
                        <input
                            type="password"
                            value={passwd}
                            onChange={(e) => setPasswd(e.target.value)}
                        />
                    </div>
                    {error && <p style={{ color: '#ff2c2c' }}>{error}</p>}
                    <button type="submit">Login</button>
                </form>
            </div>

            <ul id="bg-bubbles">
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </div>
    );
};

export default Login;
