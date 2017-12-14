# -*- coding: utf-8 -*-
from dunn_function import dunn
import sys, json

# simple JSON echo script
for line in sys.stdin:
	groups = json.loads(line)
	g = dunn(groups,correction="fdr",display=False,save=False)
	print json.dumps(g)