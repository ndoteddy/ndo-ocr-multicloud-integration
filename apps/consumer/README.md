# OCR Consumer

.NET console app. Consumes image-upload events from Kafka, calls the
Lambda-backed API Gateway endpoint to run OCR, and saves the result to
MongoDB. See [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) for how this
fits into the rest of the pipeline.

## Configuration

Non-secret defaults live in `netcoreconsumer/appsettings.json`. Secrets are
read from environment variables (via `AddEnvironmentVariables()`, using `__`
as the config-section separator) and must never be committed:

| Env var                   | Required | Purpose                                      |
| -------------------------- | -------- | --------------------------------------------- |
| `Mongo__ConnectionString`  | yes      | MongoDB Atlas connection string               |
| `ApiGateway__ApiKey`       | yes      | Sent as `x-api-key` to the Lambda API Gateway |
| `Kafka__BootstrapServers`  | yes      | Confluent Kafka bootstrap servers             |
| `Kafka__SaslUsername`      | yes      | Confluent Kafka SASL username                 |
| `Kafka__SaslPassword`      | yes      | Confluent Kafka SASL password                 |

Non-secret overrides (`Mongo:DatabaseName`, `Kafka:Topic`, etc.) can go in
`appsettings.json` or as environment variables the same way. The app fails
fast at startup, naming the missing variable, if a required value is absent.

## Project layout

```
netcoreconsumer/
  Configuration/ConsumerOptions.cs   # typed config shape
  Models/ImageModels.cs
  Services/
    ITextExtractionClient.cs / RekognitionApiClient.cs   # API Gateway call
    IImageResultRepository.cs / MongoImageResultRepository.cs
    OcrTextExtractor.cs               # pure text-join logic
    ImageProcessingService.cs         # orchestrates the above
  Program.cs                          # composition root + Kafka consume loop
netcoreconsumer.Tests/                # xUnit + Moq
```

## Build & test

```bash
dotnet restore
dotnet build
dotnet test
dotnet run --project netcoreconsumer
```

Targets `net10.0` (current .NET LTS). This project was authored in an
environment without the .NET SDK installed, so none of the above has
actually been run here — do that before relying on it.
