import torch
import torch.nn as nn
import sys
import os

# 添加模型路径
repo_path = 'speech_emotion_recognition_from_log_Mel_spectrogram_using_vertically_long_patch'
sys.path.append(repo_path)

# 动态导入原始模型
from speech_emotion_recognition_from_log_Mel_spectrogram_using_vertically_long_patch.model import Teacher

# 修改CreateCoords函数，避免CUDA依赖
import speech_emotion_recognition_from_log_Mel_spectrogram_using_vertically_long_patch.model as original_model

# 保存原始函数
original_create_coords = original_model.CreateCoords

# 创建新函数，不使用CUDA
def cpu_create_coords(max_bs=32, x_dim=64, y_dim=64, with_r=False, skiptile=False):
    """Add coords to a tensor without CUDA dependency"""
    batch_size_tensor = max_bs

    xx_ones = torch.ones([1, x_dim], dtype=torch.int32)
    xx_ones = xx_ones.unsqueeze(-1)

    xx_range = torch.arange(y_dim, dtype=torch.int32).unsqueeze(0)
    xx_range = xx_range.unsqueeze(1)

    xx_channel = torch.matmul(xx_ones, xx_range)
    xx_channel = xx_channel.unsqueeze(-1)

    yy_ones = torch.ones([1, y_dim], dtype=torch.int32)
    yy_ones = yy_ones.unsqueeze(1)

    yy_range = torch.arange(x_dim, dtype=torch.int32).unsqueeze(0)
    yy_range = yy_range.unsqueeze(-1)

    yy_channel = torch.matmul(yy_range, yy_ones)
    yy_channel = yy_channel.unsqueeze(-1)

    xx_channel = xx_channel.permute(0, 3, 2, 1)
    yy_channel = yy_channel.permute(0, 3, 2, 1)

    xx_channel = xx_channel.float() / (x_dim - 1)
    yy_channel = yy_channel.float() / (y_dim - 1)

    xx_channel = xx_channel * 2 - 1
    yy_channel = yy_channel * 2 - 1

    coords = torch.cat([xx_channel, yy_channel], dim=1)
    coords = coords.repeat(batch_size_tensor, 1, 1, 1)

    return coords  # 返回CPU张量，不用CUDA

# 替换原始函数
original_model.CreateCoords = cpu_create_coords

class AudioClassifier(nn.Module):
    def __init__(self):
        super(AudioClassifier, self).__init__()
        # 使用README中提到的模型参数
        self.teacher = Teacher(
            image_size=(64, 64),
            patch_size=(16, 4),  # 垂直长patch，捕获时间-频率相关性
            num_classes=7,       # 7种情感类别
            dim=512,
            depth=6,
            heads=8,
            mlp_dim=1024,
            channels=1           # 灰度图像（mel频谱图）
        )
    
    def forward(self, x):
        # Teacher模型返回logits和特征，仅保留logits用于推理
        logits, _ = self.teacher(x)
        return logits 