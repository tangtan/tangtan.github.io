#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
清除所有publication目录下的metainfo.json文件
执行前会要求用户确认才进行清除
"""

import os
import glob
import sys

# 文件路径配置
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PUBLICATIONS_DIR = os.path.join(BASE_DIR, 'public', 'repository', 'publications')

def find_metainfo_files():
    """查找所有publication目录下的metainfo.json文件"""
    metainfo_files = []
    
    # 扫描publications目录
    for item in os.listdir(PUBLICATIONS_DIR):
        dir_path = os.path.join(PUBLICATIONS_DIR, item)
        if not os.path.isdir(dir_path):
            continue
        
        # 检查是否存在metainfo.json文件
        metainfo_file = os.path.join(dir_path, "metainfo.json")
        if os.path.exists(metainfo_file):
            metainfo_files.append(metainfo_file)
    
    return metainfo_files

def clear_metainfo_files():
    """清除所有publication目录下的metainfo.json文件"""
    # 查找所有metainfo.json文件
    metainfo_files = find_metainfo_files()
    
    if not metainfo_files:
        print("未找到任何metainfo.json文件，无需清除")
        return
    
    # 显示找到的文件
    print(f"找到以下{len(metainfo_files)}个metainfo.json文件：")
    for file_path in metainfo_files:
        print(f"  - {file_path}")
    
    # 要求用户确认清除
    print("\n警告：此操作将删除上述所有metainfo.json文件，此操作不可撤销！")
    confirm_text = "clear"
    user_input = input(f"请输入'{confirm_text}'确认删除，或输入其他内容取消：")
    
    if user_input != confirm_text:
        print("操作已取消，未删除任何文件")
        return
    
    # 删除文件
    deleted_count = 0
    for file_path in metainfo_files:
        try:
            os.remove(file_path)
            print(f"已删除: {file_path}")
            deleted_count += 1
        except Exception as e:
            print(f"删除{file_path}时出错: {e}")
    
    print(f"\n操作完成，共删除{deleted_count}个metainfo.json文件")

if __name__ == "__main__":
    try:
        clear_metainfo_files()
    except Exception as e:
        print(f"清除metainfo.json文件时出错: {e}") 