import React from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import App from "./App";
import {
    Dashboard,
    Book,
    Calendar,
    Send,
    WriteForm,
    Board,
    Hr,
    Mypage
} from "./scenes";

import List from "./scenes/list/index.jsx";
import Detail from "./scenes/list/Detail.jsx";
import EmailMain from "./scenes/email/index.jsx";
import BoardWrite from "./scenes/board/BoardWrite.jsx";
import Login from "./scenes/login/login.jsx";
import ProtectedRoute from './ProtectedRoute';
import DetailPage from "./scenes/board/DetailPage.jsx";
import Admin from "./scenes/admin/index.jsx";
import UpdatePage from "./scenes/board/UpdatePage.jsx";
import CommuteList from "./scenes/Commute/CommuteList.jsx";
import Video from "./scenes/openvidu/VideoConference.jsx";
import Chat from "./scenes/chat/Chat.jsx"
import EmailList from "./scenes/email/emailList.jsx";

import EmailDetailPage from './scenes/email/EmailDetailPage';


const AppRouter = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login/>}/>

                <Route path="/" element={<ProtectedRoute element={<App />} />}>
                    <Route path="/" element={<Dashboard/>}/>
                    <Route path="/write" element={<WriteForm/>}/>
                    <Route path="/write/:appId" element={<WriteForm />} />
                    <Route path="/list" element={<List/>}/>
                    <Route path="/send" element={<Send/>}/>
                    <Route path="/calendar" element={<Calendar/>}/>
                    <Route path="/board" element={<Board/>}>
                        <Route path="/board/:Page" element={<Board/>}/>
                    </Route>
                    <Route path="/board/write" element={<BoardWrite/>}/>
                    <Route path="/board/list/:id/:currentPage" element={<DetailPage/>}/>
                    <Route path="/board/update/:id" element={<UpdatePage/>}/>
                    <Route path="/book/*" element={<Book/>}/>
                    <Route path="/hr" element={<Hr/>}/>
                    <Route path="/mypage" element={<Mypage/>}/>
                    <Route path="/detail" element={<Detail/>}/>
                    <Route path="/email" element={<EmailMain/>}/>
                    <Route path="/email/list" element={<EmailList />} />
                    <Route path="/email/:id" element={<EmailDetailPage />} />
                    <Route path="/admin/*" element={<Admin/>}/>
                    <Route path="/commutelist" element={<CommuteList/>}/>
                    <Route path="/video" element={<Video/>}/>
                    <Route path="/chat" element={<Chat/>}/>
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRouter;
