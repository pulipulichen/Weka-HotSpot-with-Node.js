from scipy import stats
import sys, json

for line in sys.stdin:
	groups = json.loads(line)
	g = stats.kruskal(*groups)
	print json.dumps(g)