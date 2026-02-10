from ultralytics import YOLO

model = YOLO("models/best.pt")

def detect_issue(frame):

    results = model(frame)

    for r in results:
        if len(r.boxes) > 0:
            return True, "Garbage Overflow Detected"

    return False, "No Issue"