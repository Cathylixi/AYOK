import coremltools as ct
import onnx
import torch
import os
import sys
from onnx2torch import convert as onnx_to_torch

# 输入和输出文件路径
input_path = "emotion_ferplus_audio.onnx"
output_path = "emotion_ferplus_audio.mlpackage"

print(f"开始将ONNX模型转换为CoreML...")

# 步骤1: 检查ONNX模型是否存在
if not os.path.exists(input_path):
    print(f"错误：ONNX模型文件 {input_path} 不存在，请先运行speech_export_to_onnx.py")
    sys.exit(1)

# 步骤2: 加载ONNX模型
print(f"正在加载ONNX模型: {input_path}")
try:
    onnx_model = onnx.load(input_path)
    print("ONNX模型加载成功")
except Exception as e:
    print(f"加载ONNX模型出错: {str(e)}")
    sys.exit(1)

# 步骤3: 将ONNX转换为PyTorch模型
print("将ONNX模型转换为PyTorch模型...")
try:
    pt_model = onnx_to_torch(onnx_model)
    pt_model.eval()
    print("PyTorch模型转换成功")
except Exception as e:
    print(f"转换PyTorch模型出错: {str(e)}")
    sys.exit(1)

# 步骤4: 创建TorchScript模型
print("创建TorchScript模型...")
try:
    dummy_input = torch.randn(1, 1, 64, 64)  # 与模型输入形状相同
    traced_model = torch.jit.trace(pt_model, dummy_input)
    temp_pt_path = "emotion_ferplus_audio.pt"
    torch.jit.save(traced_model, temp_pt_path)
    print(f"TorchScript模型保存到: {temp_pt_path}")
except Exception as e:
    print(f"创建TorchScript模型出错: {str(e)}")
    sys.exit(1)

# 步骤5: 转换为CoreML
print("转换为CoreML模型...")
try:
    mlmodel = ct.convert(
        model=temp_pt_path,
        source="pytorch",
        convert_to="mlprogram",  # 使用最新的ML程序格式
        minimum_deployment_target=ct.target.iOS15,  # 针对iOS 15+
        inputs=[
            ct.ImageType(
                name="input", 
                shape=(1, 1, 64, 64),  # 批量大小, 通道数, 高度, 宽度
                color_layout=ct.colorlayout.GRAYSCALE,  # 灰度图像(频谱图)
                scale=1.0 / 255.0  # 规范化输入
            )
        ]
    )
    print("CoreML模型转换成功")
except Exception as e:
    print(f"转换CoreML模型出错: {str(e)}")
    sys.exit(1)

# 步骤6: 添加元数据
print("添加模型元数据...")
mlmodel.author = "kjy7567 via iOS Converter"
mlmodel.short_description = "Speech Emotion Recognition from Log-Mel Spectrogram"
mlmodel.version = "1.0"

# 步骤7: 设置情感类别
emotion_categories = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]
try:
    # 尝试设置分类器输出
    mlmodel.user_defined_metadata["classes"] = ",".join(emotion_categories)
    print(f"添加情感分类: {emotion_categories}")
except Exception as e:
    print(f"添加情感分类失败，但不影响模型功能: {str(e)}")

# 步骤8: 保存CoreML模型
print(f"保存CoreML模型到: {output_path}")
try:
    mlmodel.save(output_path)
    print(f"✅ CoreML模型成功保存到: {output_path}")
    
    # 清理临时文件
    if os.path.exists(temp_pt_path):
        os.remove(temp_pt_path)
        print(f"已清理临时文件: {temp_pt_path}")
except Exception as e:
    print(f"保存CoreML模型出错: {str(e)}")
    sys.exit(1)

print("\n转换完成! 你现在可以将 emotion_ferplus_audio.mlpackage 添加到你的iOS项目中了。")
print("在iOS中使用该模型时，需要将音频信号转换为log-Mel频谱图，然后输入到模型中。")