from langchain_ollama import OllamaLLM

llm = OllamaLLM(model="llama3")

while True:
    q = input("Ask: ")
    if q == "exit":
        break
    print(llm.invoke(q))
    