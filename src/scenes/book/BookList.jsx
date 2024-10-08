import React, { useState, useEffect } from 'react';
import {Box, Paper, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import { Row, Card, Table } from 'react-bootstrap';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, FormControl, Typography, Select, MenuItem, InputLabel
} from '@mui/material';
import Swal from 'sweetalert2';

const BookList = () => {
    const [carBookings, setCarBookings] = useState([]);
    const [carData, setCarData] = useState([]);
    const [roomBookings, setRoomBookings] = useState([]);
    const [roomData, setRoomData] = useState([]);
    const [carBookedTimes, setCarBookedTimes] = useState({});
    const [roomBookedTimes, setRoomBookedTimes] = useState({});
    const [editingBooking, setEditingBooking] = React.useState(null);
    const [potalId, setPotalId]=useState();

    const [showModal, setShowModal] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [category, setCategory] = useState('');
    const [formData, setFormData] = useState({
        rentDate: '',
        rentTime: '',
        returnDate: '',
        returnTime: '',
        enterDate: '',
        enterTime: '',
        leaveDate: '',
        leaveTime: '',
        reason: '',
        purpose: '',
        type: '',
        name: '',
        photo: ''
    });

    const [validationError, setValidationError] = useState('');


    const fetchData = async () => {
        try {
            const apiPotalResponse = await fetch('/api/employee/info');
            const apiPotalData = await apiPotalResponse.json();

            const potalId=apiPotalData.potalId;
            setPotalId(potalId);

            const carResponse = await fetch('/api/cars/list');
            const carData = await carResponse.json();
            setCarData(carData);

            const carBookingResponse = await fetch('/api/cars/booklist');
            const carBookingData = await carBookingResponse.json();
            setCarBookings(carBookingData);

            const roomResponse = await fetch(`/api/rooms/list`);
            const roomData = await roomResponse.json();
            setRoomData(roomData);

            const roomBookingResponse = await fetch('/api/rooms/booklist');
            const roomBookingData = await roomBookingResponse.json();
            setRoomBookings(roomBookingData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatDateToYYYYMMDD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatTimeToHHMM = (date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const convertUTCToLocal = (utcDate) => {
        const date = new Date(utcDate);
        return {
            localDate: formatDateToYYYYMMDD(date),
            localTime: formatTimeToHHMM(date)
        };
    };




    const handleEdit = (booking) => {
        setCurrentBooking(booking);
        setCategory(booking.category);
        setEditingBooking(booking); //수정버튼 누르고 해당 시간대는 선택가능하게

        if (booking.category === '차량') {
            const { localDate: rentDate, localTime: rentTime } = convertUTCToLocal(booking.rentDay);
            const { localDate: returnDate, localTime: returnTime } = convertUTCToLocal(booking.returnDay);
            setFormData({
                rentDate,
                rentTime,
                returnDate,
                returnTime,
                enterDate: '',
                enterTime: '',
                leaveDate: '',
                leaveTime: '',
                reason: booking.reason || '',
                purpose: '',
                type: booking.type || '',
                name: booking.name || '',
                photo: booking.photo || ''
            });

            // 차량 아이디 비교해서 같은 차량 추출
            const carBookingss = carBookings.filter(res => res.corporateCarId === booking.corporateCarId);
            const carbookedSlots = {};

            carBookingss.forEach(carBooking => {
                const start = new Date(carBooking.rentDay);
                const end = new Date(carBooking.returnDay);

                //반복문을 통해서 시간 사이의 값을 추출
                while (start <= end) {
                    carbookedSlots[`${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}T${String(start.getHours()).padStart(2, '0')}:00`] = true;
                    start.setHours(start.getHours() + 1);
                }
            });

            // 수정 중인 예약의 시간대는 false로 설정하여 선택 가능하게 함
            const start = new Date(booking.rentDay);
            const end = new Date(booking.returnDay);

            while (start <= end) {
                carbookedSlots[`${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}T${String(start.getHours()).padStart(2, '0')}:00`] = false;
                start.setHours(start.getHours() + 1);
            }


            setCarBookedTimes(carbookedSlots);

        }

        if (booking.category === '회의실') {
            const { localDate: enterDate, localTime: enterTime } = convertUTCToLocal(booking.enter);
            const { localDate: leaveDate, localTime: leaveTime } = convertUTCToLocal(booking.leave);
            setFormData({
                rentDate: '',
                rentTime: '',
                returnDate: '',
                returnTime: '',
                enterDate,
                enterTime,
                leaveDate,
                leaveTime,
                reason: '',
                purpose: booking.purpose || '',
                type: booking.type || '',
                name: booking.name || '',
                photo: booking.photo || ''
            });

            // 회의실 예약된 시간대 설정
            const roomBookingss = roomBookings.filter(res => res.roomId === booking.roomId);
            const roombookedSlots = {};

            roomBookingss.forEach(roomBooking => {
                const start = new Date(roomBooking.enter);
                const end = new Date(roomBooking.leave);

                while (start <= end) {
                    roombookedSlots[`${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}T${String(start.getHours()).padStart(2, '0')}:00`] = true;
                    start.setHours(start.getHours() + 1);
                }
            });

            // 수정 중인 예약의 시간대는 false로 설정하여 선택 가능하게 함
            const start = new Date(booking.enter);
            const end = new Date(booking.leave);

            while (start <= end) {
                roombookedSlots[`${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}T${String(start.getHours()).padStart(2, '0')}:00`] = false;
                start.setHours(start.getHours() + 1);
            }

            setRoomBookedTimes(roombookedSlots);

        }

        setShowModal(true);
    };


    const handleDelete = async (id, category) => {
        try {
            const result = await Swal.fire({
                title: '정말 삭제하시겠습니까?',
                text: "이 작업은 되돌릴 수 없습니다.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ffb121',
                cancelButtonColor: '#d33',
                confirmButtonText: '확인',
                cancelButtonText: '취소'
            });

            if (result.isConfirmed) {
                const url = category === '차량'
                    ? `/api/cars/delete/${id}`
                    : `/api/rooms/delete/${id}`;

                const response = await fetch(url, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    if (category === '차량') {
                        setCarBookings(carBookings.filter(booking => booking.id !== id));
                    } else {
                        setRoomBookings(roomBookings.filter(booking => booking.id !== id));
                    }
                    Swal.fire({
                        title: '<strong>삭제 성공</strong>',
                        icon: 'success',
                        html: '예약이 성공적으로 삭제되었습니다.',
                        confirmButtonText: '확인',
                        confirmButtonColor: '#ffb121',
                    });
                } else {
                    Swal.fire({
                        title: '<strong>삭제 실패</strong>',
                        icon: 'error',
                        html: '예약 삭제에 실패했습니다.',
                        confirmButtonText: '확인',
                        confirmButtonColor: '#ffb121',
                    });
                }
            }
        } catch (error) {
            console.error('삭제 중 에러 발생:', error);
            Swal.fire({
                title: '<strong>삭제 실패</strong>',
                icon: 'error',
                html: '삭제 중 에러가 발생했습니다.',
                confirmButtonText: '확인',
                confirmButtonColor: '#ffb121',
            });
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setCurrentBooking(null);
        // setCategory('');
    };

    const handleModalSave = async () => {
        // Validation logic
        if (category === '차량') {
            const rentDateTime = new Date(`${formData.rentDate}T${formData.rentTime}:00`);
            const returnDateTime = new Date(`${formData.returnDate}T${formData.returnTime}:00`);

            if (rentDateTime >= returnDateTime) {
                setValidationError('예약 시간은 반납 시간보다 먼저여야 합니다.');
                return;
            }

            let timeConflict = false;
            const tempDate = new Date(rentDateTime);
            while (tempDate <= returnDateTime) {
                const dateString = formatDateToYYYYMMDD(tempDate);
                const timeString = formatTimeToHHMM(tempDate);
                if (carTimeBooked(dateString, timeString)) {
                    timeConflict = true;
                    break;
                }
                tempDate.setHours(tempDate.getHours() + 1);
            }

            if (timeConflict) {
                setValidationError('이 시간대는 이미 예약되어 있습니다.');
                return;
            }
        }

        if (category === '회의실') {
            const enterDateTime = new Date(`${formData.enterDate}T${formData.enterTime}:00`);
            const leaveDateTime = new Date(`${formData.leaveDate}T${formData.leaveTime}:00`);

            if (enterDateTime >= leaveDateTime) {
                setValidationError('예약 시간은 반납 시간보다 먼저여야 합니다.');
                return;
            }

            let timeConflict = false;
            const tempDate = new Date(enterDateTime);
            while (tempDate <= leaveDateTime) {
                const dateString = formatDateToYYYYMMDD(tempDate);
                const timeString = formatTimeToHHMM(tempDate);
                if (roomTimeBooked(dateString, timeString)) {
                    timeConflict = true;
                    break;
                }
                tempDate.setHours(tempDate.getHours() + 1);
            }

            if (timeConflict) {
                setValidationError('이 시간대는 이미 예약되어 있습니다.');
                return;
            }
        }

        setValidationError('');

        try {
            const url = category === '차량'
                ? `/api/cars/update/${currentBooking.id}`
                : `/api/rooms/update/${currentBooking.id}`;

            const requestBody = category === '차량'
                ? {
                    rentDay: `${formData.rentDate}T${formData.rentTime}:00`,
                    returnDay: `${formData.returnDate}T${formData.returnTime}:00`,
                    reason: formData.reason,
                    corporateCarId: currentBooking.corporateCarId,
                    memberId: currentBooking.memberId
                }
                : {
                    enter: `${formData.enterDate}T${formData.enterTime}:00`,
                    leave: `${formData.leaveDate}T${formData.leaveTime}:00`,
                    purpose: formData.purpose,
                    roomId: currentBooking.roomId,
                    memberId: currentBooking.memberId
                };

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            // Close the modal first
            handleModalClose();


            Swal.fire({
                title: response.ok ? '<strong>수정 성공</strong>' : '<strong>수정 실패</strong>',
                icon: response.ok ? 'success' : 'error',
                html: response.ok ? '예약이 성공적으로 수정되었습니다.' : '예약 수정에 실패했습니다.',
                focusConfirm: false,
                confirmButtonText: '확인',
                confirmButtonColor: '#ffb121',
            });

            if (response.ok) {
                fetchData(); // Refresh data
            }
        } catch (error) {
            console.error('수정 중 에러 발생:', error);
            Swal.fire({
                title: '<strong>수정 실패</strong>',
                icon: 'error',
                html: '예약 수정에 실패했습니다.',
                focusConfirm: false,
                confirmButtonText: '확인',
                confirmButtonColor: '#ffb121',
            });
        }
    };




    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const getCarTypeByCarId = (carId) => {
        const car = carData.find(car => car.id === carId);
        return car ? car.type : 'Unknown';
    };

    const getRoomNameByRoomId = (roomId) => {
        const room = roomData.find(room => room.id === roomId);
        return room ? room.name : 'Unknown';
    };

    const combinedBookings = [
        ...carBookings.map(booking => ({
            ...booking,
            type: getCarTypeByCarId(booking.corporateCarId),
            category: '차량'
        })),
        ...roomBookings.map(booking => ({
            ...booking,
            type: getRoomNameByRoomId(booking.roomId),
            category: '회의실'
        }))
    ];

    const now = new Date(); // 현재 시간을 가져옵니다.

    const filteredBookings = combinedBookings
        .filter(booking => {
            if (booking.corporateCarId) {
                // 차량 예약인 경우
                const returnDay = new Date(booking.returnDay); // 예약 종료 시간을 Date 객체로 변환
                return booking.memberId === potalId && (
                    returnDay.getTime() >= now.getTime() // 현재 시간 포함, 이전 시간 제외
                );
            } else if (booking.roomId) {
                // 회의실 예약인 경우
                const leave = new Date(booking.leave); // 회의실 예약 종료 시간을 Date 객체로 변환
                return booking.memberId === potalId && (
                    leave.getTime() >= now.getTime() // 현재 시간 포함, 이전 시간 제외
                );
            }
            return false; // 차량 예약과 회의실 예약 모두 아닌 경우
        })
        .sort((a, b) => {
            // 차량 예약인 경우 `returnDay` 기준, 회의실 예약인 경우 `leave` 기준으로 정렬
            const timeA = new Date(a.returnDay || a.leave).getTime();
            const timeB = new Date(b.returnDay || b.leave).getTime();
            return timeA - timeB; // 빠른 시간 순서대로 정렬
        });







    const formatDateTime = (dateTime) => {
        if (!dateTime) return '';
        const { localDate, localTime } = convertUTCToLocal(dateTime);

        // 시간만 추출하고 '시'를 붙이는 작업
        const formattedTime = localTime.split(':')[0] + '시';

        return `${localDate} ${formattedTime}`;
    };

    const generateTimeOptions = () => {
        const times = [];
        for (let i = 0; i < 24; i++) {
            const hour = String(i).padStart(2, '0');
            times.push(`${hour}:00`);
        }
        return times;
    };

    const timeOptions = generateTimeOptions();

    const carTimeBooked = (date, time) => {
        return carBookedTimes[`${date}T${time}`] === true;
    };


    const roomTimeBooked = (date, time) => {
        return roomBookedTimes[`${date}T${time}`] === true;
    };



    return (
        <Box m="20px">
            <Box
                height="100%"
                sx={{
                    borderRadius: "8px",
                    backgroundColor: "white",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",

                }}
            >
                <Card style={{ padding: '20px' }}>
                    <Card.Body className="px-0 py-2">

                        <Table striped bordered hover>
                            <TableHead>
                                <TableRow>
                                <TableCell align="center" style={{backgroundColor: '#ffb121', padding: '12px', width: '7%', fontSize: '0.9rem', fontWeight:'bold'}}>번호</TableCell>
                                <TableCell align="center" style={{backgroundColor: '#ffb121', padding: '12px', width: '10%' ,fontSize: '0.9rem', fontWeight:'bold' }}>차량/회의실</TableCell>
                                <TableCell align="center" style={{backgroundColor: '#ffb121', padding: '12px', width: '10%' ,fontSize: '0.9rem', fontWeight:'bold'}}>아이템</TableCell>
                                <TableCell align="center" style={{backgroundColor: '#ffb121', padding: '12px', width: '15%' ,fontSize: '0.9rem', fontWeight:'bold'}}>예약시간</TableCell>
                                <TableCell align="center" style={{backgroundColor: '#ffb121', padding: '12px', width: '15%' ,fontSize: '0.9rem', fontWeight:'bold'}}>반납시간</TableCell>
                                <TableCell align="center" style={{backgroundColor: '#ffb121', padding: '12px', width: '30%' ,fontSize: '0.9rem', fontWeight:'bold'}}>사유</TableCell>
                                <TableCell align="center" style={{backgroundColor: '#ffb121', padding: '12px', width: '13%' ,fontSize: '0.9rem', fontWeight:'bold'}}>변경/삭제</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {filteredBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                        예약이 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBookings.map((booking, index) => {
                                    const endTime = new Date(booking.returnDay || booking.leave);

                                    const isTimePast = endTime < new Date();

                                    return (
                                    <TableRow key={index}>
                                        <TableCell align="center" style={{color: isTimePast ? '#979797' : 'inherit', fontSize: '0.9rem'}}>{index + 1}</TableCell>
                                        <TableCell align="center" style={{color: isTimePast ? '#979797' : 'inherit', fontSize: '0.9rem'}}>{booking.category}</TableCell>
                                        <TableCell align="center" style={{color: isTimePast ? '#979797' : 'inherit', fontSize: '0.9rem'}}>{booking.type}</TableCell>
                                        <TableCell align="center" style={{color: isTimePast ? '#979797' : 'inherit', fontSize: '0.9rem'}}>{formatDateTime(booking.rentDay || booking.enter)}</TableCell>
                                        <TableCell align="center" style={{color: isTimePast ? '#979797' : 'inherit', fontSize: '0.9rem'}}>{formatDateTime(booking.returnDay || booking.leave)}</TableCell>
                                        <TableCell align="center" style={{color: isTimePast ? '#979797' : 'inherit', fontSize: '0.9rem'}}>{booking.reason || booking.purpose}</TableCell>
                                        <TableCell align="center" sx={{ display: 'flex', justifyContent: 'center', gap: '2px', flexWrap: 'nowrap' }}>
                                            <Button
                                                variant=""
                                                size="small"
                                                onClick={() => handleEdit(booking)}
                                                sx={{
                                                    fontSize: '0.9rem',
                                                    backgroundColor: '#ffb121',
                                                    color: '#fff',
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase',
                                                    borderRadius: '5px',
                                                    padding: '6px 12px',
                                                    '&:hover': {
                                                        backgroundColor: '#e68a00',
                                                        transform: 'scale(1.05)',
                                                    },
                                                    marginRight: '8px', // Margin right for spacing
                                                }}
                                            >
                                                변경
                                            </Button>
                                            <Button
                                                variant=""
                                                size="small"
                                                onClick={() => handleDelete(booking.id, booking.category)}
                                                sx={{
                                                    fontSize: '0.9rem',
                                                    backgroundColor: '#dc3545',
                                                    color: '#fff',
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase',
                                                    borderRadius: '5px',
                                                    padding: '6px 12px',
                                                    '&:hover': {
                                                        backgroundColor: '#c82333',
                                                        transform: 'scale(1.05)',
                                                    },
                                                }}
                                            >
                                                삭제
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    )
                                })
                            )}

                            </TableBody>
                        </Table>

                    </Card.Body>
                </Card>
            </Box>

            <Dialog open={showModal} onClose={handleModalClose} fullWidth maxWidth="sm">
                <DialogTitle
                    sx={{
                        fontSize: '1.5rem',
                        marginBottom: '1px',
                        backgroundImage: 'linear-gradient(to right, #FFA800, #FFD600)',
                        color: 'white'
                    }}>예약 수정</DialogTitle>
                <DialogContent
                    sx={{
                        marginTop: '15px',
                    }}>
                    <form >
                        {category === '차량' && (
                            <>
                                <Grid container spacing={2} marginBottom={2}>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth margin="normal">
                                            <TextField
                                                label="예약일"
                                                type="date"
                                                name="rentDate"
                                                value={formData.rentDate}
                                                onChange={handleInputChange}
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '&:hover fieldset': {
                                                            borderColor: '#ffb121',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#ffb121',
                                                        },
                                                    },
                                                    '&:hover': {
                                                        '& .MuiInputLabel-root': {
                                                            color: '#ffb121',
                                                        },
                                                    },
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>예약시간</InputLabel>
                                            <Select
                                                label="예약시간"
                                                name="rentTime"
                                                value={formData.rentTime}
                                                onChange={handleInputChange}
                                                sx={{
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#ffb121',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#ffb121',
                                                    },
                                                }}
                                            >
                                                {timeOptions.map((time, index) => (
                                                    <MenuItem
                                                        key={index}
                                                        value={time}
                                                        disabled={carTimeBooked(formData.rentDate, time)}
                                                    >
                                                        {time}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={2} marginBottom={2}>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth margin="normal">
                                            <TextField
                                                label="반납일"
                                                type="date"
                                                name="returnDate"
                                                value={formData.returnDate}
                                                onChange={handleInputChange}
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '&:hover fieldset': {
                                                            borderColor: '#ffb121',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#ffb121',
                                                        },
                                                    },
                                                    '&:hover': {
                                                        '& .MuiInputLabel-root': {
                                                            color: '#ffb121',
                                                        },
                                                    },
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>반납시간</InputLabel>
                                            <Select
                                                label="반납시간"
                                                name="returnTime"
                                                value={formData.returnTime}
                                                onChange={handleInputChange}
                                                sx={{
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#ffb121',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#ffb121',
                                                    },
                                                }}
                                            >
                                                {timeOptions.map((time, index) => (
                                                    <MenuItem
                                                        key={index}
                                                        value={time}
                                                        disabled={carTimeBooked(formData.returnDate, time)}
                                                    >
                                                        {time}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <FormControl fullWidth margin="normal">
                                    <TextField
                                        label="예약사유"
                                        type="text"
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={3}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: '#ffb121',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#ffb121',
                                                },
                                            },
                                            '&:hover': {
                                                '& .MuiInputLabel-root': {
                                                    color: '#ffb121',
                                                },
                                            },
                                        }}
                                    />
                                </FormControl>
                            </>
                        )}

                        {category === '회의실' && (
                            <>
                                <Grid container spacing={2} marginBottom={2}>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth margin="normal">
                                            <TextField
                                                label="예약일"
                                                type="date"
                                                name="enterDate"
                                                value={formData.enterDate}
                                                onChange={handleInputChange}
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '&:hover fieldset': {
                                                            borderColor: '#ffb121',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#ffb121',
                                                        },
                                                    },
                                                    '&:hover': {
                                                        '& .MuiInputLabel-root': {
                                                            color: '#ffb121',
                                                        },
                                                    },
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>예약시간</InputLabel>
                                            <Select
                                                label="예약시간"
                                                name="enterTime"
                                                value={formData.enterTime}
                                                onChange={handleInputChange}
                                                sx={{
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#ffb121',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#ffb121',
                                                    },
                                                }}
                                            >
                                                {timeOptions.map((time, index) => (
                                                    <MenuItem
                                                        key={index}
                                                        value={time}
                                                        disabled={roomTimeBooked(formData.enterDate, time)}
                                                    >
                                                        {time}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={2} marginBottom={2}>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth margin="normal">
                                            <TextField
                                                label="반납일"
                                                type="date"
                                                name="leaveDate"
                                                value={formData.leaveDate}
                                                onChange={handleInputChange}
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        '&:hover fieldset': {
                                                            borderColor: '#ffb121',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: '#ffb121',
                                                        },
                                                    },
                                                    '&:hover': {
                                                        '& .MuiInputLabel-root': {
                                                            color: '#ffb121',
                                                        },
                                                    },
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>반납시간</InputLabel>
                                            <Select
                                                label="반납시간"
                                                name="leaveTime"
                                                value={formData.leaveTime}
                                                onChange={handleInputChange}
                                                sx={{
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#ffb121',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#ffb121',
                                                    },
                                                }}
                                            >
                                                {timeOptions.map((time, index) => (
                                                    <MenuItem
                                                        key={index}
                                                        value={time}
                                                        disabled={roomTimeBooked(formData.leaveDate, time)}
                                                    >
                                                        {time}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <FormControl fullWidth margin="normal">
                                    <TextField
                                        label="예약사유"
                                        type="text"
                                        name="purpose"
                                        value={formData.purpose}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={3}
                                        sx={{
                                            marginTop: '15px',
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: '#ffb121',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#ffb121',
                                                },
                                            },
                                            '&:hover': {
                                                '& .MuiInputLabel-root': {
                                                    color: '#ffb121',
                                                },
                                            },
                                        }}
                                    />
                                </FormControl>
                            </>
                        )}
                    </form>

                    {validationError && (
                        <Typography color="error" variant="body2" style={{ marginTop: '16px' }}>
                            {validationError}
                        </Typography>
                    )}
                </DialogContent>

                <DialogActions style={{marginRight:'20px'}}>
                    <Button onClick={handleModalClose} color="primary" variant=""
                            sx={{
                                fontSize: '1rem',
                                color: '#ffb121',
                                backgroundColor: 'white',
                                border: '1px solid #ffb121',
                                '&:hover': {
                                    backgroundColor: 'white',
                                    color: '#ffb121',
                                    border: '1px solid #ffb121',
                                },
                            }}>
                        취소
                    </Button>
                    <Button onClick={handleModalSave} color="primary" variant=""
                            sx={{
                                fontSize: '1rem',
                                color: '#ffb121',
                                backgroundColor: 'white',
                                border: '1px solid #ffb121',
                                '&:hover': {
                                    backgroundColor: 'white',
                                    color: '#ffb121',
                                    border: '1px solid #ffb121',
                                },
                            }}>
                        변경하기
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BookList;