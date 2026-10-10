# OCR Lambda

AWS Lambda function behind API Gateway. Decodes a base64 image, archives it to
S3, and runs Rekognition `detect_text` on it. Invoked by [apps/consumer](../consumer)
and ultimately triggered by [apps/backend](../backend)'s Kafka producer.

## Runtime

Python 3.12 (or later), `boto3` only — no Lambda layer needed beyond the SDK
that ships in the runtime image (pin via `requirements.txt` if you deploy
with a custom build step instead of relying on the runtime's bundled boto3).

## Configuration

| Env var       | Required | Default                   | Purpose                          |
| ------------- | -------- | -------------------------- | --------------------------------- |
| `BUCKET_NAME` | no       | `demo-nando-rekognition`   | S3 bucket the uploaded image is archived to |

Set `BUCKET_NAME` as a Lambda environment variable per stage/region instead of
hardcoding it in source, and give the function's execution role least-privilege
`s3:PutObject` on that bucket plus `rekognition:DetectText`.

## Auth

This function should sit behind an API Gateway **usage plan with a required
API key**. The key you configure there is the same value the .NET consumer
sends as `x-api-key` (`ApiGateway:ApiKey` / `ApiGateway__ApiKey`, see
[apps/consumer](../consumer)). Without a usage plan, the endpoint is open to
anyone who finds the URL.

## Local development

```bash
pip install -r requirements-dev.txt
pytest
```

Tests mock S3 with [moto](https://github.com/getmoto/moto) and stub the
Rekognition client directly; no AWS credentials or network access required.

> Note: this project was authored in an environment without a Python
> interpreter available, so `pytest` has not actually been run here yet —
> run it locally before deploying.
