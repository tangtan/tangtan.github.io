import React from 'react';
import styles from './css/Thumbnail.module.css';
import defaultImage from '../assets/images/defaultThumbnailImage.png';

/**
 * 缩略图组件
 * @param {Object} props
 * @param {string} props.title - 缩略图标题
 * @param {string} [props.imageSrc] - 图片路径，如不提供则使用默认图片
 * @returns {JSX.Element}
 */
const Thumbnail = ({ title, imageSrc, onClick, className }) => {
  const imageUrl = imageSrc || defaultImage;
  
  // 只在内联样式中设置背景图片
  const containerStyle = {
    background: `linear-gradient(180deg, rgba(0, 0, 0, 0.00) 39.37%, rgba(13, 17, 23, 0.71) 79.66%, #0D1117 100%), url(${imageUrl}) lightgray 50% / cover no-repeat`
  };

  return (
    <div 
      style={containerStyle} 
      className={`${styles.thumbnailContainer} ${className || ''}`} 
      onClick={onClick}
    >
      <p className={styles.title}>{title}</p>
    </div>
  );
};

export default Thumbnail;
