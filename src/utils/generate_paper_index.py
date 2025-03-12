#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
import glob
import bibtexparser
from bibtexparser.bparser import BibTexParser
from bibtexparser.customization import convert_to_unicode
import re
import sys
import fitz  # PyMuPDF
import io

# 添加当前目录到系统路径，以便导入同级模块
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
# 导入缩略图服务模块
from thumbnail_service import extract_thumbnail, Image

# 文件路径配置
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PUBLICATIONS_DIR = os.path.join(BASE_DIR, 'public', 'repository', 'publications')
OUTPUT_FILE = os.path.join(BASE_DIR, 'public', 'repository', 'paper_index.json')

THUMBNAIL_SIZE = 460  # 从论文pdf中进行缩略的尺寸大小
EXTRACT_IMAGE_COUNT = 1  # 从论文pdf中提取图片的个数
FILTRATION_IMAGE_SIZE = (460, 200)  # 从论文pdf中提取图片的最小尺寸 Width, Height

def load_existing_index():
    """加载现有的paper_index.json文件，如果存在的话"""
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError:
            print(f"警告: {OUTPUT_FILE}不是有效的JSON文件，将创建新文件")
    
    # 如果文件不存在或无效，返回基本结构
    return {"fileName": "paper_index.json", "publications": []}

def load_metainfo_json(file_path):
    """加载单个publication的metainfo.json文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"警告: 加载{file_path}时出错: {e}")
        return None

def parse_bibtex_file(dir_path):
    """解析目录中的BibTeX文件并返回数据"""
    bibtex_files = glob.glob(os.path.join(dir_path, "*.bib"))
    if not bibtex_files:
        print(f"警告: 在{dir_path}中没有找到BibTeX文件")
        return None
    
    # 使用第一个找到的BibTeX文件
    bibtex_file = bibtex_files[0]
    
    parser = BibTexParser()
    parser.customization = convert_to_unicode
    
    with open(bibtex_file, 'r', encoding='utf-8') as f:
        try:
            bib_database = bibtexparser.load(f, parser=parser)
            if bib_database.entries:
                return bib_database.entries[0]  # 返回第一个条目
        except Exception as e:
            print(f"解析BibTeX文件{bibtex_file}时出错: {e}")
    
    return None

def get_publication_type(entry_type):
    """根据BibTeX条目类型确定publication类型"""
    if entry_type.lower() in ['inproceedings', 'conference']:
        return "conference"
    elif entry_type.lower() == 'article':
        return "journal"
    else:
        return "other"

def get_resource_files(dir_path, pub_id):
    """获取资源文件的路径"""
    resources = {}
    
    # 查找PDF文件
    pdf_files = glob.glob(os.path.join(dir_path, "*.pdf"))
    if pdf_files:
        pdf_path = f"/repository/publications/{pub_id}/{os.path.basename(pdf_files[0])}"
        resources["pdf"] = pdf_path
    
    # 查找视频文件
    video_extensions = ['*.mp4', '*.avi', '*.mov', '*.mkv', '*.webm']
    video_files = []
    for ext in video_extensions:
        video_files.extend(glob.glob(os.path.join(dir_path, ext)))
    
    if video_files:
        video_path = f"/repository/publications/{pub_id}/{os.path.basename(video_files[0])}"
        resources["video"] = video_path
    
    return resources

def get_thumbnail_files(dir_path, pub_id):
    """获取缩略图文件路径"""
    thumbnails = []
    
    # 查找图片文件
    image_files = []
    for ext in ['*.png', '*.jpg', '*.jpeg', '*.gif']:
        image_files.extend(glob.glob(os.path.join(dir_path, ext)))
    
    # 如果找到图片文件，使用现有图片作为缩略图
    if image_files:
        # 使用找到的图片文件作为缩略图
        for img_file in image_files[:EXTRACT_IMAGE_COUNT]:  # 最多使用前两张图片
            img_path = f"/repository/publications/{pub_id}/{os.path.basename(img_file)}"
            thumbnails.append(img_path)
    else:
        # 如果没有找到图片文件，尝试从PDF中提取嵌入的图像
        pdf_files = glob.glob(os.path.join(dir_path, "*.pdf"))
        if pdf_files:
            pdf_file = pdf_files[0]
            print(f"从PDF文件中提取嵌入图片: {pdf_file}")
            
            try:
                # 打开PDF文件
                pdf_document = fitz.open(pdf_file)
                extracted_images = []
                
                # 遍历PDF页面提取图片
                for page_num in range(len(pdf_document)):
                    page = pdf_document[page_num]
                    image_list = page.get_images(full=True)
                    
                    # 按顺序处理每个图像
                    for img_index, img_info in enumerate(image_list):
                        xref = img_info[0]  # 图像的xref号
                        
                        # 获取图像基本信息
                        base_image = pdf_document.extract_image(xref)
                        image_bytes = base_image["image"]
                        image_ext = base_image["ext"]
                        
                        # 将图像字节流转换为PIL图像对象
                        try:
                            image = Image.open(io.BytesIO(image_bytes))
                            
                            # 过滤掉太小的图像，可能是图标或不重要的元素
                            width, height = image.size
                            if width >= FILTRATION_IMAGE_SIZE[0] and height >= FILTRATION_IMAGE_SIZE[1]:  # 过滤标准可以根据需要调整
                                extracted_images.append(image)
                            
                            # 如果已经找到足够的图片，则退出循环
                            if len(extracted_images) >= EXTRACT_IMAGE_COUNT:
                                break
                        except Exception as e:
                            print(f"处理PDF中的图片时出错: {e}")
                            continue
                    
                    # 如果已经找到足够的图片，则退出外层循环
                    if len(extracted_images) >= EXTRACT_IMAGE_COUNT:
                        break
                
                # 关闭PDF文档
                pdf_document.close()
                
                # 处理提取到的图像，生成缩略图
                for i, img in enumerate(extracted_images[:EXTRACT_IMAGE_COUNT], 1):
                    # 生成缩略图文件名
                    thumb_filename = f"{pub_id}_thumbnail_{i}.jpg"
                    thumb_path = os.path.join(dir_path, thumb_filename)
                    
                    # 调用缩略图服务生成缩略图
                    thumbnail = extract_thumbnail(img, max_size=460)
                    
                    # 保存缩略图
                    thumbnail.save(thumb_path, format="JPEG", quality=95)
                    print(f"已保存缩略图: {thumb_path}")
                    
                    # 添加到缩略图列表
                    thumb_url = f"/repository/publications/{pub_id}/{thumb_filename}"
                    thumbnails.append(thumb_url)
                    
            except Exception as e:
                print(f"从PDF提取图片时出错: {e}")
    
    return thumbnails

def parse_authors(author_string):
    """解析作者字符串，返回作者列表"""
    if not author_string:
        return []
        
    # 分隔作者名单
    authors = re.split(r' and ', author_string)
    # 清理空白和格式化
    authors = [author.strip() for author in authors if author.strip()]
    return authors

def generate_single_metainfo(dir_path, pub_id, existing_data=None):
    """为单个publication生成metainfo.json文件"""
    # 检查是否已经存在metainfo.json文件，如果存在则跳过
    metainfo_file = os.path.join(dir_path, "metainfo.json")
    if os.path.exists(metainfo_file):
        print(f"跳过 {pub_id}: metainfo.json 已存在")
        return True
    
    # 从现有数据获取已有信息，如果存在的话
    existing_publications = {pub.get('id'): pub for pub in existing_data.get('publications', [])} if existing_data else {}
    publication = existing_publications.get(pub_id, {})
    
    # 解析BibTeX文件
    bibtex_data = parse_bibtex_file(dir_path)
    if not bibtex_data:
        print(f"跳过{pub_id}: 无法解析BibTeX数据")
        return None
    
    # 更新基本字段
    publication["id"] = pub_id
    publication["type"] = get_publication_type(bibtex_data.get('ENTRYTYPE', ''))
    publication["title"] = bibtex_data.get('title', '')
    
    # 关键词
    keywords_str = bibtex_data.get('keywords', '')
    keywords = [kw.strip() for kw in re.split(r',|;', keywords_str) if kw.strip()]
    publication["keywords"] = keywords
    
    # 作者
    authors = parse_authors(bibtex_data.get('author', ''))
    publication["authors"] = authors
    
    # 出版社信息
    publication["publisher"] = bibtex_data.get('publisher', '')
    
    # 年份和DOI
    try:
        publication["year"] = int(bibtex_data.get('year', 0))
    except ValueError:
        publication["year"] = 0

    # 出版物标题(期刊名或会议名) 加年份
    if publication["type"] == "conference":
        publication["publishTitle"] = str(publication["year"]) + ' ' + bibtex_data.get('booktitle', '')
    else:
        publication["publishTitle"] = str(publication["year"]) + ' ' + bibtex_data.get('journal', '')
        
    publication["doi"] = bibtex_data.get('doi', '')
    
    # 初始化resources字段及其子属性
    publication["resources"] = {
        "official": f"https://doi.org/{publication['doi']}" if publication['doi'] else "",
        "pdf": "",
        "video": "",
        "prototype": ""
    }
    
    # 获取资源文件路径
    resources = get_resource_files(dir_path, pub_id)
    
    # 更新找到的资源文件
    if "pdf" in resources:
        publication["resources"]["pdf"] = resources["pdf"]
    
    if "video" in resources:
        publication["resources"]["video"] = resources["video"]
    
    # 缩略图
    thumbnails = get_thumbnail_files(dir_path, pub_id)
    if thumbnails:
        publication["thumbnails"] = thumbnails
    else:
        publication["thumbnails"] = []
    
    # 初始化标签和奖项为空列表
    publication["tags"] = []
    publication["highlight"] = False
    publication["awards"] = []
    
    # 保存到单独的metainfo.json文件
    with open(metainfo_file, 'w', encoding='utf-8') as f:
        json.dump(publication, f, ensure_ascii=False, indent=2)
    
    print(f"已生成: {metainfo_file}")
    return publication

def generate_paper_index():
    """生成所有单个metainfo.json文件，然后询问用户是否合并为paper_index.json"""
    # 加载现有的paper_index.json，如果存在的话
    existing_data = load_existing_index()
    
    # 记录所有生成的metainfo文件路径
    metainfo_files = []
    
    # 记录处理的publication数量
    processed_count = 0
    skipped_count = 0
    
    # 扫描publications目录，为每个文件夹生成单独的metainfo.json
    for item in os.listdir(PUBLICATIONS_DIR):
        dir_path = os.path.join(PUBLICATIONS_DIR, item)
        if not os.path.isdir(dir_path):
            continue
        
        pub_id = item  # 使用目录名作为ID
        metainfo_file = os.path.join(dir_path, "metainfo.json")
        
        # 检查是否已经存在metainfo.json
        if os.path.exists(metainfo_file):
            print(f"跳过 {pub_id}: metainfo.json 已存在")
            skipped_count += 1
        else:
            # 生成单个metainfo.json
            result = generate_single_metainfo(dir_path, pub_id, existing_data)
            if result is not None:
                processed_count += 1
        
        # 记录metainfo文件路径（无论是新生成的还是已存在的）
        metainfo_files.append(metainfo_file)
    
    # 如果没有找到任何publication文件夹，直接退出
    if not metainfo_files:
        print("没有找到任何publication文件夹，程序退出")
        return
    
    # 提示用户检查和修改单个metainfo.json文件
    print(f"\n已处理 {processed_count} 个publication目录，跳过 {skipped_count} 个已有metainfo.json的目录")
    print("请检查并手动修改这些文件。")
    print(f"文件位置：{', '.join(metainfo_files)}")
    
    # 等待用户确认是否合并为paper_index.json
    user_input = input("\n是否将所有metainfo.json合并为paper_index.json? (y/n): ").strip().lower()
    
    if user_input in ['y', 'yes']:
        # 合并所有metainfo.json为paper_index.json
        merge_metainfo_to_index(metainfo_files)
    else:
        print("用户选择不合并，程序退出")

def merge_metainfo_to_index(metainfo_files):
    """将所有metainfo.json合并为paper_index.json"""
    publications = []
    
    # 加载所有metainfo.json文件
    for file_path in metainfo_files:
        metainfo = load_metainfo_json(file_path)
        if metainfo:
            publications.append(metainfo)
    
    # 按年份排序，最新的排在前面
    publications.sort(key=lambda x: x.get('year', 0), reverse=True)
    
    # 构建最终数据
    final_data = {
        "fileName": "paper_index.json",
        "publications": publications
    }
    
    # 保存到文件
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
    
    print(f"成功生成论文索引文件: {OUTPUT_FILE}")
    print(f"共处理了 {len(publications)} 篇论文")

if __name__ == "__main__":
    try:
        generate_paper_index()
    except Exception as e:
        print(f"生成论文索引时出错: {e}")