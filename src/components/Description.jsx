import React from 'react';
import styles from './css/Description.module.css';

/**
 * Description组件
 * @param {Object} props
 * @param {string} props.title - 标题文本
 * @param {React.ReactNode} props.children - 内容部分，可以是文本或任何React组件
 * @returns {JSX.Element}
 */
const Description = ({ title, children, className, contentClassName }) => {
    return (
        <div className={`${styles.descriptionContainer} ${className || ''}`}>
            <p className={styles.title}>{title}</p>
            <div className={styles.splitLine}></div>
            <div className={`${styles.descriptionContent} ${contentClassName || ''}`}>
                {children}
            </div>
        </div>
    );
};

export default Description;
