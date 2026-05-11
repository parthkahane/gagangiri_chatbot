from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import os
import pandas as pd
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy
from dotenv import load_dotenv

# Download required NLTK data
def download_nltk_data():
    try:
        nltk.data.find('tokenizers/punkt_tab')
    except LookupError:
        nltk.download('punkt')
        nltk.download('punkt_tab')
    try:
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('stopwords')
    try:
        nltk.data.find('corpora/wordnet')
    except LookupError:
        nltk.download('wordnet')

download_nltk_data()

# Ensure Spacy model is loaded
try:
    nlp_spacy = spacy.load("en_core_web_sm")
except OSError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
    nlp_spacy = spacy.load("en_core_web_sm")

load_dotenv()

app = Flask(__name__)

# Initialize Gemini client
client = OpenAI(
    api_key=os.environ.get("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)

# Load Dataset
dataset_path = 'gagangiri_dataset_cleaned.csv'
if os.path.exists(dataset_path):
    df = pd.read_csv(dataset_path)
    df.fillna('', inplace=True)
else:
    df = pd.DataFrame(columns=['question', 'intent', 'entities', 'answer'])

# Initialize NLP tools
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def preprocess_text(text):
    if not isinstance(text, str):
        return ""
    # Tokenization
    tokens = word_tokenize(text.lower())
    # Stopword Removal & Lemmatization
    cleaned_tokens = [lemmatizer.lemmatize(word) for word in tokens if word.isalnum() and word not in stop_words]
    return " ".join(cleaned_tokens)

# Prepare TF-IDF
df['processed_question'] = df['question'].apply(preprocess_text)
vectorizer = TfidfVectorizer()
if not df.empty:
    tfidf_matrix = vectorizer.fit_transform(df['processed_question'])

def get_semantic_match(user_query):
    if df.empty:
        return None, None, None
    processed_query = preprocess_text(user_query)
    query_vec = vectorizer.transform([processed_query])
    similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
    best_idx = similarities.argmax()
    best_score = similarities[best_idx]
    
    if best_score > 0.1: # Threshold for matching
        match_row = df.iloc[best_idx]
        return match_row['intent'], match_row['answer'], best_score
    return None, None, best_score

def extract_entities(text):
    doc = nlp_spacy(text)
    entities = {}
    for ent in doc.ents:
        entities[ent.label_] = entities.get(ent.label_, []) + [ent.text]
    return entities

SYSTEM_PROMPT = """
You are the official AI-powered virtual assistant for "Gagangiri Foods", a packaged drinking water company. 
Always be polite, helpful, and use emojis where appropriate.
If the user asks something unrelated to Gagangiri Foods or water supply, politely decline to answer.

Here is the context information you must base your answers on:

**About Gagangiri Foods:**
- Founded in 2008 by Late Mahadev Rayba Aher. Originally "Gagangiri Aqua".
- 17+ years of experience.
- 10,000 sq.ft fully automated facility operating at 120 bottles per minute.
- Run by 3 generations. Current leaders: Mr. Anil Ranba Aher and Mr. Shripad Anil Aher.

**Prices & Products:**
- 200 ml Bottle - ₹5.00
- 500 ml Bottle - ₹10.00
- 1 Liter Bottle - ₹18.00
- 2 Liter Bottle - ₹30.00
- 5 Liter Jar - ₹60.00
- 20 Liter Jar - ₹40.00 (Refill)
- Private Label Solutions: Custom branding for hotels, restaurants, corporate events, weddings, retail.
- Bulk Supply: For institutions, campuses, commercial setups, events.

**Delivery Information:**
- Service Area: Pimpri-Chinchwad, Pune, Lonavala (50 km radius).
- Delivery Time: Express delivery within 2 hours.
- Free Delivery on all orders.
- Service Days: 7 days a week.
- Delivery Partners: Network of 10+ reliable partners.

**Purification Process (5 Steps):**
1. Sediment Filtration
2. Carbon Filtration
3. Reverse Osmosis / RO
4. UV Treatment
5. Ozone Treatment

**Contact Information:**
- Address: Gat no - 175, Saptshrungi Housing Society, Ganesh Nagar, Talwade, Pimpri-Chinchwad, Maharashtra 411062.
- Email: info@gagangirifoods.com
- Phone: +91 98765 43210 / +91 91234 56789
- Business Hours: 8:00 AM - 8:00 PM (All days).

Keep your answers concise, structured, and friendly!
Use the detected intent, extracted entities, and matched dataset answer provided to construct an intelligent, human-like response.
"""

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')

    if not user_message:
        return jsonify({'error': 'Message is required'}), 400

    try:
        # NLP Processing
        intent, matched_answer, score = get_semantic_match(user_message)
        entities = extract_entities(user_message)
        
        dynamic_context = f"User Query: {user_message}\n"
        dynamic_context += f"Detected Intent: {intent if intent else 'Unknown'}\n"
        dynamic_context += f"Extracted Entities: {entities}\n"
        dynamic_context += f"Suggested Dataset Answer: {matched_answer if matched_answer else 'No direct match found in dataset.'}\n"

        response = client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[
                {"role": "system", "content": f"{SYSTEM_PROMPT}\n\nAdditional Context:\n{dynamic_context}"},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=512
        )
        bot_response = response.choices[0].message.content
        return jsonify({'response': bot_response})
    except Exception as e:
        print(f"Error during DeepSeek API call: {e}")
        return jsonify({'error': 'Failed to get response from AI. Please try again later.'}), 500

if __name__ == '__main__':
    app.run(debug=True)
