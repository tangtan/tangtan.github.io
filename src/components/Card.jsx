import React from 'react';
import styles from './css/Card.module.css';
import defaultImage from '../assets/images/defaultCardImage.png';

/**
 * Card组件 - 展示出版物详细信息
 * @param {Object} props
 * @param {string} props.title - 标题
 * @param {string} props.authors - 作者信息
 * @param {string} props.backgroundImage - 背景图片
 * @param {string} props.publishTitle - 出版标题
 * @param {string} props.officialLink - 官方链接
 * @param {string} props.pdf - PDF链接
 * @param {string} props.video - 视频链接
 * @param {string} props.prototype - 原型链接
 * @param {string} props.className - 自定义类名
 * @param {number} props.maskType=3 - 遮罩类型（1、2或3）
 * @returns {JSX.Element}
 */
const Card = ({
    title,
    authors,
    backgroundImage,
    publishTitle,
    officialLink,
    pdf,
    video,
    prototype,
    className,
    onClick
}) => {
    const imageUrl = backgroundImage || defaultImage;

    // 背景图片样式
    const backgroundStyle = {
        background: `url(${imageUrl}) lightgray 18.903px -100.878px / 100% 197.467% no-repeat`
    };

    // 按钮渲染函数
    const renderButton = (text, link, handler) => {
        const isEnabled = !!link;
        const buttonClass = isEnabled ? styles.buttonEnabled : styles.buttonDisabled;

        return (
            <p
                className={`${styles.button} ${buttonClass}`}
                onClick={isEnabled ? handler : undefined}
            >
                {text}
            </p>
        );
    };

    // 处理各种按钮点击
    const handleLinkClick = () => window.open(officialLink, '_blank');
    const handlePdfClick = () => window.open(pdf, '_blank');
    const handleVideoClick = () => window.open(video, '_blank');
    const handlePrototypeClick = () => window.open(prototype, '_blank');

    return (
        <div className={`${styles.cardContainer} ${className || ''}`} onClick={onClick}>
            <div className={styles.backgroundImage} style={backgroundStyle}>
            <div className={styles.mask} id={styles.mask1}/>
            <div className={styles.mask} id={styles.mask2}/>
            <div className={styles.mask} id={styles.mask3}/>
            <div className={styles.content}>
                <p className={styles.title}>{title}</p>
                <p className={styles.author}>{authors}</p>
                <p className={styles.publishTitle}>{publishTitle}</p>

                <div className={styles.bottomButtonsContainer}>
                    {renderButton('LINK', officialLink, handleLinkClick)}
                    {renderButton('PDF', pdf, handlePdfClick)}
                    {renderButton('VIDEO', video, handleVideoClick)}
                    {renderButton('PROTOTYPE', prototype, handlePrototypeClick)}
                </div>
            </div>
                
            </div>
        </div>
    );
};

export default Card;
