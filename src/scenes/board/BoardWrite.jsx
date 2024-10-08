import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, Chip } from "@mui/material";
import { useDropzone } from 'react-dropzone';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './Board.css';
import CreateIcon from '@mui/icons-material/Create';
import Swal from "sweetalert2";

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['link', 'image', 'video'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }]
];

const BoardWrite = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [readCount, setReadCount] = useState(0);
    const [mustRead, setMustRead] = useState(false);
    const [mustMustRead, setMustMustRead] = useState(false);
    const [files, setFiles] = useState([]);
    const [mustMustReadCount, setMustMustReadCount] = useState(0);

    useEffect(() => {
        const fetchMustMustReadCount = async () => {
            try {
                const response = await axios.get('/api/board/list');
                const posts = response.data;
                const count = posts.filter(p => p.mustMustRead).length; // 수정된 부분: board -> mustMustRead
                setMustMustReadCount(count);
            } catch (error) {
                console.error('Error fetching mustMustRead count:', error);
            }
        };

        fetchMustMustReadCount();
    }, []);

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };


        const handleContentChange = (value) => {
            setContent(value);

            // 이미지 크기를 강제로 설정
            const div = document.createElement('div');
            div.innerHTML = value;
            const images = div.querySelectorAll('img');

            // 모든 이미지에 고정된 스타일 적용
            images.forEach(img => {
                img.style.maxWidth = '700px'; // 원하는 고정 크기
                img.style.height = 'auto'; // 비율 유지를 위해 height는 auto
            });

            // 비디오 크기 강제 설정
            const videos = div.querySelectorAll('iframe, video');
            videos.forEach(video => {
                video.style.width = '500px';  // 비디오의 너비를 컨테이너에 맞추기
                video.style.height = '300px'; // 고정된 비디오 높이
            });

            setContent(div.innerHTML); // 수정된 HTML을 다시 저장
        };


    const handleMustReadChange = (e) => {
        setMustRead(e.target.checked);
    };

    const handleMustMustReadChange = (e) => {
        if (!e.target.checked && mustMustReadCount >= 8) {
            alert('중요 게시글은 8개까지만 설정할 수 있습니다.');
            return;
        }
        setMustMustRead(e.target.checked);
    };

    const onDrop = (acceptedFiles) => {
        setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    };

    const handleBackClick = () => {
        navigate(`/board`);
    };

    const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true,
    });

    const deleteAttachment = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const fileAttachClick = (event) => {
        event.preventDefault();
        open();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 게시글 데이터
        const boardData = {
            title,
            content,
            mustRead,
            mustMustRead,
            readCount,
        };

        // FormData 객체 생성
        const formData = new FormData();

        // boardData를 JSON 문자열로 추가
        formData.append('boardData', JSON.stringify(boardData));

        // 파일들을 FormData에 추가
        files.forEach((file, index) => {
            formData.append('files', file); // 수정된 부분: 파일을 'files'라는 키로 추가
        });

        try {
            // 서버에 POST 요청 전송
            const response = await axios.post('/api/board/insert', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            Swal.fire({
                title: '<strong>글 작성 완료</strong>',
                icon: 'success',
                html: '게시글이 작성되었습니다.',
                focusConfirm: false,
                confirmButtonText: '확인',
                confirmButtonColor: '#ffb121',
            });
            navigate('/board'); // 성공 시 페이지 이동
        } catch (error) {
            console.error('Error creating post or uploading files:', error);
        }
    };

    return (
        <Box sx={{ m: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box
                height="auto"
                sx={{
                    borderRadius: "8px",
                    backgroundColor: "white",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    minHeight: '850px',
                    width: "80%",
                    maxWidth: "850px",
                    padding: "80px",
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '-10px', marginBottom: '30px',
                    fontSize: '25px'}}><h1>게시글 작성</h1></Box>
                <Box height="75vh">
                    <form onSubmit={handleSubmit}>
                        <Box>
                            <label htmlFor="title"><b style={{ fontSize: '15px' }}>제목</b></label>
                            <br/>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={handleTitleChange}
                                required
                                style={{
                                    width: '100%',
                                    maxWidth: '800px',
                                    height: '30px',
                                    border: '0.5px solid grey',
                                    marginTop: '10px',
                                }}
                            />
                        </Box>
                        <div style={{ display: 'flex' }}>
                            <input
                                type="checkbox"
                                checked={mustRead}
                                onChange={handleMustReadChange}
                            /><b style={{ marginTop: '15px', marginLeft: '10px' }}>공지사항</b>

                            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
                                <input
                                    type="checkbox"
                                    checked={mustMustRead}
                                    onChange={handleMustMustReadChange}
                                    disabled={mustMustReadCount >= 8 && !mustMustRead}
                                />
                                <b style={{ marginTop: '2px', marginLeft: '10px', fontSize: '15px' }}>중요</b>
                            </div>
                        </div>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <b style={{ width: '65px', textAlign: 'center', marginLeft: '-7px' }}>첨부파일</b>
                            <button
                                onClick={fileAttachClick}
                                style={{
                                    border: '1px solid #14C87B',
                                    backgroundColor: 'transparent',
                                    borderRadius: '4px'

                                    ,color: '#14C87B'
                                }}
                            >
                                선택
                            </button>
                        </Box>
                        <Box
                            {...getRootProps()}
                            sx={{
                                border: '2px dashed #dddddd',
                                borderRadius: '4px',
                                padding: '20px',
                                textAlign: 'center',
                                backgroundColor: isDragActive ? '#f0f0f0' : 'white',
                                marginBottom: '20px',
                                width: '100%',
                                maxWidth: '800px',
                                height: 'auto',
                                maxHeight: '90px',
                            }}
                        >
                            <input {...getInputProps()} />
                            {files.length > 0 ? (
                                files.map((file, index) => (
                                    <Chip
                                        key={index}
                                        label={file.name}
                                        onDelete={() => deleteAttachment(index)}
                                        sx={{
                                            maxWidth: '200px',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            marginRight: '5px',
                                            marginBottom: '5px'
                                        }}
                                    />
                                ))
                            ) : (
                                <>
                                    <UploadFileIcon style={{ color: 'gray', marginBottom: '5px' }}/>
                                    <p style={{ color: 'gray' }}>파일을 여기에 드래그하여 파일을 선택하세요.</p>
                                </>
                            )}
                        </Box>
                        <div style={{ marginTop: '-20px' }}>
                            <label htmlFor="content"></label>
                            <ReactQuill
                                required
                                id="content"
                                theme="snow"
                                value={content}
                                onChange={handleContentChange}
                                modules={{ toolbar: toolbarOptions }}
                                style={{ width: '100%', maxWidth: '800px', height: '250px', backgroundColor: 'white', marginBottom: '10px' }}
                                placeholder='내용을 입력하세요!'
                            />
                        </div>
                        <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '80px' }}>
                        <Button
                            style={{
                                color: '#ffb121',
                                border: '1px solid #ffb121',
                            }}
                            onClick={handleBackClick}
                        >
                            목록
                        </Button>
                            <Button
                                type="submit"

                                style={{
                                    color: 'white',
                                    border: 'none',
                                    backgroundColor: '#ffb121'
                                }}
                            >
                                등록
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Box>
        </Box>
    );
};

export default BoardWrite;