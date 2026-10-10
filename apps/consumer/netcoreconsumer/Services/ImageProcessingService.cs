using System.Threading;
using System.Threading.Tasks;
using netcoreconsumer.Models;

namespace netcoreconsumer.Services
{
    public class ImageProcessingService
    {
        private readonly ITextExtractionClient _textExtractionClient;
        private readonly IImageResultRepository _imageResultRepository;

        public ImageProcessingService(ITextExtractionClient textExtractionClient, IImageResultRepository imageResultRepository)
        {
            _textExtractionClient = textExtractionClient;
            _imageResultRepository = imageResultRepository;
        }

        public async Task<ImageResult?> ProcessAsync(ImageBase64 image, CancellationToken cancellationToken = default)
        {
            var response = await _textExtractionClient.ExtractTextAsync(image, cancellationToken).ConfigureAwait(false);
            if (response is null)
            {
                return null;
            }

            var imageResult = new ImageResult
            {
                ImgName = image.imgName,
                ImgContent = OcrTextExtractor.ExtractDetectedText(response),
            };

            await _imageResultRepository.SaveAsync(imageResult, cancellationToken).ConfigureAwait(false);
            return imageResult;
        }
    }
}
