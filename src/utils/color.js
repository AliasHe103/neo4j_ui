const hashString = (str) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
    }
    return Math.abs(hash)
}

const getRandomColor = (hash) => {
    const hue = hash % 360
    return `hsl(${hue}, 75%, 60%)`
}

const nodeColorMap = {}
const getNodeColor = (labels) => {
    if (!labels || labels.length === 0) {
        return '#999'
    }
    const hash = hashString(labels.join('-'))
    if (nodeColorMap[hash] === undefined) {
        nodeColorMap[hash] = getRandomColor(hash)
    }
    return nodeColorMap[hash]
}

export {getNodeColor}