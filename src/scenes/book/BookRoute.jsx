import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import CarBook from './CarBook.jsx';
import RoomBook from './RoomBook.jsx';
import {Box } from "@mui/material";
import {Header} from "../../components/index.jsx";

const BookRoute = () => {
    return (
        <div>
            <Box m="20px">
                <Header title="예약"/>
                <nav>
                    <ul style={{
                        listStyle: 'none',
                        padding: 0,
                        display: 'flex',
                        gap: '20px',
                        margin: 0
                    }}>
                        <li style={{margin: 0}}>
                            <Link to="carbook" style={{
                                textDecoration: 'none',
                                fontSize: '21px',
                                color: '#000'
                            }}>
                                차량 예약
                            </Link>
                        </li>
                        <li style={{margin: 0}}>
                            <Link to="roombook" style={{
                                textDecoration: 'none',
                                fontSize: '21px',
                                color: '#000'
                            }}>
                                회의실 예약
                            </Link>
                        </li>
                    </ul>
                </nav>
            </Box>

            <Routes>
                {/* 기본 경로에서 /carbook으로 리디렉션 */}
                <Route path="/" element={<Navigate to="carbook"/>}/>
                <Route path="carbook" element={<CarBook/>}/>
                <Route path="roombook" element={<RoomBook/>}/>
            </Routes>
        </div>
    );
};

export default BookRoute;
