import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getGraph } from "@/api/neo4j.js"
import { getEvidence } from "@/api/net.js"

export const useGraphStore = defineStore('graph', () => {
    const graph = ref({
        nodes: [],
        links: []
    })

    async function loadGraph() {
        const result = await getGraph()
        console.log(result)
        graph.value.nodes = result.data.nodes
        graph.value.links = result.data.links
    }

    async function loadEvidence() {
        const result = await getEvidence()
        console.log(result)
        graph.value.nodes = result.data.nodes
        graph.value.links = result.data.links
    }

    return { graph, loadGraph, loadEvidence }
}, {
    persist: true
})