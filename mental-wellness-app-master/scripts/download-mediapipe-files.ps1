$baseUrl = "https://github.com/google/mediapipe/raw/master/mediapipe/modules/face_detection"
$outputDir = "public/models/face_detection"

# 确保输出目录存在
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
}

# 要下载的文件列表
$files = @(
    @{
        Name = "face_detection_short.binarypb"
        Url = "$baseUrl/face_detection_short.binarypb"
    },
    @{
        Name = "face_detection_short_range.tflite"
        Url = "$baseUrl/face_detection_short_range.tflite"
    }
)

# 下载每个文件
foreach ($file in $files) {
    $outputPath = Join-Path $outputDir $file.Name
    Write-Host "Downloading $($file.Name)..."
    try {
        # 检查文件是否已存在
        if (Test-Path $outputPath) {
            Write-Host "File $($file.Name) already exists, skipping download."
            continue
        }
        
        Invoke-WebRequest -Uri $file.Url -OutFile $outputPath
        Write-Host "Successfully downloaded $($file.Name)"
    }
    catch {
        Write-Host "Error downloading $($file.Name): $_"
    }
}

Write-Host "Download process completed." 