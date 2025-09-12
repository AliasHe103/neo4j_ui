import request from '@/utils/request'

export const getGraph = () => {
  return request({
    url: '/api/neo4j/graph',
    method: 'get'
  })
}