import base64
import json

import boto3
import pytest
from moto import mock_aws

import handler


@pytest.fixture(autouse=True)
def reset_client_cache():
    """The handler module caches boto3 clients at module scope; make sure
    each test gets a fresh one so moto's mocked AWS context applies."""
    handler._s3_client = None
    handler._rekognition_client = None
    yield
    handler._s3_client = None
    handler._rekognition_client = None


def _sample_event(img_name="a.png", img_base64=None):
    if img_base64 is None:
        img_base64 = base64.b64encode(b"fake-image-bytes").decode("ascii")
    return {"body-json": {"imgName": img_name, "imgBase64": img_base64}}


def test_build_s3_key():
    assert handler.build_s3_key("a.png") == "images/a.png"


def test_missing_fields_returns_400():
    result = handler.lambda_handler({"body-json": {"imgName": "a.png"}}, None)
    assert result["statusCode"] == 400


def test_invalid_base64_returns_400():
    result = handler.lambda_handler(_sample_event(img_base64="not-valid-base64!!"), None)
    assert result["statusCode"] == 400


def test_handler_accepts_flat_event_without_body_json_wrapper():
    # No "body-json" wrapper (e.g. a direct test invocation); should not
    # raise a KeyError, and still 400s because imgBase64 is missing.
    result = handler.lambda_handler({"imgName": "a.png"}, None)
    assert result["statusCode"] == 400


@mock_aws
def test_successful_processing_uploads_to_s3_and_calls_rekognition(monkeypatch):
    monkeypatch.setenv("AWS_DEFAULT_REGION", "us-east-1")

    s3 = boto3.client("s3", region_name="us-east-1")
    s3.create_bucket(Bucket="demo-nando-rekognition")

    fake_rekognition_result = {
        "TextDetections": [{"DetectedText": "Hello", "Confidence": 99.0}],
    }

    class FakeRekognitionClient:
        def detect_text(self, Image):
            self.last_image = Image
            return fake_rekognition_result

    monkeypatch.setattr(handler, "_get_rekognition_client", lambda: FakeRekognitionClient())

    result = handler.lambda_handler(_sample_event(img_name="a.png"), None)

    assert result["statusCode"] == 200
    assert result["body"] == fake_rekognition_result
    assert json.loads(result["remark"]) == "Image processed successfully"

    stored = s3.get_object(Bucket="demo-nando-rekognition", Key="images/a.png")
    assert stored["Body"].read() == b"fake-image-bytes"
