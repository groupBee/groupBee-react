import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem, Select, InputLabel, FormControl, FormHelperText } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';

const Roombookingmodal = ({ show, handleClose, room, fetchData, reservations }) => {
    const [memberId, setMemberId] = useState('');
    const [enterDay, setEnterDay] = useState('');
    const [enterTime, setEnterTime] = useState('');
    const [leaveDay, setLeaveDay] = useState('');
    const [leaveTime, setLeaveTime] = useState('');
    const [purpose, setPurpose] = useState('');
    const [bookedTimes, setBookedTimes] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (room) {
            const roomReservations = reservations.filter(res => res.roomId === room.id);
            const bookedSlots = {};
            roomReservations.forEach(reservation => {
                const start = new Date(reservation.enter);
                const end = new Date(reservation.leave);

                while (start <= end) {
                    bookedSlots[`${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}T${String(start.getHours()).padStart(2, '0')}:00`] = true;
                    start.setHours(start.getHours() + 1);
                }
            });

            setBookedTimes(bookedSlots);
        }
    }, [room, reservations]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();

        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return; // 오류가 있을 경우 폼 제출을 중단합니다.
        }

        const enterDateTime = `${enterDay}T${enterTime}:00`;
        const leaveDateTime = `${leaveDay}T${leaveTime}:00`;

        const bookingData = {
            roomId: room.id,
            memberId,
            enter: enterDateTime,
            leave: leaveDateTime,
            purpose,
        };

        try {
            await axios.post('/api/rooms/insert', bookingData);
            Swal.fire({
                title: '<strong>예약 성공</strong>',
                icon: 'success',
                html: '회의실 예약이 성공적으로 완료되었습니다.',
                focusConfirm: false,
                confirmButtonText: '확인',
                confirmButtonColor: '#ffb121',
            });
            handleClose(); // 예약 후 모달 닫기
            fetchData(); // 예약 후 데이터 새로고침
        } catch (error) {
            console.error('Error booking room:', error);
            Swal.fire({
                title: '예약 실패',
                text: '회의실 예약 중 오류가 발생했습니다. 다시 시도해 주세요.',
                icon: 'error',
                confirmButtonText: '확인',
                confirmButtonColor: '#ffb121',
            });
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!memberId) errors.memberId = '회원 ID를 입력해 주세요.';
        if (!enterDay) errors.enterDay = '입실일을 입력해 주세요.';
        if (!enterTime) errors.enterTime = '입실 시간을 선택해 주세요.';
        if (!leaveDay) errors.leaveDay = '퇴실일을 입력해 주세요.';
        if (!leaveTime) errors.leaveTime = '퇴실 시간을 선택해 주세요.';
        if (!purpose) errors.purpose = '대여 목적을 입력해 주세요.';

        const enterDateTime = `${enterDay}T${enterTime}:00`;
        const leaveDateTime = `${leaveDay}T${leaveTime}:00`;

        if (new Date(enterDateTime) >= new Date(leaveDateTime)) {
            errors.dateTime = '반납 시간은 대여 시간보다 늦어야 합니다.';
        }

        if (isTimeBooked(enterDay, enterTime)) {
            errors.enterTime = '이 시간대는 이미 예약되었습니다.';
        }
        if (isTimeBooked(leaveDay, leaveTime)) {
            errors.leaveTime = '이 시간대는 이미 예약되었습니다.';
        }

        return errors;
    };

    const handleInputChange = (setter) => (event) => {
        setter(event.target.value);
        setErrors({ ...errors, [event.target.name]: '' }); // 입력값 변경 시 에러 메시지 초기화
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

    const isTimeBooked = (date, time) => {
        return bookedTimes[`${date}T${time}`] === true;
    };

    return (
        <Dialog open={show} onClose={handleClose}>
            <DialogTitle
                sx={{
                    fontSize: '1.5rem',
                    marginBottom: '1px',
                    backgroundImage: 'linear-gradient(to right, #FFA800, #FFD600)',
                    color: 'white'
                }}>회의실 예약</DialogTitle>
            <DialogContent
                sx={{
                    marginTop: '15px',
                }}>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth error={!!errors.memberId}>
                                <TextField
                                    name="memberId"
                                    label="회원 ID"
                                    variant="outlined"
                                    value={memberId}
                                    onChange={handleInputChange(setMemberId)}
                                    required
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
                                <FormHelperText>{errors.memberId}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth error={!!errors.enterDay}>
                                <TextField
                                    name="enterDay"
                                    label="입실일"
                                    type="date"
                                    variant="outlined"
                                    value={enterDay}
                                    onChange={handleInputChange(setEnterDay)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    required
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
                                <FormHelperText>{errors.enterDay}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl variant="outlined" fullWidth required error={!!errors.enterTime}>
                                <InputLabel>입실 시간</InputLabel>
                                <Select
                                    name="enterTime"
                                    value={enterTime}
                                    onChange={handleInputChange(setEnterTime)}
                                    label="입실 시간"
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
                                        <MenuItem key={index} value={time} disabled={isTimeBooked(enterDay, time)}>
                                            {time}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.enterTime}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth error={!!errors.leaveDay}>
                                <TextField
                                    name="leaveDay"
                                    label="퇴실일"
                                    type="date"
                                    variant="outlined"
                                    value={leaveDay}
                                    onChange={handleInputChange(setLeaveDay)}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    required
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
                                <FormHelperText>{errors.leaveDay}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl variant="outlined" fullWidth required error={!!errors.leaveTime}>
                                <InputLabel>퇴실 시간</InputLabel>
                                <Select
                                    name="leaveTime"
                                    value={leaveTime}
                                    onChange={handleInputChange(setLeaveTime)}
                                    label="퇴실 시간"
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
                                        <MenuItem key={index} value={time} disabled={isTimeBooked(leaveDay, time)}>
                                            {time}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.leaveTime}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth error={!!errors.purpose}>
                                <TextField
                                    name="purpose"
                                    label="예약 사유"
                                    variant="outlined"
                                    value={purpose}
                                    onChange={handleInputChange(setPurpose)}
                                    required
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
                                <FormHelperText>{errors.purpose}</FormHelperText>
                            </FormControl>
                        </Grid>
                        {errors.dateTime && (
                            <Grid item xs={12}>
                                <FormHelperText error>{errors.dateTime}</FormHelperText>
                            </Grid>
                        )}
                    </Grid>
                    <DialogActions>
                        <Button onClick={handleClose} variant="contained" color="primary"
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
                                }}>취소</Button>
                        <Button type="submit" variant="contained" color="primary"
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
                            예약하기
                        </Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default Roombookingmodal;
