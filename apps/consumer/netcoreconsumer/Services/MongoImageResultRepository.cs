using System.Threading;
using System.Threading.Tasks;
using MongoDB.Driver;
using netcoreconsumer.Models;

namespace netcoreconsumer.Services
{
    public class MongoImageResultRepository : IImageResultRepository
    {
        private readonly IMongoCollection<ImageResult> _collection;

        public MongoImageResultRepository(string connectionString, string databaseName, string collectionName)
        {
            var settings = MongoClientSettings.FromConnectionString(connectionString);
            settings.ServerApi = new ServerApi(ServerApiVersion.V1);
            var client = new MongoClient(settings);
            _collection = client.GetDatabase(databaseName).GetCollection<ImageResult>(collectionName);
        }

        public async Task SaveAsync(ImageResult imageResult, CancellationToken cancellationToken = default)
        {
            var filter = Builders<ImageResult>.Filter.Eq(r => r.ImgName, imageResult.ImgName);
            await _collection.DeleteManyAsync(filter, cancellationToken).ConfigureAwait(false);
            await _collection.InsertOneAsync(imageResult, options: null, cancellationToken: cancellationToken).ConfigureAwait(false);
        }
    }
}
