namespace netcoreconsumer.Configuration
{
    public class ConsumerOptions
    {
        public string MongoConnectionString { get; set; } = string.Empty;
        public string MongoDatabaseName { get; set; } = "dbnando_demo";
        public string MongoCollectionName { get; set; } = "image_analysis_with_rekognition";

        public string ApiGatewayUrl { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;

        public string KafkaBootstrapServers { get; set; } = string.Empty;
        public string KafkaSecurityProtocol { get; set; } = "SASL_SSL";
        public string KafkaSaslMechanism { get; set; } = "PLAIN";
        public string KafkaSaslUsername { get; set; } = string.Empty;
        public string KafkaSaslPassword { get; set; } = string.Empty;
        public string KafkaGroupId { get; set; } = "kafka-dotnet-getting-started";
        public string KafkaTopic { get; set; } = "image_analysis_my";
    }
}
