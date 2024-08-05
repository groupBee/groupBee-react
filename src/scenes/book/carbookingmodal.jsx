import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, MenuItem, Select, InputLabel, FormControl, FormHelperText } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';

const Carbookingmodal = ({ show, handleClose, car, fetchData, reservations }) => {
    const [memberId, setMemberId] = useState('');
    const [rantDay, setRantDay] = useState('');
    const [rantTime, setRantTime] = useState('');
    const [returnDay, setReturnDay] = useState('');
    const [returnTime, setReturnTime] = useState('');
    const [reason, setReason] = useState('');
    const [bookedTimes, setBookedTimes] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (car) {
            const carReservations = reservations.filter(res => res.corporateCarId === car.id);
            const bookedSlots = {};
            carReservations.forEach(reservation => {
                const start = new Date(reservation.rantDay);
                const end = new Date(reservation.returnDay);

                while (start <= end) {
                    bookedSlots[`${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}T${String(start.getHours()).padStart(2, '0')}:00`] = true;
                    start.setHours(start.getHours() + 1);
                }
            });

            setBookedTimes(bookedSlots);
        }
    }, [car, reservations]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();

        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return; // 오류가 있을 경우 폼 제출을 중단합니다.
        }

        const rantDateTime = `${rantDay}T${rantTime}:00`;
        const returnDateTime = `${returnDay}T${returnTime}:00`;

        const bookingData = {
            corporateCarId: car.id,
            memberId,
            rantDay: rantDateTime,
            returnDay: returnDateTime,
            reason,
        };

        try {
            await axios.post('/api/cars/insert', bookingData);
            Swal.fire({
                title: '<strong>예약 성공</strong>',
                icon: 'success',
                html: '차량 예약이 성공적으로 완료되었습니다.',
                focusConfirm: false,
                confirmButtonText: '확인',
                confirmButtonColor: '#ffb121',
            });
            handleClose(); // 예약 후 모달 닫기
            fetchData(); // 예약 후 데이터 새로고침
        } catch (error) {
            console.error('Error booking car:', error);
            Swal.fire({
                title: '예약 실패',
                text: '차량 예약 중 오류가 발생했습니다. 다시 시도해 주세요.',
                icon: 'error',
                confirmButtonText: '확인',
                confirmButtonColor: '#ffb121',
            });
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!memberId) errors.memberId = '회원 ID를 입력해 주세요.';
        if (!rantDay) errors.rantDay = '대여일을 입력해 주세요.';
        if (!rantTime) errors.rantTime = '대여 시간을 선택해 주세요.';
        if (!returnDay) errors.returnDay = '반납일을 입력해 주세요.';
        if (!returnTime) errors.returnTime = '반납 시간을 선택해 주세요.';
        if (!reason) errors.reason = '예약 사유를 입력해 주세요.';

        const rantDateTime = `${rantDay}T${rantTime}:00`;
        const returnDateTime = `${returnDay}T${returnTime}:00`;

        if (new Date(rantDateTime) >= new Date(returnDateTime)) {
            errors.dateTime = '반납 시간은 대여 시간보다 늦어야 합니다.';
        }

        if (isTimeBooked(rantDay, rantTime)) {
            errors.rantTime = '이 시간대는 이미 예약되었습니다.';
        }
        if (isTimeBooked(returnDay, returnTime)) {
            errors.returnTime = '이 시간대는 이미 예약되었습니다.';
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
                }}>차량 예약</DialogTitle>
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
                            <FormControl fullWidth error={!!errors.rantDay}>
                                <TextField
                                    name="rantDay"
                                    label="대여일"
                                    type="date"
                                    variant="outlined"
                                    value={rantDay}
                                    onChange={handleInputChange(setRantDay)}
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
                                <FormHelperText>{errors.rantDay}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl variant="outlined" fullWidth required error={!!errors.rantTime}>
                                <InputLabel>대여 시간</InputLabel>
                                <Select
                                    name="rantTime"
                                    value={rantTime}
                                    onChange={handleInputChange(setRantTime)}
                                    label="대여 시간"
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
                                        <MenuItem key={index} value={time} disabled={isTimeBooked(rantDay, time)}>
                                            {time}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.rantTime}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth error={!!errors.returnDay}>
                                <TextField
                                    name="returnDay"
                                    label="반납일"
                                    type="date"
                                    variant="outlined"
                                    value={returnDay}
                                    onChange={handleInputChange(setReturnDay)}
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
                                <FormHelperText>{errors.returnDay}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl variant="outlined" fullWidth required error={!!errors.returnTime}>
                                <InputLabel>반납 시간</InputLabel>
                                <Select
                                    name="returnTime"
                                    value={returnTime}
                                    onChange={handleInputChange(setReturnTime)}
                                    label="반납 시간"
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
                                        <MenuItem key={index} value={time} disabled={isTimeBooked(returnDay, time)}>
                                            {time}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>{errors.returnTime}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth error={!!errors.reason}>
                                <TextField
                                    name="reason"
                                    label="예약 사유"
                                    variant="outlined"
                                    value={reason}
                                    onChange={handleInputChange(setReason)}
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
                                <FormHelperText>{errors.reason}</FormHelperText>
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

export default Carbookingmodal;
