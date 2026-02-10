import os
import requests
import cv2
import base64

SERVER_URL = os.getenv("SERVER_URL", "https://safelive.in/api/report")
DEVICE_ID = os.getenv("DEVICE_ID", "raspberry-pi-5")
SCOPE = os.getenv("SCOPE", "campus")
SOURCE = os.getenv("SOURCE", "edge")

def send_issue(frame, description, lat, lon):

    _, buffer = cv2.imencode(".jpg", frame)
    img_base64 = base64.b64encode(buffer).decode()

    payload = {
        "description": description,
        "latitude": lat,
        "longitude": lon,
        "image": img_base64,
        "severity": "HIGH",
        "deviceId": DEVICE_ID,
        "scope": SCOPE,
        "source": SOURCE
    }

    requests.post(SERVER_URL, json=payload, timeout=20)
