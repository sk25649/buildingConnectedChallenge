'use strict'

const Promise = require('bluebird')
const moment = require('moment')
const Log = require('../lib/log')

module.exports = (logSources, printer) => {
	let promises = logSources.map((source, index) => {
		return createLog(index, source.popAsync())
	})

	printLogAsync(promises, logSources, printer)
}

function printLogAsync(promises, logSources, printer) {
	// Prints log async by resolving log promises
	Promise.all(promises).then(logs => {
		const index = sortAndPrint(logs, printer)
		if(index === -1) {
			printer.done()
			return
		}
		logs.push(createLog(index, logSources[index].popAsync()))
		printLogAsync(logs, logSources, printer)
	})
}

function createLog(index, item) {
	// returns a Promise that return a new instance Log
	return new Promise(resolve => {
		Promise.resolve(item).then(result => resolve(new Log(index, result)))
	})
}

function sortAndPrint(logs, printer) {
	// sort logs and find entry to print
	logs.sort((a, b) => {
		return moment(a.item.date).diff(moment(b.item.date))
	})

	const candidate = logs.shift()

	// return -1 if entry is invalid
	if(!candidate.item) return -1

	// print the entry
	printer.print(candidate.item)

	// return log source index to fetch more entry
	return candidate.index
}
