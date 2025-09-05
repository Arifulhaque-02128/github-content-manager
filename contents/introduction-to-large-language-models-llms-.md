# Introduction to Large Language Models (LLMs)

## Key Concepts

- **Transformer Architecture:** The backbone of most modern LLMs like GPT, BERT, and LLaMA.
- **Self-Attention:** Enables the model to focus on relevant words when generating predictions.
- **Tokenization:** Splits text into smaller units (tokens) that the model can process.

## Applications

- **Text Generation:** Chatbots, story writing, and automated content creation.
- **Summarization:** Condense long articles into concise summaries.
- **Translation:** Convert text from one language to another.
- **Sentiment Analysis:** Detect emotions or opinions in text.

## Example Usage

### Generating Text with GPT

```python
from transformers import GPT2LMHeadModel, GPT2Tokenizer

tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
model = GPT2LMHeadModel.from_pretrained("gpt2")

input_text = "Once upon a time"
inputs = tokenizer(input_text, return_tensors="pt")
outputs = model.generate(**inputs, max_length=50)
print(tokenizer.decode(outputs[0]))```