import sys
import os
import importlib.util

print("Python Executable:", sys.executable)
print("System Path:")
for p in sys.path:
    print(f"  {p}")

print("\nAttempting import...")
try:
    import langchain_groq
    print("SUCCESS: langchain_groq imported!")
    print("Location:", langchain_groq.__file__)
except ImportError as e:
    print(f"FAILURE: {e}")

print("\nSearching for langchain_groq in sys.path...")
found = False
for p in sys.path:
    if not p or not os.path.exists(p): continue
    try:
        items = os.listdir(p)
        for item in items:
            if "langchain" in item and "groq" in item:
                print(f"  Found '{item}' in {p}")
                found = True
    except Exception as e:
        print(f"  Error reading {p}: {e}")

if not found:
    print("  No langchain-groq related files found in sys.path.")
