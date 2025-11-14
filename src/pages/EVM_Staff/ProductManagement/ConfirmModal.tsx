import { createPortal } from 'react-dom';
import styles from './ProductManagement.module.css';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onClose: () => void;
}

const ConfirmModal = ({ isOpen, title, message, onConfirm, onClose }: ConfirmModalProps) => {
    if (!isOpen) return null;

    return createPortal(
        <div className={styles.confirmOverlay} onClick={onClose}>
            <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className={styles.confirmActions}>
                    <button onClick={onClose} className={styles.btnCancel}>
                        Hủy
                    </button>
                    <button onClick={onConfirm} className={styles.btnConfirm}>
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmModal;
