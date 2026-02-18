"""
Test script for Brainstormer Agent v2.0 - MASTER IDEA ENGINE
Run this to test all 6 modes locally

Requirements:
- Brainstormer agent running on http://localhost:8001
- OPENROUTER_API_KEY set in environment

Usage: python test_brainstormer.py
"""

import requests
import json

BRAINSTORMER_URL = "http://localhost:8001"

def test_mode(mode: str, prompt: str, persona: str = "hackathon", secondary_input: str = ""):
    """Test a specific mode with streaming response"""
    print(f"\n{'='*60}")
    print(f"Testing {mode.upper()} MODE")
    print(f"Persona: {persona}")
    print(f"Prompt: {prompt}")
    if secondary_input:
        print(f"Secondary Input: {secondary_input}")
    print(f"{'='*60}\n")
    
    payload = {
        "prompt": prompt,
        "mode": mode,
        "persona": persona,
    }
    
    if secondary_input:
        payload["secondary_input"] = secondary_input
    
    try:
        response = requests.post(
            f"{BRAINSTORMER_URL}/generate",
            json=payload,
            stream=True,
            timeout=60
        )
        
        if response.status_code == 200:
            print("RESPONSE:")
            print("-" * 60)
            for chunk in response.iter_content(chunk_size=None, decode_unicode=True):
                if chunk:
                    print(chunk, end='', flush=True)
            print("\n" + "-" * 60)
            print("✅ Test completed successfully!\n")
        else:
            print(f"❌ Error: HTTP {response.status_code}")
            print(response.text)
    
    except Exception as e:
        print(f"❌ Error: {e}")


def main():
    """Run all mode tests"""
    
    print("\n" + "🚀" * 30)
    print("BRAINSTORMER AGENT v2.0 - COMPREHENSIVE TEST SUITE")
    print("🚀" * 30)
    
    # Test 1: KEYWORD MODE
    test_mode(
        mode="keyword",
        prompt="AI",
        persona="hackathon"
    )
    
    input("\nPress Enter to continue to next test...")
    
    # Test 2: EXPAND MODE
    test_mode(
        mode="expand",
        prompt="AI-powered resume builder for students",
        persona="student"
    )
    
    input("\nPress Enter to continue to next test...")
    
    # Test 3: MERGE MODE
    test_mode(
        mode="merge",
        prompt="AI chatbot for customer support",
        persona="entrepreneur",
        secondary_input="Blockchain loyalty rewards platform"
    )
    
    input("\nPress Enter to continue to next test...")
    
    # Test 4: ANALYZE MODE
    test_mode(
        mode="analyze",
        prompt="AI-powered code review tool for development teams",
        persona="entrepreneur"
    )
    
    input("\nPress Enter to continue to next test...")
    
    # Test 5: SCORE MODE
    test_mode(
        mode="score",
        prompt="Notion template marketplace for students | AI essay grading tool | Campus event finder app",
        persona="student"
    )
    
    input("\nPress Enter to continue to next test...")
    
    # Test 6: REFINE MODE
    test_mode(
        mode="refine",
        prompt="like an app where people can share their ideas and get feedback maybe with ai or something",
        persona="hackathon"
    )
    
    print("\n" + "✅" * 30)
    print("ALL TESTS COMPLETED!")
    print("✅" * 30 + "\n")


def test_legacy_format():
    """Test backward compatibility with legacy format"""
    print("\n" + "🔄" * 30)
    print("TESTING LEGACY FORMAT (Backward Compatibility)")
    print("🔄" * 30 + "\n")
    
    payload = {
        "prompt": "[PERSONA:student] Generate ideas about sustainability"
    }
    
    try:
        response = requests.post(
            f"{BRAINSTORMER_URL}/generate",
            json=payload,
            stream=True,
            timeout=60
        )
        
        if response.status_code == 200:
            print("LEGACY FORMAT RESPONSE:")
            print("-" * 60)
            for chunk in response.iter_content(chunk_size=None, decode_unicode=True):
                if chunk:
                    print(chunk, end='', flush=True)
            print("\n" + "-" * 60)
            print("✅ Legacy format still works!\n")
        else:
            print(f"❌ Error: HTTP {response.status_code}")
    
    except Exception as e:
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    # Check if server is running
    try:
        response = requests.get(f"{BRAINSTORMER_URL}/")
        if response.status_code == 200:
            print(f"✅ Brainstormer Agent is running: {response.json()}")
        else:
            print(f"⚠️ Warning: Unexpected status code {response.status_code}")
    except Exception as e:
        print(f"❌ ERROR: Cannot connect to Brainstormer Agent at {BRAINSTORMER_URL}")
        print(f"   Make sure the agent is running: cd brainstormer-agent && uvicorn main:app --port 8001")
        exit(1)
    
    # Ask user which test to run
    print("\nSelect test mode:")
    print("1. Run all 6 mode tests (recommended)")
    print("2. Test specific mode")
    print("3. Test legacy format compatibility")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == "1":
        main()
    elif choice == "2":
        print("\nAvailable modes:")
        print("- keyword")
        print("- expand")
        print("- merge")
        print("- analyze")
        print("- score")
        print("- refine")
        
        mode = input("\nEnter mode: ").strip()
        prompt = input("Enter prompt: ").strip()
        persona = input("Enter persona (student/entrepreneur/hackathon) [hackathon]: ").strip() or "hackathon"
        
        if mode == "merge":
            secondary_input = input("Enter second idea: ").strip()
            test_mode(mode, prompt, persona, secondary_input)
        else:
            test_mode(mode, prompt, persona)
    
    elif choice == "3":
        test_legacy_format()
    
    else:
        print("Invalid choice!")
