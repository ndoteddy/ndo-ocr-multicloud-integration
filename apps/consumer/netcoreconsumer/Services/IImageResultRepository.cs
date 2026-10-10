using System.Threading;
using System.Threading.Tasks;
using netcoreconsumer.Models;

namespace netcoreconsumer.Services
{
    public interface IImageResultRepository
    {
        Task SaveAsync(ImageResult imageResult, CancellationToken cancellationToken = default);
    }
}
