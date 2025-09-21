/********************************************************************
 *  AI植物医生 - 高级调用系统
 *  ✅ 精确匹配扣子工作流参数
 *  ✅ workflow_id: 7533122299790131236
 *  ✅ space_id: 7531597653369651209
 *  ✅ 参数: picture + position
 *******************************************************************/
const CONFIG = {
    apiKey: 'pat_x5qZkcUkmMbSW1bYkgr6kmtGVQdff5JLKIWnFddlDvRvaq0dkLYZ9FnXKFHyhBTN',
    workflowId: '7533122299790131236',
    spaceId: '7531597653369651209',
    baseUrl: 'https://api.coze.cn/v1/workflow/run'
};

/* ---------- 高级调用系统 ---------- */
async function submitWorkflow() {
    const picture = document.getElementById('picture').value.trim();
    const position = document.getElementById('position').value.trim();
    
    if (!picture || !position) {
        showError('请填写完整信息');
        return;
    }

    // 验证URL格式
    try {
        new URL(picture);
    } catch {
        showError('请输入有效的图片URL');
        return;
    }

    showLoading(true);
    hideAllResults();

    try {
        console.log('🎯 开始调用AI植物医生...');
        console.log('📎 图片URL:', picture);
        console.log('🌿 植物部位:', position);

        // 构建精确参数
        const payload = {
            workflow_id: CONFIG.workflowId,
            space_id: CONFIG.spaceId,
            parameters: {
                picture: picture,  // ✅ 精确参数名
                position: position  // ✅ 精确参数名
            }
        };

        console.log('🚀 发送请求:', payload);

        const response = await fetch(CONFIG.baseUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('📥 工作流返回:', result);

        if (result.code === 0) {
            // 智能解析返回数据
            const output = extractSmartOutput(result.data);
            showSuccess(output, position, picture);
        } else {
            showError(result.msg || '工作流调用失败');
        }
        
    } catch (error) {
        console.error('❌ 调用失败:', error);
        showError('网络错误，请检查连接');
    } finally {
        showLoading(false);
    }
}

/* ---------- 智能输出解析 ---------- */
function extractSmartOutput(data) {
    if (!data) return '工作流执行成功，但未返回识别内容';
    
    console.log('🔍 解析数据结构:', data);
    
    // 处理用户提供的实际数据结构
    if (data.sentence && data.solution) {
        // 直接返回solution作为主要内容
        return data.solution;
    }
    
    // 处理嵌套结构
    if (data.output) {
        const outputData = data.output;
        if (typeof outputData === 'string') {
            try {
                const parsed = JSON.parse(outputData);
                if (parsed.solution) return parsed.solution;
                if (parsed.answer) return parsed.answer;
            } catch (e) {
                return outputData;
            }
        } else if (typeof outputData === 'object') {
            if (outputData.solution) return outputData.solution;
            if (outputData.answer) return outputData.answer;
            return JSON.stringify(outputData, null, 2);
        }
    }
    
    // 其他可能的输出字段
    const outputFields = [
        'solution', 'answer', 'result', 'text', 'content',
        'output', 'plant_name', 'description', '识别结果'
    ];
    
    for (const field of outputFields) {
        if (data[field] !== undefined) {
            return String(data[field]);
        }
    }
    
    // 对象转字符串
    if (typeof data === 'object') {
        return JSON.stringify(data, null, 2);
    }
    
    return String(data);
}

/* ---------- UI控制函数 ---------- */
function showLoading(show) {
    const loading = document.getElementById('loading');
    const button = document.querySelector('.submit-btn');
    
    if (show) {
        loading.style.display = 'block';
        button.querySelector('.btn-text').style.display = 'none';
        button.querySelector('.btn-loader').style.display = 'block';
        button.disabled = true;
    } else {
        loading.style.display = 'none';
        button.querySelector('.btn-text').style.display = 'block';
        button.querySelector('.btn-loader').style.display = 'none';
        button.disabled = false;
    }
}

function showSuccess(output, position, picture) {
    hideAllResults();
    
    // 格式化输出内容，处理emoji和换行
    const formattedOutput = formatPlantAdvice(output);
    
    document.getElementById('resultPosition').textContent = position;
    document.getElementById('resultOutput').innerHTML = formattedOutput;
    document.getElementById('resultImage').src = picture;
    document.getElementById('resultTime').textContent = new Date().toLocaleString('zh-CN');
    
    document.getElementById('resultSection').style.display = 'block';
    
    // 滚动到结果区域
    document.getElementById('resultSection').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
}

/* ---------- 内容格式化 ---------- */
function formatPlantAdvice(text) {
    if (!text || text === null || text === undefined) {
        return `
            <div class="advice-section error-section">
                <div class="section-header">
                    <span class="section-icon">⚠️</span>
                    <h5>数据提示</h5>
                </div>
                <div class="section-content">
                    <p>暂时无法获取植物信息，请检查：</p>
                    <ul>
                        <li>图片URL是否正确可访问</li>
                        <li>网络连接是否正常</li>
                        <li>稍后重试获取结果</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    // 安全处理输入
    const safeText = String(text).trim();
    
    // 分离sentence和solution - 增强鲁棒性
    let sentenceText = '';
    let solutionText = '';
    
    try {
        // 尝试解析JSON格式
        if (safeText.includes('"sentence"') && safeText.includes('"solution"')) {
            const data = JSON.parse(safeText);
            sentenceText = data.sentence || '';
            solutionText = data.solution || '';
        } 
        // 尝试解析对象格式
        else if (safeText.includes('sentence:') && safeText.includes('solution:')) {
            const match = safeText.match(/sentence:\s*"?([^",\n]*)"?/i);
            sentenceText = match ? match[1] : '';
            
            const solMatch = safeText.match(/solution:\s*"?([^"]*)"?/i);
            solutionText = solMatch ? solMatch[1] : safeText;
        }
        // 尝试解析键值对格式
        else if (safeText.includes('sentence=') && safeText.includes('solution=')) {
            const match = safeText.match(/sentence=([^&\n]*)/i);
            sentenceText = match ? match[1] : '';
            
            const solMatch = safeText.match(/solution=([^&\n]*)/i);
            solutionText = solMatch ? solMatch[1] : safeText;
        }
        // 普通文本格式
        else {
            const lines = safeText.split('\n').filter(line => line && line.trim());
            if (lines.length >= 2) {
                sentenceText = lines[0] || '';
                solutionText = lines.slice(1).join('\n') || safeText;
            } else {
                // 如果只有一行，判断是诗句还是建议
                const lowerText = safeText.toLowerCase();
                if (lowerText.includes('云') || lowerText.includes('枝') || lowerText.includes('叶')) {
                    sentenceText = safeText;
                    solutionText = '暂无详细养护建议';
                } else {
                    sentenceText = '植物识别成功';
                    solutionText = safeText;
                }
            }
        }
    } catch (error) {
        // 解析失败时，使用原始文本
        console.warn('解析失败，使用原始文本', error);
        sentenceText = '植物识别完成';
        solutionText = safeText;
    }
    
    // 确保有默认值
    sentenceText = sentenceText || '植物识别成功';
    solutionText = solutionText || '暂无详细养护建议';
    
    // 清理特殊字符
    const cleanText = (str) => {
        return str
            .replace(/[\u200b-\u200f\u202a-\u202e]/g, '')
            .replace(/[😎😏😜👀💧🌞🌡️🍶🐛🪴]/g, '')
            .replace(/[！？。，；：]/g, match => {
                if (match === '！' || match === '？') return '!';
                if (match === '。' || match === '；') return '.';
                if (match === '，') return ',';
                if (match === '：') return ':';
                return match;
            })
            .replace(/\s+/g, ' ')
            .replace(/(\d+)\s*℃/g, '$1°C')
            .replace(/(\d+)\s*ml/g, '$1ml')
            .trim();
    };
    
    sentenceText = cleanText(sentenceText);
    solutionText = cleanText(solutionText);
    
    if (!sentenceText && !solutionText) {
        return '<div class="advice-section"><div class="section-content">暂无详细建议</div></div>';
    }
    
    let html = '';
    
    // 显示诗句
    if (sentenceText) {
        html += `
            <div class="advice-section poem-section">
                <div class="section-header">
                    <span class="section-icon">🌸</span>
                    <h5>植物诗句</h5>
                </div>
                <div class="section-content poem-text">
                    ${sentenceText.replace(/\n/g, '<br>')}
                </div>
            </div>
        `;
    }
    
    // 显示养护建议
    if (solutionText) {
        // 按图标分段
        const sections = [
            { icon: '🌼', title: '开花期', keyword: '开花' },
            { icon: '💧', title: '浇水管理', keyword: '浇水' },
            { icon: '🌞', title: '光照要求', keyword: '光照' },
            { icon: '🌡️', title: '温度控制', keyword: '温度' },
            { icon: '💨', title: '通风管理', keyword: '通风' },
            { icon: '🍶', title: '施肥建议', keyword: '施肥' },
            { icon: '🩹', title: '病虫害', keyword: '虫' },
            { icon: '🪴', title: '换土养护', keyword: '换土' }
        ];
        
        let processedSolution = solutionText;
        
        // 智能分段
        sections.forEach(section => {
            const regex = new RegExp(`([^。！.]*)${section.keyword}[^。！.]*[。！.]`, 'gi');
            const matches = processedSolution.match(regex);
            if (matches) {
                const content = matches.join(' ').trim();
                if (content) {
                    html += `
                        <div class="advice-section">
                            <div class="section-header">
                                <span class="section-icon">${section.icon}</span>
                                <h5>${section.title}</h5>
                            </div>
                            <div class="section-content">
                                ${content.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                    `;
                    processedSolution = processedSolution.replace(regex, '');
                }
            }
        });
        
        // 剩余内容
        if (processedSolution.trim()) {
            html += `
                <div class="advice-section">
                    <div class="section-header">
                        <span class="section-icon">🌱</span>
                        <h5>其他建议</h5>
                    </div>
                    <div class="section-content">
                        ${processedSolution.replace(/\n/g, '<br>')}
                    </div>
                </div>
            `;
        }
    }
    
    return html;
}

function formatGeneralContent(content) {
    return content
        .replace(/([。！？；])/g, '$1<br><br>')
        .replace(/(\d+[℃小时分钟ml倍])/g, '<span class="highlight">$1</span>')
        .replace(/(每天|每\d+天|每\d+周)/g, '<strong>$1</strong>');
}

function findNextSectionStart(text, currentPos, sections) {
    const positions = sections.map(section => {
        const pos = text.indexOf(`${section.icon}【${section.title}】`, currentPos);
        return pos !== -1 ? pos : Infinity;
    });
    const minPos = Math.min(...positions);
    return minPos === Infinity ? null : minPos;
}

function formatSectionContent(content, title) {
    // 处理项目符号和列表
    content = content
        .replace(/([；。])/g, '$1<br>')
        .replace(/(\d+周|每天|每\d+天|每\d+周)/g, '<br><strong>$1</strong>')
        .replace(/(\d+℃|≥\d+|≤\d+)/g, '<span class="highlight">$1</span>')
        .replace(/(\d+小时|\d+分钟|\d+ml|\d+倍)/g, '<span class="highlight">$1</span>')
        .replace(/(上午\d+点前|下午\d+点后)/g, '<span class="time">$1</span>')
        .replace(/(南向阳台|东向阳台|西向阳台)/g, '<span class="location">$1</span>')
        .replace(/(别|不要|切忌)/g, '<span class="warning">$1</span>');
    
    return content;
}

function showError(message) {
    hideAllResults();
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorSection').style.display = 'block';
}

function hideAllResults() {
    document.getElementById('errorSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
}

/* ---------- 初始化 ---------- */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 AI植物医生已启动');
    console.log('✅ 工作流配置已加载');
    console.log('🎯 准备识别植物...');
});
