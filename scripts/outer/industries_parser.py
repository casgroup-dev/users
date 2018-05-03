# This script reads a table copied from http://www.sii.cl/catastro/codigos.htm and parse it to json
# The output format is:
# [{
#   category:'SALES',
#   industries: [{
#                   code: 1,
#                   name: 'SALE OF CLOTHES'
#               },
#               {
#                   code: 2,
#                   name:'SALE OF FOOD'
#               },
#               ...],
#   ...
# }]

import json

industries_file = 'industries_table.txt'

output = []
category = None

with open(industries_file, 'r', encoding='utf8') as f:
    lines = f.readlines()
    last_category = None
    for line in lines:
        splitted_line = line.split('\t')
        line_type = splitted_line[0].strip('\ufeff').strip()
        if line_type == u'Código':
            if category is not None:
                output.append(category)
            category = {}
            last_category = splitted_line[1].strip('\ufeff').strip()
            category['category'] = last_category
        elif line_type.isnumeric():
            if 'industries' not in category:
                category['industries'] = []
            category['industries'].append({
                'code': line_type,
                'name': splitted_line[1].strip('\ufeff').strip()
            })

with open('industries.json', 'w') as f:
    json.dump(output, f)
