"""
Simple test script for the TTS functionality.
"""
import os
import sys
from pathlib import Path

# Add the project root to Python path
project_root = str(Path(__file__).parent.absolute())
if project_root not in sys.path:
    sys.path.append(project_root)

def test_tts():
    try:
        from tts.tts_simple import generate_tts_audio
        
        # Test text
        test_text = "Hello! This is a test of the simple TTS system. It should work without any external dependencies."
        
        # Output directory
        output_dir = os.path.join(project_root, "static", "audio")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, "test_output.wav")
        
        print(f"Testing TTS with text: {test_text}")
        print(f"Output will be saved to: {output_path}")
        
        # Generate TTS
        print("\nGenerating speech...")
        result_path = generate_tts_audio(
            text=test_text,
            output_path=output_path,
            speed=1.3
        )
        
        if os.path.exists(result_path):
            file_size = os.path.getsize(result_path) / 1024  # in KB
            print(f"\n✅ Success! Audio file created.")
            print(f"File size: {file_size:.2f} KB")
            print(f"File saved to: {result_path}")
            print("\n🎧 You can now play the audio file to test the TTS quality.")
        else:
            print("\n❌ Error: Audio file was not created.")
            
    except Exception as e:
        print(f"\n❌ Error during TTS generation: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_tts()
