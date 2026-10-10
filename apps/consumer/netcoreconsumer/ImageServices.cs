using System;
using System.Collections.Generic;
using System.Text;
using MongoDB.Driver;
using MongoDB.Bson;

namespace netcoreconsumer
{
    class ImageServices
    {

        public static void SaveImageMetadata(ImageResult imageResult)
        {
            const string connectionUri = "<<YOUROWNMONGODBCLUSTERURL>>";
            var settings = MongoClientSettings.FromConnectionString(connectionUri);
            // Set the ServerApi field of the settings object to Stable API version 1
            settings.ServerApi = new ServerApi(ServerApiVersion.V1);
            // Create a new client and connect to the server
            var client = new MongoClient(settings);
            // Send a ping to confirm a successful connection
            try
            {
                var dbName = "dbnando_demo";
                var collectionName = "image_analysis_with_rekognition";

                var collection = client.GetDatabase(dbName).GetCollection<ImageResult>(collectionName);
                Console.WriteLine("Pinged your deployment. You successfully connected to MongoDB!");

                try
                { 
                    var filter = Builders<ImageResult>.Filter
                    .Eq(r => r.ImgName, imageResult.ImgName);
                    collection.DeleteMany(filter);
                    collection.InsertOne(imageResult);
                }
                catch (Exception e)
                {
                    Console.WriteLine($"Something went wrong trying to insert the new documents." +
                        $" Message: {e.Message}");
                    Console.WriteLine(e);
                    Console.WriteLine();
                    return;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }

        
    }
}
