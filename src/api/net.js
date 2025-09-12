// SSE处理流数据
const SSE_SERVER = 'http://localhost:5000';
export function createSSE(url, {
    onMessage = () => {},
    onError = (error) => console.error('SSE Error:', error),
    onOpen = () => {},
    onClose = () => {},
    withCredentials = false
} = {}) {
    let eventSource = null;
    let isClosed = false;
    let buffer = '';
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
            close: () => {},
            isOpen: false,
            isConnecting: false,
            isClosed: true
        };
    }
}

// AI推理流式响应的SSE客户端
export function createAIStreamingClient(url='http://localhost:5000/api/stream', {
    onToken = () => {},
    onComplete = () => {
    },
    onError = (error) => console.error('AI Streaming Error:', error)
} = {}) {
    let lastToken = '';

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