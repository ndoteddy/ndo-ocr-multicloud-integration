using System.Linq;
using netcoreconsumer.Models;

namespace netcoreconsumer.Services
{
    public static class OcrTextExtractor
    {
        public static string ExtractDetectedText(ImageResponseFromAWS? response)
        {
            var detections = response?.body?.TextDetections;
            if (detections is null || detections.Count == 0)
            {
                return string.Empty;
            }

            return string.Join(" ", detections.Select(d => d.DetectedText));
        }
    }
}
