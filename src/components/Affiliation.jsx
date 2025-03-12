import React from 'react';
import styles from './css/Affiliation.module.css';
import zjuIcon from '../assets/icons/zju.png';
/**
 * Affiliation组件 - 展示学术/工作单位信息
 * @param {Object} props 
 * @param {string} props.lab - 实验室/机构名称
 * @param {string} props.school - 学校名称
 * @param {Array} props.positions - 职位信息数组
 * @param {Object[]} props.positions - 职位对象数组
 * @param {string} props.positions[].name - 职位名称
 * @returns {JSX.Element}
 */
const Affiliation = ({ lab, school, positions = [] }) => {
    return (
        <div className={styles.affiliation}>
            {/* 单位信息区块 */}
            <div className={styles.unitContainer}>
                <div className={styles.iconAndSplitContainer}>
                    <img 
                        src={zjuIcon} 
                        alt="单位图标" 
                        className={styles.icon}
                    />
                    <div className={styles.splitLine} />
                </div>
                <p className={styles.lab}>{lab}</p>
                <p className={styles.school}>{school}</p>
            </div>
            {/* 职位标签区块 */}
            <div className={styles.positionsContainer}>
                {positions.map((position, index) => (
                    <p key={index} className={styles.position}>
                        {position}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default Affiliation;
