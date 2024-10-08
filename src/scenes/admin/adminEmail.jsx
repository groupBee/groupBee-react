import React, { useEffect, useState } from 'react';
import {
    Box,
    IconButton,
    InputBase,
    MenuItem,
    Select,
    Typography,
    CircularProgress,
    useMediaQuery,
    Pagination
} from "@mui/material";
import { MenuOutlined, SearchOutlined } from "@mui/icons-material";
import PersonIcon from '@mui/icons-material/Person';
import MailIcon from '@mui/icons-material/Mail';

const AdminEmail = () => {
    const [sortOrder, setSortOrder] = useState('default');
    const isMdDevices = useMediaQuery("(max-width:768px)");
    const isXsDevices = useMediaQuery("(max-width:466px)");
    const [email, setEmail] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [itemsPerPage] = useState(4); // 페이지당 항목 수

    const handleSortChange = (event) => {
        setSortOrder(event.target.value);
        // 선택된 순서에 따른 데이터 정렬 또는 기타 작업을 여기에 추가
    };

    const fetchData = async () => {
        try {
            const response = await fetch('https://api.bmservice.kro.kr/mail/api/v1/get/mailbox/all/groupbee.co.kr', {
                method: 'GET',
                headers: {
                    'X-API-Key': 'E63DEF-77C26B-9A104F-C6AEBF-B2ED8D',
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            const filteredData = data.map(item => ({
                name: item.name,
                username: item.username,
                active: item.active,
                quota: item.quota,
                messages: item.messages
            }));

            setEmail(filteredData);
            setLoading(false);

        } catch (error) {
            console.error('Error fetching user data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const convertBytesToGB = (bytes) => (bytes / (1024 ** 3)).toFixed(2);
    const TOTAL_QUOTA_GB = 5;

    // 페이지네이션 관련 데이터 계산
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = email.slice(indexOfFirstItem, indexOfLastItem);
    const pageCount = Math.ceil(email.length / itemsPerPage);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ padding: '20px' }}>
            <Box p={2} style={{marginTop:'-10px'}}>

                    {currentItems.map((emailItem, index) => {
                        const usedQuotaGB = convertBytesToGB(emailItem.quota);
                        const totalQuotaGB = TOTAL_QUOTA_GB;
                        const quotaUsedPercent = (emailItem.quota / (totalQuotaGB * 1024 ** 3)) * 100;

                        return (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    height: '150px',
                                    marginBottom: '15px',
                                    borderRadius: '8px',
                                    backgroundColor: 'white',
                                    boxShadow: 1,
                                    overflow: 'hidden',
                                    '&:hover': { backgroundColor: '#f5f5f5' },

                                }}
                            >
                                {/* 왼쪽 박스 (70%) */}
                                <Box
                                    sx={{
                                        flex: 7,
                                        padding: '20px',
                                        borderLeft: '8px solid #09e3a9',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                        <Typography variant="h5" sx={{ fontWeight: 'bold', mr: 2 }}>
                                            {emailItem.username}
                                        </Typography>
                                        <Typography variant="h6">
                                            <span style={{ color: 'white', backgroundColor: '#09e3a9', padding: '4px', borderRadius: '4px' }}>
                                                {emailItem.active === 1 ? '사용중' : '사용불가'}
                                            </span>
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                                        <Typography variant="subtitle1" sx={{ color: '#6c6c6c', display: 'flex', alignItems: 'center' }}>
                                            <PersonIcon sx={{ mr: 1 }} />
                                            {emailItem.name}
                                        </Typography>
                                        <Typography variant="subtitle1" sx={{ color: '#6c6c6c', display: 'flex', alignItems: 'center', ml: 2 }}>
                                            <MailIcon sx={{ mr: 1 }} />
                                            {emailItem.messages}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* 오른쪽 박스 (30%) */}
                                <Box
                                    sx={{
                                        flex: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                    }}
                                >
                                    <CircularProgress
                                        variant="determinate"
                                        value={quotaUsedPercent}
                                        size={110}
                                        thickness={4}
                                        sx={{ color: '#09e3a9' }}
                                    />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Typography variant="caption" component="div" color="textSecondary" sx={{ fontSize: '1rem' }}>
                                            {`${quotaUsedPercent.toFixed(1)}%`}
                                        </Typography>
                                        <Typography variant="caption" component="div" color="textSecondary" sx={{ fontSize: '0.9rem' }}>
                                            {`${usedQuotaGB} GB / ${totalQuotaGB} GB`}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}

                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <Pagination
                        count={pageCount}
                        page={currentPage}
                        onChange={handlePageChange}
                        siblingCount={2}
                        boundaryCount={1}
                        showFirstButton
                        showLastButton
                        sx={{
                            '& .MuiPaginationItem-root': {
                                color: '#000',
                                fontSize: '14px',
                                '&:hover': {
                                    backgroundColor: '#09e3a9',
                                    color: 'white',
                                },
                                '&.Mui-selected': {
                                    backgroundColor: '#09e3a9',
                                    color: 'white',
                                },
                            },
                            '& .MuiPaginationItem-ellipsis': {
                                color: '#09e3a9',
                            },
                            '& .MuiPaginationItem-icon': {
                                color: '#000',
                            },
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default AdminEmail;
