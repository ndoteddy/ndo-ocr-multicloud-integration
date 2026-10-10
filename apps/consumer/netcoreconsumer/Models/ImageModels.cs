using System.Collections.Generic;

namespace netcoreconsumer.Models
{
    public class ImageBase64
    {
        public string imgName { get; set; } = string.Empty;
        public string imgBase64 { get; set; } = string.Empty;
    }

    public class ImageResult
    {
        public string ImgName { get; set; } = string.Empty;
        public string ImgContent { get; set; } = string.Empty;
    }

    public class ImageResponseFromAWS
    {
        public int statusCode { get; set; }
        public string? remark { get; set; }
        public ImageBody? body { get; set; }
    }

    public class ImageBody
    {
        public List<ImageMetadata> TextDetections { get; set; } = new();
    }

    public class ImageMetadata
    {
        public string DetectedText { get; set; } = string.Empty;
        public double Confidence { get; set; }
    }
}
