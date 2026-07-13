"""API tests for the Real Estate AI Agent.

External services (OpenAI, TTS engine) are mocked so the suite runs
offline and in CI. Set OPENAI_API_KEY to any value before running:

    OPENAI_API_KEY=test pytest tests/ -v
"""
import os
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

os.environ.setdefault("OPENAI_API_KEY", "ci-test-key")

from app.main import app  # noqa: E402
from app.agent_pipeline import AIResponse  # noqa: E402

client = TestClient(app)


# ---------------------------------------------------------------- health
def test_health_check_returns_200():
    response = client.get("/")
    assert response.status_code == 200

def test_health_check_reports_running():
    body = client.get("/").json()
    assert body["status"] == "running"
    assert body["service"] == "Real Estate AI Agent API"


# ------------------------------------------------------------- languages
def test_languages_returns_supported_list():
    response = client.get("/api/languages")
    assert response.status_code == 200
    codes = [lang["code"] for lang in response.json()["languages"]]
    assert "en" in codes
    assert "ar" in codes


# ------------------------------------------------------------------ chat
def test_chat_rejects_missing_text():
    response = client.post("/api/chat", json={})
    assert response.status_code == 422  # validation error, not a 500

def test_chat_rejects_unsupported_language():
    response = client.post(
        "/api/chat", json={"text": "hello", "language": "xx"}
    )
    assert response.status_code == 400

def test_chat_rejects_out_of_range_temperature():
    response = client.post(
        "/api/chat", json={"text": "hello", "temperature": 3.5}
    )
    assert response.status_code == 422

@patch("app.main.process_user_input", new_callable=AsyncMock)
def test_chat_returns_ai_response(mock_pipeline):
    mock_pipeline.return_value = AIResponse(
        text="A mocked property recommendation.",
        audio_url="/static/audio/mock.wav",
    )
    response = client.post(
        "/api/chat",
        json={"text": "Find me a flat in Cairo", "generate_audio": False},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["text"] == "A mocked property recommendation."
    mock_pipeline.assert_awaited_once()


# ------------------------------------------------------------------- tts
def test_tts_rejects_missing_text():
    response = client.post("/api/tts", json={})
    assert response.status_code == 422

def test_tts_rejects_empty_text():
    response = client.post("/api/tts", json={"text": "   "})
    assert response.status_code == 400

@patch("app.agent_pipeline.generate_tts_audio", new_callable=AsyncMock)
def test_tts_returns_audio_url(mock_tts):
    mock_tts.return_value = "/static/audio/mock.wav"
    response = client.post("/api/tts", json={"text": "Welcome home"})
    assert response.status_code == 200
    assert response.json() == {"audio_url": "/static/audio/mock.wav"}


# ------------------------------------------------------------ api schema
def test_openapi_schema_is_served():
    response = client.get("/openapi.json")
    assert response.status_code == 200
    paths = response.json()["paths"]
    assert "/api/chat" in paths
    assert "/api/tts" in paths
