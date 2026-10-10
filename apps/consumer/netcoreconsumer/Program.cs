using System;
using Confluent.Kafka;
using System.Threading;
using Microsoft.Extensions.Configuration;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text;
using System.Collections.Generic;
using System.Linq;

namespace netcoreconsumer
{
    class Program
    {
        static void Main(string[] args)
        {

          
            var kafkaFilePath = AppDomain.CurrentDomain.BaseDirectory + @"getting-started.properties";
            var configForKafka = new ConfigurationBuilder()
                .AddIniFile(kafkaFilePath)
                .Build();

            
            var configInAppSetting = new ConfigurationBuilder();
                configInAppSetting.SetBasePath(Directory.GetCurrentDirectory())
             .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true).Build();

            configForKafka["group.id"] = "kafka-dotnet-getting-started";
            configForKafka["auto.offset.reset"] = "earliest";

            const string topic = "image_analysis_my";

            CancellationTokenSource cts = new CancellationTokenSource();
            Console.CancelKeyPress += (_, e) => {
                e.Cancel = true; // prevent the process from terminating.
                cts.Cancel();
            };

            using (var consumer = new ConsumerBuilder<string, string>(
                configForKafka.AsEnumerable()).Build())
            {
                consumer.Subscribe(topic);
                try
                {
                    while (true)
                    {
                        var cr = consumer.Consume(cts.Token);
                        Console.WriteLine($"Consumed event from topic {topic} with key {cr.Message.Key,-10} and value {cr.Message.Value}");
                        var images = JsonSerializer.Deserialize<ImageBase64>(cr.Message.Value);
                        GetTextFromImage(images);
 

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
        }
   

        static async void GetTextFromImage(ImageBase64 imageBase64)
        { 
            try
            {
                using var client = new HttpClient();
                var json = JsonSerializer.Serialize(imageBase64);
                HttpContent content = new StringContent(json, Encoding.UTF8, "application/json");
                client.DefaultRequestHeaders.Add("x-api-key", "<<YOUROWNAPIKEY>>");
                var response = await client.PostAsync("<<YOUROWNAPIGATEWAYURL>>", content);
                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadAsStringAsync();
                    Console.WriteLine(result);

                    //process data from aws rekognition
                    var imageResponseFromAWS = JsonSerializer.Deserialize<ImageResponseFromAWS>(result);

                    //get image result 

                    var imgContent = string.Join(" ",imageResponseFromAWS.body.TextDetections.Select(x => x.DetectedText).ToArray());


                    var imageResult = new ImageResult()
                    {
                        ImgName = imageBase64.imgName,
                        ImgContent = imgContent
                    };


                    //save to mongo db atlas
                    ImageServices.SaveImageMetadata(imageResult);

                }
                else
                {
                    Console.WriteLine($"Failed with status code {response.StatusCode}");
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }
    }
}
