from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import requests
import io
import os
import torch

app = FastAPI(title="PeoplePost ML API")

# Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
clip_model = None
clip_processor = None
sbert = None

# Labels for Zero-Shot Classification
CATEGORY_LABELS = [
    "Pothole",
    "Streetlight",
    "Garbage",
    "Garbage dump",
    "Sanitation or Waste",
    "Road and Transport",
    "Water and Drainage",
    "Public Safety",
    "Dead animals"
]

DEPARTMENT_ICONS = {
    "Pothole": "🛣",
    "Streetlight": "💡",
    "Garbage": "🗑",
    "Garbage dump": "🗑",
    "Sanitation or Waste": "🗑",
    "Road and Transport": "🚗",
    "Water and Drainage": "💧",
    "Public Safety": "🚨",
    "Dead animals": "🐕"
}

@app.on_event("startup")
async def load_models():
    global clip_model, clip_processor, sbert
    print("\n" + "="*50)
    print("Starting PeoplePost ML API (Deep Learning)...")
    print("="*50)
    
    # Load SBERT model for embeddings (Duplicate Detection)
    print("\nLoading SBERT model (for vector search)...")
    try:
        sbert = SentenceTransformer("all-MiniLM-L6-v2")
        print("SBERT model loaded successfully!")
    except Exception as e:
        print(f"Error loading SBERT: {e}")
        sbert = None
        
    # Load CLIP Model (Zero-Shot Image Classification)
    print("\nLoading OpenAI CLIP Vision Model (this takes a moment)...")
    try:
        clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        print("CLIP Vision Model loaded successfully!")
    except Exception as e:
        print(f"Error loading CLIP: {e}")
        clip_model = None
    
    if clip_model and sbert:
        print("\nAll Foundation Models loaded! API is ready.")
    else:
        print("\nWarning: Some models failed to load. Features may not work.")
    print("="*50 + "\n")

class AnalyzeRequest(BaseModel):
    description: str
    image_url: str = None

class AnalyzeResponse(BaseModel):
    category: str
    icon: str
    severity: str
    embedding: list[float]

def determine_severity(text: str) -> str:
    text_lower = text.lower()
    if any(word in text_lower for word in ["critical", "emergency", "danger", "urgent", "huge", "massive", "dead", "blood"]):
        return "Critical"
    elif any(word in text_lower for word in ["high", "bad", "dangerous", "big", "broken"]):
        return "High"
    elif any(word in text_lower for word in ["moderate", "medium", "some", "small", "annoying"]):
        return "Medium"
    else:
        return "Low"

@app.get("/")
async def root():
    return {
        "message": "PeoplePost ML API (Deep Learning)",
        "status": "running"
    }

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_report(request: AnalyzeRequest):
    if not clip_model or not sbert:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    # 1. Generate SBERT Embedding (384 dimensions)
    try:
        embedding = sbert.encode([request.description])[0].tolist()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding failed: {str(e)}")

    # 2. Determine Severity using NLP rules
    severity = determine_severity(request.description)

    # 3. Categorize Image using CLIP
    category = "Other"
    icon = "🏛"
    
    if request.image_url:
        try:
            # Download Image
            response = requests.get(request.image_url)
            image = Image.open(io.BytesIO(response.content)).convert("RGB")
            
            # Prepare inputs for CLIP
            inputs = clip_processor(text=CATEGORY_LABELS, images=image, return_tensors="pt", padding=True)
            
            # Forward pass
            with torch.no_grad():
                outputs = clip_model(**inputs)
                
            # Get probabilities
            logits_per_image = outputs.logits_per_image
            probs = logits_per_image.softmax(dim=1).cpu().numpy()
            
            # Get highest probability label
            best_idx = probs.argmax()
            category = CATEGORY_LABELS[best_idx]
            icon = DEPARTMENT_ICONS.get(category, "🏛")
            
        except Exception as e:
            print(f"CLIP Vision prediction failed: {str(e)}")
            # Fallback if image classification fails
            pass
            
    return {
        "category": category,
        "icon": icon,
        "severity": severity,
        "embedding": embedding
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
