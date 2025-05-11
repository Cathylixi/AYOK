import torch
import os
import sys
from model import AudioClassifier  # 导入我们刚才创建的AudioClassifier类

print("正在加载预训练模型权重...")
try:
    checkpoint_path = 'speech_emotion_recognition_from_log_Mel_spectrogram_using_vertically_long_patch/weight/teacher_92.64_CREMA_D.ckpt'
    checkpoint = torch.load(checkpoint_path, map_location='cpu')
    
    print(f"成功加载权重文件: {checkpoint_path}")
except Exception as e:
    print(f"加载权重出错: {str(e)}")
    sys.exit(1)

print("初始化语音情感识别模型...")
model = AudioClassifier()

print("将预训练权重加载到模型...")
try:
    # 使用strict=False允许部分权重匹配
    model.load_state_dict(checkpoint['model_state_dict'], strict=False)
    print("模型权重加载成功")
except Exception as e:
    print(f"加载模型权重出错: {str(e)}")
    print("尝试查看checkpoint中的键...")
    print(f"Checkpoint keys: {list(checkpoint.keys())}")
    print(f"Model state_dict keys: {list(model.state_dict().keys())}")
    sys.exit(1)

# 设置为评估模式
model.eval()

print("创建用于导出的示例输入...")
# 创建与log-Mel频谱图相同形状的输入张量
dummy_input = torch.randn(1, 1, 64, 64)  # 批量大小为1，单通道，64x64大小

print("导出模型到ONNX格式...")
output_path = "emotion_ferplus_audio.onnx"
try:
    torch.onnx.export(
        model,                   # 要导出的模型
        dummy_input,             # 示例输入
        output_path,             # 输出文件路径
        input_names=["input"],   # 输入节点名称
        output_names=["output"], # 输出节点名称
        dynamic_axes=None,       # 不使用动态轴
        opset_version=12,        # ONNX操作集版本
        do_constant_folding=True # 启用常量折叠优化
    )
    print(f"✅ ONNX模型成功导出到: {output_path}")
except Exception as e:
    print(f"导出ONNX模型失败: {str(e)}")
    sys.exit(1)

print("ONNX模型导出完成，准备转换为CoreML格式")