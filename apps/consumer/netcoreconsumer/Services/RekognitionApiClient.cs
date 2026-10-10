using System.Net.Http;
using System.Net.Http.Json;
using System.Threading;
using System.Threading.Tasks;
using netcoreconsumer.Models;

namespace netcoreconsumer.Services
{
    public class RekognitionApiClient : ITextExtractionClient
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiGatewayUrl;
        private readonly string _apiKey;

        public RekognitionApiClient(HttpClient httpClient, string apiGatewayUrl, string apiKey)
        {
            _httpClient = httpClient;
            _apiGatewayUrl = apiGatewayUrl;
            _apiKey = apiKey;
        }

        public async Task<ImageResponseFromAWS?> ExtractTextAsync(ImageBase64 image, CancellationToken cancellationToken = default)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, _apiGatewayUrl)
            {
                Content = JsonContent.Create(image),
            };
            request.Headers.Add("x-api-key", _apiKey);

            using var response = await _httpClient.SendAsync(request, cancellationToken).ConfigureAwait(false);
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            return await response.Content.ReadFromJsonAsync<ImageResponseFromAWS>(cancellationToken: cancellationToken).ConfigureAwait(false);
        }
    }
}
