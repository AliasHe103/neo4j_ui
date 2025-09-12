import axios from 'axios'
import {ElMessage} from "element-plus"

const instance = axios.create({
    // Todo
    baseURL: "http://localhost:5000",
    timeout: 10000
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