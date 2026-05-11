# AI-Powered NLP Chatbot for Gagangiri Foods

## Project Overview

The project is an AI-powered chatbot system developed for **Gagangiri Foods** to provide intelligent customer interaction on their website. The chatbot uses **Natural Language Processing (NLP)** techniques along with Google's **Gemini 2.5 Flash** model to understand user queries and generate accurate, lightning-fast responses.

A key highlight of this system is the integration of a **cleaned custom CSV dataset** (`gagangiri_dataset_cleaned.csv`) containing over 2,500 unique training entries relating to products, pricing, delivery services, water purification, customer support, and company information.

## Project Workflow

1. **User Interaction**: The user sends a message through the frontend chatbot interface.
2. **NLP Preprocessing**: The input is processed using NLTK (Tokenization, Stopword Removal, Lemmatization, Text Cleaning) to extract the core meaning.
3. **Semantic Search**: The chatbot searches the dataset using **TF-IDF Vectorization** and **Cosine Similarity** to semantically match the user query with predefined dataset questions.
4. **Intent Detection**: The system successfully identifies the purpose of the query (e.g., Delivery Query, Price Query).
5. **Named Entity Recognition (NER)**: The chatbot extracts important entities (Locations, Product Names) using **SpaCy**.
6. **AI Response Generation**: The extracted context, detected intent, entities, and matched dataset response are sent as a dynamic prompt to the **Google Gemini API**, which formulates a human-like, context-aware reply.

## Technologies Used
- **Python** & **Flask Framework**
- **Google Gemini 2.5 Flash API** (via OpenAI compatibility layer)
- **Natural Language Processing (NLP)** (`nltk`, `scikit-learn`, `spacy`)
- **TF-IDF Vectorization** & **Cosine Similarity**
- **Pandas** for Data Manipulation
- **HTML/CSS/JavaScript** for Frontend

## Project Structure
- `app.py`: Main backend script containing routing, NLP pipeline, and Gemini AI integration.
- `gagangiri_dataset_cleaned.csv`: The knowledge-base dataset of 2,500+ unique interactions.
- `templates/` & `static/`: Frontend HTML, CSS, JavaScript, and Image assets.
- `requirements.txt`: Python dependencies.
- `.env`: Environment variables storage containing the API key.

## How to Run Locally

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   *(Note: The application will automatically download the required NLTK corpus data and SpaCy models on its first startup).*

2. **Set up your API Key:**
   Create a `.env` file in the root directory (if not already present) and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Start the Server:**
   ```bash
   python app.py
   ```

4. **Access the Chatbot:**
   Open your browser and navigate to `http://127.0.0.1:5000/`.
