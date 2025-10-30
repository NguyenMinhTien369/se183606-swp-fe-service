import { useState, useRef } from 'react';
import type { FormEvent, ChangeEvent, KeyboardEvent, ClipboardEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { FaEnvelope, FaLock, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import { authAPI } from '@/utility';
import styles from './ResetPasswordFlow.module.css';

const ResetPasswordFlow = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [loading, setLoading] = useState(false);

    // OTP input refs
    const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Step 1: Send OTP to email
    const handleSendOTP = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await authAPI.forgotPassword(email);
            console.log('OTP Response:', response.data);

            if (response.data.code === 0 || response.data.code === 200) {
                setSuccess('✅ Mã OTP đã được gửi đến email của bạn!');
                setStep(2);
            } else {
                setError(response.data.message || 'Không thể gửi OTP!');
            }
        } catch (err: any) {
            console.error('Send OTP Error:', err);
            setError(err.response?.data?.message || 'Email không tồn tại trong hệ thống!');
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP input change
    const handleOtpChange = (index: number, value: string) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtpDigits = [...otpDigits];
        newOtpDigits[index] = value;
        setOtpDigits(newOtpDigits);

        // Auto-focus next input
        if (value && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }

        // Update OTP state whenever digits change
        const fullOtp = newOtpDigits.join('');
        setOtp(fullOtp);
    };

    // Handle OTP input key down
    const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            // Focus previous input on backspace
            otpInputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            otpInputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            otpInputRefs.current[index + 1]?.focus();
        }
    };

    // Handle OTP paste
    const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);

        if (!/^\d+$/.test(pastedData)) return;

        const newOtpDigits = pastedData.split('');
        while (newOtpDigits.length < 6) {
            newOtpDigits.push('');
        }
        setOtpDigits(newOtpDigits);
        setOtp(pastedData);

        // Focus last filled input
        const lastIndex = Math.min(pastedData.length, 5);
        otpInputRefs.current[lastIndex]?.focus();
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const fullOtp = otpDigits.join('');
        console.log('🔍 OTP Digits:', otpDigits);
        console.log('🔍 Full OTP:', fullOtp);
        console.log('🔍 OTP Length:', fullOtp.length);

        if (!fullOtp || fullOtp.length !== 6) {
            setError('Vui lòng nhập đủ 6 chữ số!');
            return;
        }

        setLoading(true);

        try {
            const payload = { email, otpCode: fullOtp };
            console.log('📤 Sending Verify OTP Request:', payload);

            const response = await authAPI.verifyOtp(payload);
            console.log('📥 Verify OTP Response:', response.data);

            if (response.data.code === 0 || response.data.code === 200) {
                setSuccess('✅ Xác thực OTP thành công!');
                setOtp(fullOtp); // Save verified OTP for password reset
                setStep(3);
            } else {
                console.error('❌ Verify OTP Failed:', response.data);
                setError(response.data.message || 'Mã OTP không đúng!');
            }
        } catch (err: any) {
            console.error('❌ Verify OTP Error:', err);
            console.error('❌ Error Response:', err.response?.data);
            setError(err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn!');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                email,
                otpCode: otp,
                newPassword,
                confirmPassword
            };
            console.log('📤 Sending Reset Password Request:', payload);

            const response = await authAPI.resetPassword(payload);
            console.log('📥 Reset Password Response:', response.data);

            if (response.data.code === 0 || response.data.code === 200) {
                setSuccess('✅ Đổi mật khẩu thành công!');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                console.error('❌ Reset Password Failed:', response.data);
                setError(response.data.message || 'Không thể đổi mật khẩu!');
            }
        } catch (err: any) {
            console.error('❌ Reset Password Error:', err);
            console.error('❌ Error Response:', err.response?.data);
            setError(err.response?.data?.message || 'Đã có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.title}>Đặt lại mật khẩu</h1>
                    <p className={styles.subtitle}>
                        {step === 1 && 'Nhập email để nhận mã OTP'}
                        {step === 2 && 'Nhập mã OTP đã gửi đến email'}
                        {step === 3 && 'Tạo mật khẩu mới cho tài khoản'}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className={styles.steps}>
                    <div className={`${styles.stepItem} ${step >= 1 ? styles.active : ''}`}>
                        <div className={styles.stepNumber}>1</div>
                        <div className={styles.stepLabel}>Email</div>
                    </div>
                    <div className={styles.stepLine} />
                    <div className={`${styles.stepItem} ${step >= 2 ? styles.active : ''}`}>
                        <div className={styles.stepNumber}>2</div>
                        <div className={styles.stepLabel}>OTP</div>
                    </div>
                    <div className={styles.stepLine} />
                    <div className={`${styles.stepItem} ${step >= 3 ? styles.active : ''}`}>
                        <div className={styles.stepNumber}>3</div>
                        <div className={styles.stepLabel}>Mật khẩu mới</div>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className={styles.errorMessage}>
                        ❌ {error}
                    </div>
                )}
                {success && (
                    <div className={styles.successMessage}>
                        <FaCheckCircle /> {success}
                    </div>
                )}

                {/* Step 1: Enter Email */}
                {step === 1 && (
                    <form onSubmit={handleSendOTP} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Email của bạn</label>
                            <div className={styles.inputWrapper}>
                                <FaEnvelope className={styles.icon} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    placeholder="example@gmail.com"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button type="submit" className={styles.button} disabled={loading}>
                            {loading ? '⏳ Đang gửi...' : '📧 Gửi mã OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: Enter OTP */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOTP} className={styles.form}>
                        <div className={styles.otpSection}>
                            <h2 className={styles.otpTitle}>Nhập mã xác thực</h2>
                            <p className={styles.otpSubtitle}>Chúng tôi đã gửi mã 6 chữ số đến email của bạn.</p>

                            <label className={styles.otpLabel}>Mã xác thực</label>

                            <div className={styles.otpInputs}>
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { otpInputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={otpDigits[index]}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleOtpKeyDown(index, e)}
                                        onPaste={(e: ClipboardEvent<HTMLInputElement>) => handleOtpPaste(e)}
                                        className={styles.otpInput}
                                        disabled={loading}
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>

                            <p className={styles.otpHint}>Nhập mã 6 chữ số đã gửi đến email của bạn.</p>
                        </div>

                        <button type="submit" className={styles.verifyButton} disabled={loading}>
                            {loading ? 'Đang xác thực...' : 'Xác thực'}
                        </button>

                        <div className={styles.resendSection}>
                            <span className={styles.resendText}>Không nhận được mã? </span>
                            <button
                                type="button"
                                className={styles.resendLink}
                                onClick={() => handleSendOTP({ preventDefault: () => { } } as FormEvent<HTMLFormElement>)}
                                disabled={loading}
                            >
                                Gửi lại
                            </button>
                        </div>
                    </form>
                )}

                {/* Step 3: Enter New Password */}
                {step === 3 && (
                    <form onSubmit={handleResetPassword} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label>Mật khẩu mới</label>
                            <div className={styles.inputWrapper}>
                                <FaLock className={styles.icon} />
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới"
                                    minLength={6}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Xác nhận mật khẩu</label>
                            <div className={styles.inputWrapper}>
                                <FaLock className={styles.icon} />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu mới"
                                    minLength={6}
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button type="submit" className={styles.button} disabled={loading}>
                            {loading ? '⏳ Đang xử lý...' : '🔒 Đặt lại mật khẩu'}
                        </button>
                    </form>
                )}

                {/* Back to Login */}
                <div className={styles.footer}>
                    <Link to="/login" className={styles.backLink}>
                        <FaArrowLeft /> Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordFlow;
