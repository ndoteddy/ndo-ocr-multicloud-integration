"""AWS Lambda handler: decode an uploaded image, archive it to S3, and run
Rekognition OCR on it. Invoked behind API Gateway (see docs/ARCHITECTURE.md)."""

import base64
import binascii
import json
import logging
import os

import boto3

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

BUCKET_NAME = os.environ.get("BUCKET_NAME", "demo-nando-rekognition")

_s3_client = None
_rekognition_client = None


def _get_s3_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client("s3")
    return _s3_client


def _get_rekognition_client():
    global _rekognition_client
    if _rekognition_client is None:
        _rekognition_client = boto3.client("rekognition")
    return _rekognition_client


def build_s3_key(img_name: str) -> str:
    return f"images/{img_name}"


def _error_response(status_code: int, message: str) -> dict:
    return {"statusCode": status_code, "remark": json.dumps(message)}


def lambda_handler(event, context):
    # Older API Gateway "custom integration" mapping templates nest the
    # real payload under "body-json"; fall back to the raw event so the
    # handler can also be invoked directly (e.g. from tests).
    payload = event.get("body-json", event)

    img_name = payload.get("imgName")
    img_base64 = payload.get("imgBase64")
    if not img_name or not img_base64:
        return _error_response(400, "Both imgName and imgBase64 are required")

    try:
        file_content = base64.b64decode(img_base64, validate=True)
    except (binascii.Error, ValueError) as exc:
        logger.warning("Failed to decode imgBase64 for %s: %s", img_name, exc)
        return _error_response(400, "imgBase64 is not valid base64")

    s3_key = build_s3_key(img_name)
    _get_s3_client().put_object(Bucket=BUCKET_NAME, Key=s3_key, Body=file_content)

    rekognition_result = _get_rekognition_client().detect_text(Image={"Bytes": file_content})

    return {
        "statusCode": 200,
        "remark": json.dumps("Image processed successfully"),
        "body": rekognition_result,
    }
