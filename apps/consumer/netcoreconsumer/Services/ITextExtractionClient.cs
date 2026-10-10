using System.Threading;
using System.Threading.Tasks;
using netcoreconsumer.Models;

namespace netcoreconsumer.Services
{
    public interface ITextExtractionClient
    {
        Task<ImageResponseFromAWS?> ExtractTextAsync(ImageBase64 image, CancellationToken cancellationToken = default);
    }
}
