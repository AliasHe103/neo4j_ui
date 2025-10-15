import request from '@/utils/request'
// SSE处理流数据
const SSE_SERVER = "http://202.38.69.241:30412";
export function createSSE(url, {
    onMessage = () => { },
    onError = (error) => console.error('SSE Error:', error),
    onOpen = () => { },
    onClose = () => { },
    withCredentials = false
} = {}) {
    let eventSource = null;
    let isClosed = false;
    url = SSE_SERVER + url;

    try {
        eventSource = new EventSource(url, { withCredentials });

        eventSource.onopen = () => {
            isClosed = false;
            onOpen();
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (e) {
                console.error('Failed to parse SSE data:', e, event.data);
                onError(e);
            }
        };

        eventSource.onerror = (error) => {
            if (!isClosed) {
                onError(error);
            }
        };

        const close = () => {
            if (eventSource && !isClosed) {
                isClosed = true;
                eventSource.close();
                onClose();
            }
        };

        // 返回连接管理对象
        return {
            close,
            // 检查连接状态
            get isOpen() {
                return eventSource && eventSource.readyState === EventSource.OPEN;
            },
            get isConnecting() {
                return eventSource && eventSource.readyState === EventSource.CONNECTING;
            },
            get isClosed() {
                return isClosed || (eventSource && eventSource.readyState === EventSource.CLOSED);
            }
        };
    } catch (error) {
        onError(error);
        return {
            close: () => { },
            isOpen: false,
            isConnecting: false,
            isClosed: true
        };
    }
}

// AI推理流式响应的SSE客户端
export function createAIStreamingClient(url = 'http://202.38.69.241:30412/api/streaming', {
    onToken = () => { },
    onComplete = () => {
    },
    onError = (error) => console.error('AI Streaming Error:', error)
} = {}) {

    return createSSE(url, {
        onMessage: (data) => {
            // 接收流数据
            if (typeof data === 'object') {
                if (data.is_final) {
                    onComplete();
                    return;
                }

                if (typeof data.token === 'string' && data.token.length > 0) {
                    onToken(data.token);
                }
            }
        },
        onError,
        onClose: () => {
            // SSE传输完成关闭后
            console.log('SSE Streaming Closed');
        }
    });
}

// 修改后的函数，先 POST 数据，再连接 SSE
export const getPrediction = (question, callback) => {
    // 首先，发送 POST 请求提交 question
    return request({
      url: '/api/predict',
      method: 'post',
      data: {
        question: question
      }
    }).then(response => {
      if (response.code !== 200) {
        console.log('In getPrediction, res:', response)
        throw new Error(response.data.message || "Failed to submit question");
      }
  
      const sseUrl = response.data.sse_url;
      if (!sseUrl) {
        throw new Error("SSE URL not provided by server");
      }
  
      // 使用从 POST 响应中获取的 URL 建立 SSE 连接
      const eventSource = new EventSource( SSE_SERVER + sseUrl);
  
      // 返回一个 Promise，允许外部处理 SSE 事件
      return new Promise((resolve, reject) => {
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // 在这里处理接收到的每个数据块
            console.log("Received SSE data:", data);
  
            // 触发 Vue 组件的更新
            if (typeof callback === 'function') {
              callback(data);
            }
  
            // 如果收到最终完成信号，则关闭连接并 resolve Promise
            if (data.is_final && data.type === 'answer') {
              console.log("SSE stream ended: final answer received.");
              eventSource.close();
              resolve(data); // 或者 resolve(data)，如果需要返回最终数据
            }
          } catch (error) {
            console.error("Error parsing SSE data:", error);
            eventSource.close();
            reject(error);
          }
        };
  
        eventSource.onerror = (error) => {
          console.error("SSE error:", error);
          eventSource.close();
          reject(error);
        };
  
        // 可以设置一个超时
        // setTimeout(() => {
        //   eventSource.close();
        //   reject(new Error('SSE connection timed out'));
        // }, 30000);
      });
    });
  };
  
  

// export const getPrediction = (question) => {
//     return request({
//         url: '/api/predict',
//         method: 'post',
//         data: {
//             question: question
//         }
//     })
// }

export const getEvidence = () => {
    return request({
      url: '/api/evidence',
      method: 'get'
    })
  }