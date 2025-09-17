"""
Test script for the simple TTS implementation.
"""
import asyncio
import os
from app.agent_pipeline import generate_tts_audio

async def test_tts():
    # Test text
    test_text = "Hello! This is a test of the simple TTS system. It should be faster and more reliable than before."
    
    print("Testing TTS generation...")
    try:
        # Generate TTS
        print(f"Generating speech for: {test_text}")
        audio_path, audio_url = await generate_tts_audio(test_text)
        
        print(f"\n✅ Success!")
        print(f"Audio saved to: {audio_path}")
        print(f"Audio URL: {audio_url}")
        
        # Check if file exists
        if os.path.exists(audio_path):
            file_size = os.path.getsize(audio_path) / 1024  # in KB
            print(f"File size: {file_size:.2f} KB")
            print("\n🎧 You can now play the audio file to test the TTS quality.")
        else:
            print("\n⚠️  Warning: Audio file was not created.")
            
    except Exception as e:
        print(f"\n❌ Error during TTS generation: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Create necessary directories
    os.makedirs("static/audio", exist_ok=True)
    
    # Run the test
    asyncio.run(test_tts())
