'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';

interface ContactPaneProps {
    professional: {
        id: number;
        name: string;
        company: string;
    };
    onBack: () => void;
    initialConversationId?: number;
}

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
}

export function ContactPane({ professional, onBack, initialConversationId }: ContactPaneProps) {
    const [view, setView] = useState<'initial' | 'chat'>('initial');
    const [inputValue, setInputValue] = useState('');
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeSuggestions, setActiveSuggestions] = useState<string[]>([]);
    const [projectSummary, setProjectSummary] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isSufficient, setIsSufficient] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prevMessageCountRef = useRef<number>(0);

    // Initial Message Suggestion
    const defaultMessage = `Hi ${professional.name}, I'm interested in discussing a design project for my home.`;

    useEffect(() => {
        if (initialConversationId) {
            setConversationId(initialConversationId);
            setView('chat');

            // Fetch conversation history using professional ID
            const fetchData = async () => {
                try {
                    const data = await api.contact.latest(professional.id);

                    if (data.conversation) {
                        setMessages(data.conversation.messages);
                        setProjectSummary(data.conversation.last_summary || null);
                        // Set the initial message count without triggering scroll
                        prevMessageCountRef.current = data.conversation.messages.length;
                    }
                } catch (error) {
                    console.error('Failed to fetch conversation history:', error);
                }
            };

            fetchData();
        } else if (view === 'initial') {
            setInputValue(defaultMessage);
        }
    }, [view, defaultMessage, professional.name, professional.id, initialConversationId]);

    // Auto-scroll to bottom of chat only when new messages are added
    useEffect(() => {
        if (messages.length > prevMessageCountRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        prevMessageCountRef.current = messages.length;
    }, [messages]);

    const handleSendInitial = async () => {
        if (!inputValue.trim()) return;
        setIsSending(true);

        try {
            const data = await api.contact.init({
                professionalId: professional.id,
                message: inputValue
            });

            setConversationId(data.id);
            setMessages(data.messages);
            setActiveSuggestions(data.suggestions || []);
            setProjectSummary(data.projectSummary || null);
            setIsSufficient(data.isSufficient || false);
            setView('chat');
            setInputValue('');
        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleSendChat = async (overrideMessage?: string) => {
        const messageToSend = overrideMessage || inputValue;
        if (!messageToSend.trim() || !conversationId) return;

        // Optimistic Update
        const tempMsg: Message = { id: Date.now(), role: 'user', content: messageToSend };
        setMessages(prev => [...prev, tempMsg]);
        if (!overrideMessage) setInputValue('');
        setActiveSuggestions([]); // Clear suggestions while sending
        setIsSending(true);

        try {
            const data = await api.contact.chat({
                conversationId,
                message: tempMsg.content
            });

            setMessages(prev => [...prev, data.message]);
            setActiveSuggestions(data.suggestions || []);
            setProjectSummary(data.projectSummary || null);
            setIsSufficient(data.isSufficient);
        } catch (error) {
            console.error('Failed to send chat', error);
        } finally {
            setIsSending(false);
        }
    };

    if (view === 'initial') {
        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
                    <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.5rem', fontSize: '1.2rem' }}>←</button>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Message {professional.name}&apos;s Assistant</h3>
                </div>

                <div style={{ padding: '1.25rem', flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Start a conversation to discuss your project requirements.
                    </p>
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        style={{
                            width: '100%',
                            height: '150px',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '0.875rem',
                            fontFamily: 'inherit',
                            resize: 'none',
                            marginBottom: '1rem'
                        }}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={handleSendInitial}
                        disabled={isSending}
                        style={{ width: '100%', padding: '0.75rem' }}
                    >
                        {isSending ? 'Sending Message...' : 'Send Message'}
                    </button>

                    {isSending && (
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            textAlign: 'center',
                            animation: 'pulse 2s infinite ease-in-out'
                        }}>
                            <p style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>
                                Transitioning to a creative chat with our design assistant...
                            </p>
                            <style>{`
                                @keyframes pulse {
                                    0% { opacity: 0.6; }
                                    50% { opacity: 1; }
                                    100% { opacity: 0.6; }
                                }
                            `}</style>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', background: '#f9f9f9' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.5rem', fontSize: '1.2rem' }}>←</button>
                <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Assistant for {professional.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '6px', height: '6px', background: '#ccc', borderRadius: '50%' }}></span>
                        AI Representative
                    </div>
                </div>
            </div>

            {/* Manual Summary Review Toggle */}
            {!isSufficient && projectSummary && (
                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)', background: '#fff', position: 'relative' }}>
                    <button
                        onClick={() => setShowSummary(!showSummary)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: showSummary ? '#f1f5f9' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.625rem',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            animation: !showSummary ? 'briefPulse 2s infinite ease-in-out' : 'none'
                        }}
                    >
                        <span style={{ fontSize: '1.1rem' }}>📋</span>
                        {showSummary ? 'Hide Project Brief' : 'Review My Project Brief'}
                        {!showSummary && (
                            <span style={{
                                width: '8px',
                                height: '8px',
                                background: '#f59e0b',
                                borderRadius: '50%',
                                display: 'inline-block'
                            }}></span>
                        )}
                    </button>

                    <style>{`
                        @keyframes briefPulse {
                            0% { transform: scale(1); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                            50% { transform: scale(1.02); box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.1); border-color: var(--primary); }
                            100% { transform: scale(1); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                        }
                    `}</style>

                    {showSummary && (
                        <div style={{
                            marginTop: '0.75rem',
                            padding: '1rem',
                            background: 'white',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            animation: 'slideDown 0.2s ease-out'
                        }}>
                            <style>{`
                                @keyframes slideDown {
                                    from { opacity: 0; transform: translateY(-10px); }
                                    to { opacity: 1; transform: translateY(0); }
                                }
                            `}</style>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#718096', marginBottom: '0.5rem' }}>Current Project Brief</h4>
                            <div
                                style={{ fontSize: '0.8125rem', color: '#2d3748', marginBottom: '1rem' }}
                                dangerouslySetInnerHTML={{ __html: projectSummary }}
                            />
                            <button
                                onClick={() => alert("Brief sent to " + professional.name)}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '0.8125rem'
                                }}
                            >
                                Send this Brief to {professional.name}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Chat History */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#fff', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className="chat-message"
                        style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            padding: '0.75rem',
                            borderRadius: '12px',
                            background: msg.role === 'user' ? 'var(--primary)' : '#f0f0f0',
                            color: msg.role === 'user' ? '#fff' : '#000',
                            fontSize: '0.875rem',
                            borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                            borderTopLeftRadius: msg.role === 'assistant' ? '2px' : '12px'
                        }}
                    >
                        {msg.content}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Answers Area */}
            {!isSufficient && activeSuggestions.length > 0 && (
                <div style={{
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.625rem',
                    background: '#fff',
                    borderTop: '1px solid var(--border-color)',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(5px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                    {activeSuggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => handleSendChat(suggestion)}
                            disabled={isSending}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                                color: '#475569',
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary)';
                                e.currentTarget.style.color = 'var(--primary)';
                                e.currentTarget.style.background = '#fff';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.color = '#475569';
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                            }}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: '#fff' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                        placeholder="Type a message..."
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            borderRadius: '20px',
                            border: '1px solid #ddd',
                            fontSize: '0.875rem',
                            outline: 'none'
                        }}
                    />
                    <button
                        onClick={() => handleSendChat()}
                        disabled={!inputValue.trim() || isSending}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ↑
                    </button>
                </div>
            </div>
        </div>
    );
}
