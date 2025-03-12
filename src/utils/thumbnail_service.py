from PIL import Image
from pathlib import Path
import requests
import base64
import re
from io import BytesIO

Image.MAX_IMAGE_PIXELS = None
IMAGE_FORMAT = {'P', 'L', 'RGBA'}
IMAGE_TYPE = { '.jpg', '.jpeg', '.bmp', '.png', '.tif' }


def _gen_thumbnail_keep_ratio(image, max_size=2048):
    """
    生成缩略图, 保持纵横比, 并且缩放到长边不超过 max_size
    """
    w, h = image.size
    if h >= w:
        ratio = w / h
        if h > max_size:
            new_h = max_size
            new_w = int(new_h * ratio)
            image = image.resize((new_w, new_h))
    else:
        ratio = h / w
        if w > max_size:
            new_w = max_size
            new_h = int(new_w * ratio)
            image = image.resize((new_w, new_h))
    return image


def _gen_thumbnail_center_crop(image, max_size, t=2):
    """
    生成缩略图, 从中心裁剪出 1:t 或 t:1 的区域, 并且缩放到长边不超过 max_size

    [d * td] or [td * d]
    Total size: td^2 = 2048^2
        --> d = 1448 --> 2d = 2896 (t=2)
        --> d = 1024 --> td = 4096 (t=4)
    """
    w, h = image.size
    if h > w:   # h > 2w
        y1 = (h - t * w) // 2
        y2 = y1 + t * w
        image = image.crop((0, y1, w, y2))
    else:
        x1 = (w - t * h) // 2
        x2 = x1 + t * h
        image = image.crop((x1, 0, x2, h))

    w, h = image.size
    # 缩小到 target
    if h > w:
        if h > max_size:
            image = image.resize((max_size // t, max_size))
    else:
        if w > max_size:
            image = image.resize((max_size, max_size // t))
    return image


def extract_thumbnail(image, max_size=2048, target=(0.5, 2)):
    """
    从 PIL.Image 图像中自动生成缩略图. 缩略图自动生成规则:

    1. 获取图像宽高比 ratio
    #. 如果 target[0] <= ratio <= target[1] (Type-1), 则保留原始宽高比, 图像缩放到长边 <= max_size
        (Let t=target[1])
    #. 如果 ratio < target[0], 则取宽高比为 1:t 的中心区域 R1, 图像缩放到 R1 的面积 <= max_size^2
    #. 如果 ratio > target[1], 则取宽高比为 t:1 的中心区域 R2, 图像缩放到 R2 的面积 <= max_size^2


    Parameters
    ----------
    image: Image.Image
        Original image, (H, W, C)
    max_size: int
        Maximum size of the thumbnail.
    target: tuple
        Target ratio interval

    Returns
    -------
    thumbnail: Image.Image
        Thumbnail image, (h, w, c)
    """
    # 如果需要, 转换图像格式 (RGBA|P|L -> RGB)
    if image.mode in IMAGE_FORMAT:
        image = image.convert('RGB')

    w, h = image.size
    ratio = w / h
    if target[0] <= ratio < target[1]:
        return _gen_thumbnail_keep_ratio(image, max_size)
    else:
        t = target[1]
        max_size2 = int((max_size * max_size / t) ** 0.5 * t)
        return _gen_thumbnail_center_crop(image, max_size2, t)


def load_image_from_source(image_src):
    """支持多种图片源加载的统一入口"""
    # 判断是否为URL
    if image_src.startswith(('http://', 'https://')):
        try:
            response = requests.get(image_src, timeout=10)
            response.raise_for_status()
            return Image.open(BytesIO(response.content))
        except requests.exceptions.RequestException as e:
            raise ValueError(f"图片下载失败: {str(e)}")
    
    # 判断是否为Base64
    if re.match(r'^data:image/\w+;base64,', image_src):
        try:
            # 提取base64数据部分
            header, data = image_src.split(',', 1)
            # 移除可能的换行符和空格
            data = data.replace('\n', '').replace(' ', '')
            return Image.open(BytesIO(base64.b64decode(data)))
        except ValueError as e:
            raise ValueError(f"Base64解码失败: {str(e)}")
    
    # 默认为本地文件路径
    path = Path(image_src)
    if not path.exists():
        raise FileNotFoundError(f"文件 {image_src} 不存在")
    return Image.open(path)


def single_thumbnail(image_src, thumbnail_size, group_name=''):
    """支持多种图片源输入的缩略图生成"""
    try:
        # 统一加载图片
        with load_image_from_source(image_src) as img:
            print(f"原始尺寸: {img.size}")
            
            # 生成缩略图
            thumbnail = extract_thumbnail(img, thumbnail_size)
            print(f"缩略图尺寸: {thumbnail.size}")
            
            # 生成输出路径（根据输入类型处理）
            if isinstance(image_src, Path) or '/' not in image_src:
                # 本地文件路径处理
                path = Path(image_src)
                thumb_dir = f"{thumbnail_size}_thumb_output" if group_name == '' else group_name
                output_path = path.parent / thumb_dir / f"{path.stem}_{thumbnail_size}_thumb{path.suffix}"
            else:
                # 网络URL或Base64生成随机文件名
                import uuid
                output_path = Path(f"{uuid.uuid4().hex}.jpg")
                
            output_path.parent.mkdir(parents=True, exist_ok=True)
            thumbnail.save(output_path)
            print(f"已保存缩略图到: {output_path}")
            
    except Exception as e:
        print(f"处理图片时发生错误: {str(e)}")


def dir_batch_process(dir_path, thumbnail_size, group_name):
    """处理目录下的所有图片"""
    path = Path(dir_path)
    if not path.exists() or not path.is_dir():
        print(f"错误：目录 {dir_path} 不存在或不是有效目录")
        return

    # 使用预定义的图片类型进行过滤
    image_files = [f for f in path.glob("*") if f.suffix.lower() in IMAGE_TYPE and f.is_file()]

    if not image_files:
        print("目录中没有支持的图片文件（支持格式：{}）".format(', '.join(IMAGE_TYPE)))
        return

    print(f"发现 {len(image_files)} 张图片，开始批量处理...")
    for idx, img_path in enumerate(image_files, 1):
        print(f"\n处理第 {idx}/{len(image_files)} 张：{img_path.name}")
        single_thumbnail(img_path, thumbnail_size, group_name)


if __name__ == '__main__':
    # 启动主程序
    # dir_batch_process('../data/origin', 720, "medium_resolution")
    # dir_batch_process('../data/origin', 460, 'low_resolution')

    single_thumbnail('https://api.data.zjuidg.org/prp-images/resource/%E5%85%AB%E8%BE%BE%E6%98%A5%E6%B8%B8%E5%9B%BE.png', 720, "http")

    base64_data = ''
    with open("../data/百子图_base64.txt", "r") as f:  # 打开文件
        base64_data = f.read()  # 读取文件
    single_thumbnail(base64_data, 720, "base64")