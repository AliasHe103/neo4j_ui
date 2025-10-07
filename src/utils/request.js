import axios from 'axios'
import {ElMessage} from "element-plus"

const instance = axios.create({
    // 服务器公网开放端口
    baseURL: "http://202.38.69.241:30412",
    timeout: 200000
})

instance.interceptors.request.use(
    config => {
        return config
    },
    error => {
        return Promise.reject(error)
    }
)

instance.interceptors.response.use(
    response => {
        return response.data
    },
    error => {
        ElMessage.error(error.message)
        return Promise.reject(error)
    }
)

export default instance