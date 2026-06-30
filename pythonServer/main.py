from typing import List

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from preprocess import preprocess_stroke
from pydantic import BaseModel

# --- CONFIGURATION ---
# Must match the exact order used in train.py
CATEGORIES = ["circle", "square", "triangle", "line"]

# Initialize FastAPI
app = FastAPI(title="Whiteboard ML Engine")

# Enable CORS so your frontend port (e.g., localhost:5173) can talk to this port (8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model into memory on startup
print("Loading Neural Network...")
model = tf.keras.models.load_model("shape_model.keras")
print("Model Ready!")


# --- DATA CONTRACT ---
# This schema expects exactly what your Mongoose DB / Frontend sends
class StrokeInput(BaseModel):
    points: List[List[float]]


# --- API ENDPOINT ---
@app.post("/api/recognize")
async def recognize_shape(stroke: StrokeInput):
    try:
        raw_points = stroke.points

        # Edge case: A single click isn't a shape
        if len(raw_points) < 2:
            raise HTTPException(
                status_code=400, detail="Stroke requires at least 2 points."
            )

        # 1. Preprocess: Resample to 64 points and normalize size
        processed_tensor = preprocess_stroke(raw_points)

        # 2. Inference: Pass through the CNN
        # verbose=0 keeps your terminal clean from prediction logs
        predictions = model.predict(processed_tensor, verbose=0)

        # 3. Post-process: Find the most confident guess
        best_match_idx = np.argmax(predictions[0])
        confidence_score = float(predictions[0][best_match_idx])
        predicted_shape = CATEGORIES[best_match_idx]

        # Only return the shape if the AI is reasonably confident
        if confidence_score < 0.60:
            return {"shapeType": "unknown", "confidence": confidence_score}

        return {"shapeType": predicted_shape, "confidence": round(confidence_score, 4)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
