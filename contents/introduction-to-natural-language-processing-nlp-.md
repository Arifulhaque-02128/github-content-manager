# Introduction to Natural Language Processing (NLP)

Natural Language Processing (NLP) is a field of Artificial Intelligence (AI) that focuses on the interaction between computers and human language. NLP enables machines to understand, interpret, and generate human language.

## Key Applications

- **Text Classification:** Sentiment analysis, spam detection  
- **Named Entity Recognition (NER):** Identifying names, dates, locations  
- **Machine Translation:** Translating text between languages  
- **Question Answering:** Building chatbots and virtual assistants  
- **Text Summarization:** Condensing long documents automatically  

## Common NLP Techniques

### Tokenization

```python
from nltk.tokenize import word_tokenize

text = "Hello, world! NLP is amazing."
tokens = word_tokenize(text)
print(tokens)```