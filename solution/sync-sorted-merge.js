'use strict'

const moment = require('moment')
const Log = require('../lib/log')

module.exports = (logSources, printer) => {
	let stack = [],
		index = 0;

	// fill stack with logs from each log sources
	for(let i = 0; i < logSources.length; i++) {
		const curLogSource = logSources[i]
		stack.push(new Log(i, curLogSource.pop()))
	}

	while(stack.length !== 0) {
		// sort stack and find entry to print
		stack.sort((a, b) => {
			return moment(a.item.date).diff(moment(b.item.date))
		})

		const candidate = stack.shift()
			index = candidate.index

		// print the entry
		printer.print(candidate.item)

		// fill in an entry if possible
		const newEntry = logSources[index].pop()
		if(newEntry) {
			stack.push(new Log(index, newEntry))
		}
	}

	printer.done()
}
