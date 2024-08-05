import React from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import App from "./App";
import {
    Dashboard,
    Book,
    Calendar,
    Send,
    Board,
    Hr,
    Mypage
} from "./scenes";
import Write from "./scenes/write/index.jsx";
import List from "./scenes/list/index.jsx";

const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App/>}>
                    <Route path="/" element={<Dashboard/>}/>
                    <Route path="/write" element={<Write/>}/>
                    <Route path="/list" element={<List/>}/>
                    <Route path="/send" element={<Send/>}/>
                    <Route path="/calendar" element={<Calendar/>}/>
                    <Route path="/board" element={<Board/>}/>
                    <Route path="/book/*" element={<Book/>}/>
                    <Route path="/hr" element={<Hr/>}/>
                    <Route path="/mypage" element={<Mypage/>}/>
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRouter;
