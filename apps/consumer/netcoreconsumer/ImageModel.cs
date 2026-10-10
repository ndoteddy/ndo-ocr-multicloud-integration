using System;
using System.Collections.Generic;
using System.Text;

namespace netcoreconsumer
{
    class ImageModel
    {
    }

    public class ImageBase64
    {
        public string imgName { get; set; } = string.Empty;
        public string imgBase64 { get; set; } = string.Empty;
        public string result { set; get; }
    }


    public class ImageResult
    {
        public string ImgName { get; set; }
        public string ImgContent { get; set; }

    }

    public class ImageResponseFromAWS
    {
        public int statusCode { set; get; }
        public string remark { set; get; }

        public ImageBody body { set; get; }

    }

    public class ImageBody
    {
        public List<ImageMetadata> TextDetections { set; get; }
    }
    public class ImageMetadata
    {
        public string DetectedText { set; get; }
        public double Confidence { set; get; }
    }
}
