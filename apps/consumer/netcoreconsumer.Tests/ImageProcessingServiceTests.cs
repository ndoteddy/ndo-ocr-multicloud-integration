using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using netcoreconsumer.Models;
using netcoreconsumer.Services;
using Xunit;

namespace netcoreconsumer.Tests
{
    public class ImageProcessingServiceTests
    {
        [Fact]
        public async Task ProcessAsync_SavesExtractedTextAndReturnsResult_WhenExtractionSucceeds()
        {
            var image = new ImageBase64 { imgName = "a.png", imgBase64 = "YWJj" };
            var response = new ImageResponseFromAWS
            {
                body = new ImageBody
                {
                    TextDetections = new List<ImageMetadata>
                    {
                        new ImageMetadata { DetectedText = "hello" },
                    },
                },
            };

            var textExtractionClient = new Mock<ITextExtractionClient>();
            textExtractionClient
                .Setup(c => c.ExtractTextAsync(image, It.IsAny<CancellationToken>()))
                .ReturnsAsync(response);

            ImageResult? savedResult = null;
            var repository = new Mock<IImageResultRepository>();
            repository
                .Setup(r => r.SaveAsync(It.IsAny<ImageResult>(), It.IsAny<CancellationToken>()))
                .Callback<ImageResult, CancellationToken>((result, _) => savedResult = result)
                .Returns(Task.CompletedTask);

            var service = new ImageProcessingService(textExtractionClient.Object, repository.Object);

            var result = await service.ProcessAsync(image);

            Assert.NotNull(result);
            Assert.Equal("a.png", result!.ImgName);
            Assert.Equal("hello", result.ImgContent);
            Assert.NotNull(savedResult);
            Assert.Equal("a.png", savedResult!.ImgName);
        }

        [Fact]
        public async Task ProcessAsync_ReturnsNullAndDoesNotSave_WhenExtractionFails()
        {
            var image = new ImageBase64 { imgName = "a.png", imgBase64 = "YWJj" };

            var textExtractionClient = new Mock<ITextExtractionClient>();
            textExtractionClient
                .Setup(c => c.ExtractTextAsync(image, It.IsAny<CancellationToken>()))
                .ReturnsAsync((ImageResponseFromAWS?)null);

            var repository = new Mock<IImageResultRepository>();

            var service = new ImageProcessingService(textExtractionClient.Object, repository.Object);

            var result = await service.ProcessAsync(image);

            Assert.Null(result);
            repository.Verify(r => r.SaveAsync(It.IsAny<ImageResult>(), It.IsAny<CancellationToken>()), Times.Never);
        }
    }
}
