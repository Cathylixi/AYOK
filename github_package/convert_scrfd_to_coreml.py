import coremltools as ct
import torch
import onnx
from onnx2torch import convert as onnx_to_torch
import io

# 1. Load ONNX model and convert to PyTorch model
print("Loading ONNX model...")
onnx_model = onnx.load("scrfd_person_2.5g.onnx")
print("Converting ONNX model to PyTorch model...")
pt_model = onnx_to_torch(onnx_model)

# 2. Convert PyTorch model to TorchScript model
print("Converting to TorchScript model...")
dummy_input = torch.randn(1, 3, 640, 640)
traced_model = torch.jit.trace(pt_model, dummy_input)
torch.jit.save(traced_model, "scrfd_person_2.5g.pt")

# 3. Use TorchScript model to convert to CoreML
print("Converting to CoreML model...")
coreml_model = ct.convert(
    model="scrfd_person_2.5g.pt",
    source="pytorch",
    convert_to="mlprogram",
    minimum_deployment_target=ct.target.iOS17,
    inputs=[ct.ImageType(shape=(1, 3, 640, 640), color_layout=ct.colorlayout.RGB)]
)

# 4. Save CoreML model (using .mlpackage extension)
coreml_model.save("scrfd_person_2.5g.mlpackage")

print("✅ CoreML model generated successfully!")