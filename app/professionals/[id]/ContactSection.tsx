'use client';

import { useState } from 'react';
import { ContactPane } from '@/app/components/ContactPane';
import { marked } from 'marked';

interface ContactSectionProps {
    professional: {
        id: number;
        name: string;
        company: string;
    };
    existingConversationId?: number;
    conversationSummary?: string | null;
    hasNewMessages?: boolean;
}

export function ContactSection({
    professional,
    existingConversationId,
    conversationSummary,
    hasNewMessages: initialHasNewMessages = false,
}: ContactSectionProps) {
    const [showContact, setShowContact] = useState(false);
    const [hasNewMessages, setHasNewMessages] = useState(initialHasNewMessages);

    if (showContact) {
        return (
            <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
                <ContactPane
                    professional={professional}
                    onBack={() => setShowContact(false)}
                    initialConversationId={existingConversationId}
                />
            </div>
        );
    }

    return (
        <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '4px',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
            }}>
                {conversationSummary ? (
                    <>
                        {/* Your conversation with the pro module */}
                        <div style={{
                            margin: '0 0 1.5rem 0',
                            padding: '1rem',
                            background: 'var(--primary-light)',
                            borderRadius: '4px',
                            border: '1px solid var(--border-light)',
                            borderLeft: '3px solid var(--primary)'
                        }}>
                            <h4 style={{
                                fontSize: '0.8125rem',
                                fontWeight: 700,
                                color: 'var(--primary-dark)',
                                textTransform: 'uppercase',
                                marginBottom: '0.625rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                letterSpacing: '0.03em',
                            }}>
                                <span style={{ fontSize: '1rem' }}>📋</span>
                                Your conversation with the pro
                                {/* New message indicator */}
                                {hasNewMessages && (
                                    <span style={{
                                        width: '8px',
                                        height: '8px',
                                        background: '#FF4444',
                                        borderRadius: '50%',
                                        boxShadow: '0 0 6px rgba(255, 68, 68, 0.6)',
                                        animation: 'pulse 2s ease-in-out infinite',
                                    }} />
                                )}
                            </h4>
                            <style jsx>{`
                                @keyframes pulse {
                                    0%, 100% { opacity: 1; }
                                    50% { opacity: 0.5; }
                                }
                            `}</style>
                            <div
                                className="conversation-summary"
                                style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--foreground)',
                                    marginBottom: '0',
                                    lineHeight: 1.5,
                                    maxHeight: '80px',
                                    overflow: 'auto',
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: marked.parse(conversationSummary) as string
                                }}
                            />
                            <style jsx>{`
                                .conversation-summary h3 {
                                    font-size: 0.9375rem;
                                    font-weight: 600;
                                    margin: 0 0 0.5rem 0;
                                    color: var(--foreground-dark);
                                }
                                .conversation-summary p {
                                    margin: 0.5rem 0;
                                }
                                .conversation-summary ul {
                                    margin: 0.5rem 0;
                                    padding-left: 1.25rem;
                                }
                                .conversation-summary li {
                                    margin: 0.25rem 0;
                                }
                            `}</style>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                            <button
                                onClick={() => {
                                    setShowContact(true);
                                    // Mark conversation as viewed when opening
                                    if (existingConversationId) {
                                        fetch('/api/contact/mark-viewed', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ conversationId: existingConversationId })
                                        }).then(() => setHasNewMessages(false));
                                    }
                                }}
                                className="btn btn-primary"
                                style={{
                                    flex: 1,
                                    fontSize: '0.9375rem',
                                    padding: '0.75rem 1.5rem',
                                    position: 'relative',
                                }}
                            >
                                Resume Conversation
                                {/* Notification badge for new messages */}
                                {hasNewMessages && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-6px',
                                        right: '-6px',
                                        width: '18px',
                                        height: '18px',
                                        background: '#FF4444',
                                        borderRadius: '50%',
                                        border: '2px solid white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.625rem',
                                        fontWeight: 700,
                                        color: 'white',
                                        boxShadow: '0 2px 4px rgba(255, 68, 68, 0.4)',
                                    }}>
                                        !
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setShowContact(true)}
                                className="btn"
                                style={{
                                    flex: 1,
                                    fontSize: '0.9375rem',
                                    padding: '0.75rem 1.5rem',
                                }}
                            >
                                Start New Conversation
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            marginBottom: '1rem',
                            color: 'var(--foreground-dark)',
                        }}>
                            Get in Touch
                        </h3>
                        <p style={{
                            fontSize: '0.9375rem',
                            lineHeight: 1.6,
                            color: 'var(--foreground)',
                            marginBottom: '1.5rem',
                        }}>
                            Interested in working with {professional.name}? Start a conversation about your project.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowContact(true)}
                            style={{
                                width: '100%',
                                fontSize: '0.9375rem',
                                padding: '0.875rem 1.5rem',
                            }}
                        >
                            Contact Professional
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
