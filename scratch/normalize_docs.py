import sys
import re

with open(r'd:\ALL\Study\Personal Projects\Dev Guard Pro\src\data\docsContent.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. First, normalize all escaped dollar-braces. 
# We want to find any sequence of backslashes followed by ${ and turn it into exactly one backslash + ${
# Regex: [\]+[$]{  (wait, simpler: replace all \${ with ${ then all ${ with \${)
temp = content.replace('\\${', '${')
# Now all ${ are unescaped. Now we escape them all.
fixed = temp.replace('${', '\\${')

# 2. Fix backticks for code blocks.
# We want ``` to become \` \` \`
# First normalize: remove any escapes from ``` 
temp2 = fixed.replace('\\`\\`\\`', '```').replace('\\` \\` \\` ', '```')
# Now escape them correctly
final = temp2.replace('```', '\\`\\`\\`').replace('````', '\\`\\`\\`\\`')

with open(r'd:\ALL\Study\Personal Projects\Dev Guard Pro\src\data\docsContent.jsx', 'w', encoding='utf-8') as f:
    f.write(final)
