
import type { SystemInstruction } from '../types';

const STORAGE_KEY = 'yt_macgyver_instructions';

const defaultInstructions: SystemInstruction[] = [
    {
        id: 'default',
        name: '기본 (유튜브 전문가)',
        content: '당신은 세계 최고의 유튜브 데이터 분석가이자 전략가입니다. 데이터를 기반으로 명확하고 통찰력 있는 분석을 제공하며, 크리에이터의 성장을 돕는 구체적인 조언을 합니다. 전문적인 용어를 사용하되 이해하기 쉽게 설명합니다.',
        isActive: true
    },
    {
        id: 'witty',
        name: '재치있는 입담꾼',
        content: '당신은 유머 감각이 뛰어나고 비유를 즐겨 사용하는 유튜브 컨설턴트입니다. 딱딱한 데이터 분석보다는 재미있고 기억에 남는 표현으로 조언을 건넵니다. 친구처럼 친근하게 대화하듯 분석 결과를 전달하세요. 시적이고 문학적인 표현을 즐겨 씁니다.',
        isActive: false
    },
    {
        id: 'critic',
        name: '냉철한 독설가',
        content: '당신은 냉철하고 직설적인 비평가입니다. 채널의 문제점을 가감 없이 지적하고, 뼈를 때리는 조언을 서슴지 않습니다. 칭찬보다는 개선점에 집중하여 크리에이터가 정신을 차리고 성장할 수 있도록 강하게 밀어붙입니다. 불필요한 미사여구는 생략하고 핵심만 찌르세요.',
        isActive: false
    },
    {
        id: 'teacher',
        name: '친절한 선생님',
        content: '당신은 초보자도 쉽게 이해할 수 있도록 친절하게 설명해주는 선생님입니다. 어려운 개념은 풀어서 설명하고, 격려와 응원을 아끼지 않습니다. 구체적인 예시를 들어 설명하는 것을 좋아합니다.',
        isActive: false
    }
];

export const getInstructions = (): SystemInstruction[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultInstructions));
        return defaultInstructions;
    }
    return JSON.parse(stored);
};

export const saveInstructions = (instructions: SystemInstruction[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(instructions));
};

export const getActiveInstruction = (): SystemInstruction => {
    const instructions = getInstructions();
    return instructions.find(i => i.isActive) || instructions[0];
};

export const setActiveInstruction = (id: string) => {
    const instructions = getInstructions();
    const updated = instructions.map(i => ({
        ...i,
        isActive: i.id === id
    }));
    saveInstructions(updated);
};

export const addInstruction = (name: string, content: string) => {
    const instructions = getInstructions();
    const newInstruction: SystemInstruction = {
        id: Date.now().toString(),
        name,
        content,
        isActive: false
    };
    saveInstructions([...instructions, newInstruction]);
};

export const updateInstruction = (id: string, name: string, content: string) => {
    const instructions = getInstructions();
    const updated = instructions.map(i => 
        i.id === id ? { ...i, name, content } : i
    );
    saveInstructions(updated);
};

export const deleteInstruction = (id: string) => {
    let instructions = getInstructions();
    const toDelete = instructions.find(i => i.id === id);
    
    // 기본 지침 중 'default'는 삭제 불가하도록 하거나, 삭제 후 로직 처리
    if (id === 'default') {
        alert('기본 지침은 삭제할 수 없습니다.');
        return;
    }

    instructions = instructions.filter(i => i.id !== id);
    
    // 만약 활성화된 지침을 삭제했다면, 기본값을 활성화
    if (toDelete?.isActive && instructions.length > 0) {
        const defaultIdx = instructions.findIndex(i => i.id === 'default');
        if (defaultIdx !== -1) {
            instructions[defaultIdx].isActive = true;
        } else {
            instructions[0].isActive = true;
        }
    } else if (instructions.length === 0) {
        instructions = defaultInstructions;
    }
    
    saveInstructions(instructions);
};
