using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Confluent.Kafka;
using Microsoft.Extensions.Configuration;
using netcoreconsumer.Configuration;
using netcoreconsumer.Models;
using netcoreconsumer.Services;

namespace netcoreconsumer
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(AppContext.BaseDirectory)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
                .AddEnvironmentVariables()
                .Build();

            var options = LoadOptions(configuration);

            using var httpClient = new HttpClient();
            var textExtractionClient = new RekognitionApiClient(httpClient, options.ApiGatewayUrl, options.ApiKey);
            var imageResultRepository = new MongoImageResultRepository(options.MongoConnectionString, options.MongoDatabaseName, options.MongoCollectionName);
            var imageProcessingService = new ImageProcessingService(textExtractionClient, imageResultRepository);

            var consumerConfig = new ConsumerConfig
            {
                BootstrapServers = options.KafkaBootstrapServers,
                GroupId = options.KafkaGroupId,
                AutoOffsetReset = AutoOffsetReset.Earliest,
                SecurityProtocol = Enum.Parse<SecurityProtocol>(options.KafkaSecurityProtocol, ignoreCase: true),
                SaslMechanism = Enum.Parse<SaslMechanism>(options.KafkaSaslMechanism, ignoreCase: true),
                SaslUsername = options.KafkaSaslUsername,
                SaslPassword = options.KafkaSaslPassword,
            };

            using var cts = new CancellationTokenSource();
            Console.CancelKeyPress += (_, e) =>
            {
                e.Cancel = true; // prevent the process from terminating.
                cts.Cancel();
            };

            using var consumer = new ConsumerBuilder<string, string>(consumerConfig).Build();
            consumer.Subscribe(options.KafkaTopic);

            try
            {
                while (true)
                {
                    var consumeResult = consumer.Consume(cts.Token);
                    Console.WriteLine($"Consumed event from topic {options.KafkaTopic} with key {consumeResult.Message.Key,-10} and value {consumeResult.Message.Value}");

                    var image = JsonSerializer.Deserialize<ImageBase64>(consumeResult.Message.Value);
                    if (image is null)
                    {
                        Console.WriteLine("Skipping message: could not deserialize payload.");
                        continue;
                    }

                    try
                    {
                        var result = await imageProcessingService.ProcessAsync(image, cts.Token).ConfigureAwait(false);
                        Console.WriteLine(result is null
                            ? $"Failed to process image '{image.imgName}': text extraction call did not succeed."
                            : $"Saved analysis for '{result.ImgName}'.");
                    }
                    catch (Exception ex) when (ex is not OperationCanceledException)
                    {
                        Console.WriteLine($"Error processing image '{image.imgName}': {ex}");
                    }
                }
            }
            catch (OperationCanceledException)
            {
                // Ctrl-C was pressed.
            }
            finally
            {
                consumer.Close();
            }
        }

        private static ConsumerOptions LoadOptions(IConfiguration configuration)
        {
            return new ConsumerOptions
            {
                MongoConnectionString = RequireValue(configuration, "Mongo:ConnectionString"),
                MongoDatabaseName = configuration["Mongo:DatabaseName"] ?? "dbnando_demo",
                MongoCollectionName = configuration["Mongo:CollectionName"] ?? "image_analysis_with_rekognition",
                ApiGatewayUrl = RequireValue(configuration, "ApiGateway:Url"),
                ApiKey = RequireValue(configuration, "ApiGateway:ApiKey"),
                KafkaBootstrapServers = RequireValue(configuration, "Kafka:BootstrapServers"),
                KafkaSecurityProtocol = configuration["Kafka:SecurityProtocol"] ?? "SaslSsl",
                KafkaSaslMechanism = configuration["Kafka:SaslMechanism"] ?? "Plain",
                KafkaSaslUsername = RequireValue(configuration, "Kafka:SaslUsername"),
                KafkaSaslPassword = RequireValue(configuration, "Kafka:SaslPassword"),
                KafkaGroupId = configuration["Kafka:GroupId"] ?? "kafka-dotnet-getting-started",
                KafkaTopic = configuration["Kafka:Topic"] ?? "image_analysis_my",
            };
        }

        private static string RequireValue(IConfiguration configuration, string key)
        {
            var value = configuration[key];
            if (string.IsNullOrWhiteSpace(value))
            {
                var envVarHint = key.Replace(":", "__");
                throw new InvalidOperationException(
                    $"Missing required configuration value '{key}'. Set it via appsettings.json or the '{envVarHint}' environment variable.");
            }

            return value;
        }
    }
}
