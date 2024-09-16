import {useEffect, useState, useRef} from 'react';
import Stomp from 'stompjs';
import './ChatRoomContainer.css';
import axios from 'axios';
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import error from "eslint-plugin-react/lib/util/error.js";

const ChatRoomContainer = ({profile, activeRoom, onClose, userId, name, chatRoomId, topic, formatDate,updateChatRoomList}) => {
    const [messages, setMessages] = useState([]);  // 모든 메시지를 저장할 배열
    const [inputMessage, setInputMessage] = useState('');  // 입력된 메시지 상태
    const [isConnected, setIsConnected] = useState(false); // WebSocket 연결 상태 확인
    const [unreadCount, setUnreadCount] = useState(0); // 읽지 않은 메시지 카운트 추가
    const [isChatOpen, setIsChatOpen] = useState(true); // 채팅창 열림 상태 추가
    const stompClientRef = useRef(null); // stompClient를 useRef로 관리
    const [messageTopic, setMessageTopic] = useState('');

    const chatBodyRef = useRef(null); // 채팅 메시지를 담는 div를 참조하는 ref

    let subscriptionUrl = '';

    // 창이 활성화되었을 때 WebSocket 연결
    useEffect(() => {
        const handleFocus = () => {
            setIsChatOpen(true);
            setUnreadCount(0); // 채팅창 열리면 읽지 않은 메시지 초기화
            sendReadReceipt();  // 읽었음을 서버에 알림
            console.log("채팅창 열림");
        };

        const handleBlur = () => {
            setIsChatOpen(false);
            console.log("채팅창 닫힘");
        };

        window.addEventListener('focus', handleFocus);
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('blur', handleBlur);
        };
    }, []);

    // 메시지를 읽었음을 서버에 알리는 함수
    const sendReadReceipt = () => {
        const stompClient = stompClientRef.current;
        if (stompClient && chatRoomId) {
            stompClient.send(`/app/chat/${chatRoomId}/read`, {}, JSON.stringify({ userId }));
        }
    };

    // 프로필을 표시할 조건
    const showProfile = (allMessages, index) => {
        if (index === 0) {
            return true; // 첫 번째 메시지는 항상 프로필 표시
        }

        const currentMsg = allMessages[index];
        const prevMsg = allMessages[index - 1];

        // 이전 메시지와 발신자가 다르거나 1분 이상의 차이가 나면 프로필 표시
        return (
            currentMsg.senderId !== prevMsg.senderId ||
            new Date(currentMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) !==
            new Date(prevMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        );
    };

    const renderParticipants = (participants) => {
        const names = participants.map((p) => p.name);
        if (names.length > 5) {
            return `${names.slice(0, 5).join(', ')}...`;  // 5명까지 표시하고 나머지는 "..."
        }
        return names.join(', ');  // 참가자들을 쉼표로 구분하여 표시
    };


    // 타임스탬프를 표시할 조건
    const shouldShowTimestamp = (allMessages, index) => {
        if (index === allMessages.length - 1) {
            return true; // 마지막 메시지는 항상 타임스탬프 표시
        }

        const currentMsg = allMessages[index];
        const nextMsg = allMessages[index + 1];

        // 다음 메시지가 같은 사람이거나 1분 이내에 보내지 않은 경우 타임스탬프 표시
        return (
            currentMsg.senderId !== nextMsg.senderId ||
            new Date(currentMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) !==
            new Date(nextMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        );
    };

    // 이름을 표시할 조건
    const showName = (allMessages, index) => {
        if (index === 0) {
            return true; // 첫 번째 메시지는 항상 이름 표시
        }

        const currentMsg = allMessages[index];
        const prevMsg = allMessages[index - 1];

        // 이전 메시지와 발신자가 다르거나 1분 이상의 차이가 나면 이름 표시
        return (
            currentMsg.senderId !== prevMsg.senderId ||
            new Date(currentMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) !==
            new Date(prevMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
        );
    };


    // WebSocket 연결 함수
    const connectWebSocket = () => {
        if (!userId || !chatRoomId) {
            console.error("User ID 또는 ChatRoom ID가 정의되지 않음");
            return; // userId 또는 chatRoomId가 없으면 WebSocket 연결하지 않음
        }

        console.log(`WebSocket 연결 시도 - ChatRoom ID: ${chatRoomId}`);

        const socket = new WebSocket(`${import.meta.env.VITE_WS_URI}/ws`);
        const stompClient = Stomp.over(socket);
        stompClientRef.current = stompClient; // stompClient를 ref에 저장

        if (topic === "create-room-one") {
            console.log("Setting messageTopic to 'one'");
            subscriptionUrl = `/topic/messages/${chatRoomId}`;
            setMessageTopic('one')
        } else {
            console.log("Setting messageTopic to 'many'");
            subscriptionUrl = `/topic/group/${chatRoomId}`;
            setMessageTopic('many')
        }

        stompClient.connect({}, (frame) => {
            console.log('WebSocket이 연결되었습니다: ' + frame);
            setIsConnected(true); // WebSocket 연결 상태를 true로 설정

            // WebSocket 메시지 구독
            stompClient.subscribe(subscriptionUrl, (message) => {
                const receivedMessage = JSON.parse(message.body);
                console.log("수신한 메시지:", receivedMessage);

                // 서버로부터 받은 메시지 중에서 본인의 메시지는 제외
                if (receivedMessage.senderId === userId) {
                    return;  // 본인이 보낸 메시지는 무시
                }

                // 창이 열려 있지 않으면 읽지 않은 메시지로 처리
                if (!isChatOpen) {
                    console.log(`읽지 않은 메시지로 처리 : ${receivedMessage.content}`);
                    setUnreadCount(prevCount => prevCount + 1);
                } else {
                    console.log(`메시지를 읽었습니다: ${receivedMessage.content}`);
                    sendReadReceipt();  // 서버에 메시지를 읽었다고 알림
                }

                // 서버로부터 받은 메시지를 왼쪽 말풍선에 추가 (다른 사용자의 메시지)
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        content: receivedMessage.content,
                        senderName: receivedMessage.senderName,
                        isMine: false,
                        name: receivedMessage.senderName,
                        profile: receivedMessage.profile,  // 프로필 정보 추가
                        senderId: receivedMessage.senderId,  // senderId도 추가
                        timestamp: receivedMessage.timestamp  // timestamp도 추가
                    }
                ]);
                updateChatRoomList(chatRoomId, receivedMessage.content, receivedMessage.senderName);
            });
        }, (error) => {
            console.error('WebSocket 오류 발생: ', error);
            setIsConnected(false); // WebSocket 연결 실패 시 false로 설정
        });

    };

    // 메시지 전송 함수
    const sendMessage = () => {
        const stompClient = stompClientRef.current;

        if (!isConnected || !stompClient || inputMessage.trim() === '') {
            console.error(error);
            console.error('WebSocket이 연결되지 않았거나 stompClient가 초기화되지 않았거나 메시지가 비어있습니다.');
            return;
        }

        const messageObj = {
            senderName: name,  // 사용자명
            profile: profile,
            chatRoomId: chatRoomId,
            senderId: userId,
            recipientId: activeRoom.participants,  // 수신자 목록
            content: inputMessage,
            announcement: '',
            fileUrl: '',
            topic: messageTopic,
            timestamp: new Date()
        };

        try {
            // 서버로 메시지 전송
            stompClient.send('/app/chat', {}, JSON.stringify(messageObj));

            // 내가 보낸 메시지를 오른쪽 말풍선에 추가
            setMessages(prevMessages => [
                ...prevMessages,
                {content: inputMessage, senderId: userId, senderName: name, isMine: true, timestamp: new Date()}
            ]);


            // Sidebar 업데이트를 위해 부모 컴포넌트의 함수 호출
            updateChatRoomList(chatRoomId, inputMessage);

            setInputMessage('');  // 입력창 비우기
        } catch (error) {
            console.error('메시지 전송 중 오류 발생:', error);
        }
    };

    // 채팅 히스토리 로드 함수
    const getChatHistory = () => {
        axios('/api/chat/chatting/history?chatRoomId=' + chatRoomId)
            .then(res => {
                const chatHistory = res.data;
                console.log("받은 채팅 기록:", chatHistory);
                // 오래된 메시지 순으로 정렬하여 저장
                setMessages(chatHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
            })
            .catch(err => {
                console.error('채팅 기록을 불러오는데 실패했습니다: ', err);
            });
    };

    // WebSocket 연결 및 채팅 히스토리 로드
    useEffect(() => {
        if (userId && chatRoomId) {
            connectWebSocket();
            getChatHistory();  // 채팅방에 입장할 때 채팅 기록 불러오기
        }
    }, [userId, chatRoomId]);


    // 메시지 입력 후 엔터 키로 전송
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    // 메시지가 업데이트될 때마다 스크롤을 아래로 이동시키는 함수
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);  // messages 배열이 변경될 때마다 실행


    // 채팅 메시지 UI 렌더링
    return (
        <div className={`chat-room-container2 ${activeRoom ? 'open' : ''}`} style={{height:'100%', borderRadius:'5px', display: 'flex', flexDirection: 'column'}}>
            <div className="chat-header">
                <div className="chat-header-info">
                    <span style={{fontSize: '20px'}}>{activeRoom?.chatRoomName || 'No room selected'}</span>
                    <div className="chat-room-participants">
                        <PeopleIcon fontSize="small"/>
                        <span>{renderParticipants(activeRoom?.participants || [])}</span>
                        <span className="participant-count">({activeRoom?.participants?.length || 0})</span>
                    </div>
                </div>
                <button style={{backgroundColor: 'transparent', border: 'none'}} onClick={onClose}>
                    <CloseIcon/>
                </button>
            </div>
            <div className="lk-chat-messages" ref={chatBodyRef}
                 style={{flex: 1, overflowY: 'auto', paddingBottom: '70px'}}>
                {messages.map((msg, index) => (
                    <div key={index} className={`lk-chat-entry ${msg.senderId === userId ? 'lk-chat-entry-self' : ''}`}>
                        {msg.senderId !== userId ? (
                            <div className="lk-chat-entry-other">
                                <div className="profile-picture">
                                    {showProfile(messages, index) && (
                                        <div className="profile-picture">
                                            <div className="profile-placeholder">
                                                <img src={msg.profile}
                                                     alt={msg.senderName}
                                                     className="profile-image"/>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="lk-chat-entry-content">
                                    {showName(messages, index) && (
                                        <div className="lk-chat-entry-metadata">{msg.senderName}</div>
                                    )}

                                    <div className="lk-chat-entry-bubble-container">
                                        {msg.content && msg.content.trim() !== '' && (
                                            <div className="lk-chat-entry-bubble2">
                                            <div className="message-content2">{msg.content}</div>
                                        </div>)}
                                        {shouldShowTimestamp(messages, index) && (
                                            <div className="lk-chat-entry-timestamp">
                                                {msg.timestamp && formatDate(msg.timestamp)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="lk-chat-entry-self">
                                <div className="lk-chat-entry-bubble-container">
                                    {shouldShowTimestamp(messages, index) && (
                                        <div className="lk-chat-entry-timestamp">
                                            {msg.timestamp && formatDate(msg.timestamp)}
                                        </div>
                                    )}
                                    {msg.content && msg.content.trim() !== '' && (
                                        <div className="lk-chat-entry-bubble2">
                                        <div className="message-content">{msg.content}</div>
                                    </div>
                                        )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="input-container" style={{width:'100%'}}>
                <input
                    className="chat-input"
                    type="text"
                    placeholder="Type a message"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button className="send-button" onClick={sendMessage}>보내기</button>
            </div>
        </div>
    );
};

export default ChatRoomContainer;