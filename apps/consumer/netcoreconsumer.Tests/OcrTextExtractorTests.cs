using System.Collections.Generic;
using netcoreconsumer.Models;
using netcoreconsumer.Services;
using Xunit;

namespace netcoreconsumer.Tests
{
    public class OcrTextExtractorTests
    {
        [Fact]
        public void ExtractDetectedText_JoinsAllDetectedTextFragments()
        {
            var response = new ImageResponseFromAWS
            {
                body = new ImageBody
                {
                    TextDetections = new List<ImageMetadata>
                    {
                        new ImageMetadata { DetectedText = "Hello", Confidence = 99.1 },
                        new ImageMetadata { DetectedText = "World", Confidence = 98.2 },
                    },
                },
            };

            var result = OcrTextExtractor.ExtractDetectedText(response);

            Assert.Equal("Hello World", result);
        }

        [Fact]
        public void ExtractDetectedText_ReturnsEmptyString_WhenNoDetections()
        {
            var response = new ImageResponseFromAWS { body = new ImageBody() };

            var result = OcrTextExtractor.ExtractDetectedText(response);

            Assert.Equal(string.Empty, result);
        }

        [Fact]
        public void ExtractDetectedText_ReturnsEmptyString_WhenResponseIsNull()
        {
            var result = OcrTextExtractor.ExtractDetectedText(null);

            Assert.Equal(string.Empty, result);
        }

        [Fact]
        public void ExtractDetectedText_ReturnsEmptyString_WhenBodyIsNull()
        {
            var response = new ImageResponseFromAWS { body = null };

            var result = OcrTextExtractor.ExtractDetectedText(response);

            Assert.Equal(string.Empty, result);
        }
    }
}
