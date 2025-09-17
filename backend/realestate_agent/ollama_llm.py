import requests

def call_ollama_llm(prompt, model="llama3"):
    """
    Call a local Ollama LLM server and return the response.
    Args:
        prompt (str): The user input or conversation history.
        model (str): The model to use (default: 'llama3').
    Returns:
        str: The LLM's response text.
    """
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }
    try:
        response = requests.post(url, json=payload, timeout=120)
        response.raise_for_status()
        data = response.json()
        return data.get("response", "")
    except Exception as e:
        print(f"Ollama LLM call failed: {e}")
        return "[LLM error]"

# Example usage:
if __name__ == "__main__":
    user_input = input("You: ")
    reply = call_ollama_llm(user_input)
    print(f"Ollama: {reply}")
