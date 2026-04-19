import sys

with open(r'd:\ALL\Study\Personal Projects\Dev Guard Pro\src\data\docsContent.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The goal is to have exactly ONE backslash before every ${
# So we first remove all backslashes before ${ then add exactly one.
# We also do it for backticks if they are in groups of 3+
import re
temp = re.sub(r'\\+\$\{', '${', content)
fixed = temp.replace('${', '\\${')

# Same for triple backticks. We want \` \` \` 
# Actually, the user's issue is specific to the dollar-braces crashing the module load.
# Normalized fixed:
with open(r'd:\ALL\Study\Personal Projects\Dev Guard Pro\src\data\docsContent.jsx', 'w', encoding='utf-8') as f:
    f.write(fixed)
