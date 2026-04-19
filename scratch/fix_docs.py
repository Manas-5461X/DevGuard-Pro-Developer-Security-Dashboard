import sys

with open(r'd:\ALL\Study\Personal Projects\Dev Guard Pro\src\data\docsContent.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix unescaped backticks that break template literals
# We need to escape backticks that are NOT the start/end of a template literal
# But since our template literals are huge, any backtick sequence of 3 or more is definitely literal text.
# Also, any ${ sequence is definitely intended as literal text in this context.

fixed = content.replace('```', '\\`\\`\\`').replace('````', '\\`\\`\\`\\`').replace('${', '\\${')

with open(r'd:\ALL\Study\Personal Projects\Dev Guard Pro\src\data\docsContent.jsx', 'w', encoding='utf-8') as f:
    f.write(fixed)
