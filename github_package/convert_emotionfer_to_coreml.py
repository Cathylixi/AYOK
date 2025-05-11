import coremltools as ct
import torch
import onnx
import numpy as np

class EmotionFERWrapper(torch.nn.Module):
    def __init__(self):
        super(EmotionFERWrapper, self).__init__()
        # We will use ONNX Runtime to call the model in the forward method
        
    def forward(self, x):
        # This forward method will be traced, but in reality we will replace it with the real ONNX model
        # Currently we just return dummy data with the same shape as the expected output
        # Assuming the output is probabilities for 8 emotion categories
        return torch.softmax(torch.randn(1, 8), dim=1)

# 1. Create a dummy PyTorch model
print("Creating PyTorch wrapper model...")
wrapper_model = EmotionFERWrapper()
wrapper_model.eval()  # Set to evaluation mode

# 2. Create a traced model using random input
print("Tracing model...")
dummy_input = torch.randn(1, 1, 64, 64)  # batch size of 1, 1 channel (grayscale), 64x64 pixels
traced_model = torch.jit.trace(wrapper_model, dummy_input)

# 3. Convert to CoreML
print("Converting to CoreML model...")
coreml_model = ct.convert(
    traced_model,
    source="pytorch",
    convert_to="mlprogram",
    inputs=[ct.ImageType(name="input", shape=(1, 1, 64, 64), color_layout=ct.colorlayout.GRAYSCALE)],
    minimum_deployment_target=ct.target.iOS15,
    compute_units=ct.ComputeUnit.CPU_ONLY
)

# 4. Set metadata
print("Setting metadata...")
coreml_model.author = "AYOK"
coreml_model.short_description = "FER+ Emotion Recognition"
coreml_model.version = "1.0"

# 5. Set output description
emotion_names = ['neutral', 'happiness', 'surprise', 'sadness', 'anger', 'disgust', 'fear', 'contempt']
output = coreml_model.output_description
output_names = [name for name in output]

if len(output_names) > 0:
    output_name = output_names[0]
    print(f"Setting description for output {output_name}")
    coreml_model.output_description[output_name] = "Emotion probabilities"

# 6. Save the model
print("Saving model...")
coreml_model.save("/Users/wgl/Desktop/AYOK/github_package/emotion-ferplus-8-wrapper.mlpackage")
print("✅ CoreML wrapper model created successfully!")
print("Note: This is a placeholder model that needs to be used with the actual ONNX model in iOS applications")